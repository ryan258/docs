#!/usr/bin/env node
// Optional offline syntax check. Uses an existing TypeScript installation;
// never installs packages, resolves Wix imports, builds Astro, or calls Wix.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');
const require = createRequire(import.meta.url);

function compiler() {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 2 && args[0] === '--typescript'),
    'Usage: node scripts/verify-frameworks.mjs [--typescript /path/to/typescript/lib/typescript.js]');
  if (args.length) return require(path.resolve(args[1]));
  try { return require('typescript'); } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
  }
  for (const directory of (process.env.PATH ?? '').split(path.delimiter)) {
    if (!directory) continue;
    const executable = path.join(directory, 'tsc');
    if (!existsSync(executable)) continue;
    const candidate = path.resolve(path.dirname(realpathSync(executable)), '../lib/typescript.js');
    if (existsSync(candidate)) return require(candidate);
  }
  throw new Error('TypeScript is not installed locally or available through tsc on PATH. Supply its existing module with --typescript. No packages were downloaded.');
}

function collect(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...collect(absolute));
    else if (/\.(tsx|[cm]?ts|astro)$/.test(entry.name)) found.push(absolute);
  }
  return found.sort();
}

function parseSyntax(ts, file, code, kind) {
  const parsed = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, kind);
  const diagnostics = parsed.parseDiagnostics;
  assert.equal(diagnostics.length, 0, diagnostics.map(item => {
    const position = parsed.getLineAndCharacterOfPosition(item.start ?? 0);
    return `${file}:${position.line + 1}: ${ts.flattenDiagnosticMessageText(item.messageText, '\n')}`;
  }).join('\n'));
}

try {
  const ts = compiler();
  const files = collect(path.join(root, 'examples'));
  assert.ok(files.length > 0, 'No framework example source files found');
  const checks = [];
  const sourceHashes = {};
  for (const absolute of files) {
    const file = path.relative(root, absolute);
    const source = readFileSync(absolute, 'utf8');
    sourceHashes[file] = createHash('sha256').update(source).digest('hex');
    const isAstro = file.endsWith('.astro');
    const name = `${isAstro ? 'Astro frontmatter syntax only' : 'TypeScript/TSX syntax'}: ${file}`;
    try {
      let code = source;
      if (isAstro) {
        const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
        assert.ok(frontmatter, 'Expected a complete leading Astro frontmatter block');
        code = frontmatter[1];
      }
      parseSyntax(ts, isAstro ? `${file}.ts` : file, code,
        file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      checks.push({ name, status: 'passed' });
    } catch (error) {
      checks.push({ name, status: 'failed', message: error.message });
    }
  }
  for (const file of ['05-app-development.md', '06-headless.md']) {
    const source = readFileSync(path.join(root, file), 'utf8');
    sourceHashes[file] = createHash('sha256').update(source).digest('hex');
    const blocks = [...source.matchAll(/^~~~(tsx|ts)\s*\r?\n([\s\S]*?)\r?\n~~~\s*$/gm)];
    for (const [index, block] of blocks.entries()) {
      const name = `Markdown ${block[1]} syntax: ${file} block ${index + 1}`;
      try {
        parseSyntax(ts, `${file}.${block[1]}`, block[2], block[1] === 'tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
        checks.push({ name, status: 'passed' });
      } catch (error) {
        checks.push({ name, status: 'failed', message: error.message });
      }
    }
  }
  sourceHashes['scripts/verify-frameworks.mjs'] = createHash('sha256').update(readFileSync(scriptPath)).digest('hex');
  const failures = checks.filter(item => item.status === 'failed');
  const report = {
    createdAt: new Date().toISOString(), status: failures.length ? 'failed' : 'passed',
    nodeVersion: process.version, typescriptVersion: ts.version, checks, sourceHashes,
    scope: 'TypeScript/TSX source and chapter snippet parser diagnostics, plus Astro frontmatter parser diagnostics only. Does not compile Astro templates, type-check against SDK declarations, resolve imports, render components, call Wix, build or deploy a project.',
  };
  const directory = path.join(root, 'verification-results');
  mkdirSync(directory, { recursive: true });
  const reportPath = path.join(directory, `frameworks-${report.createdAt.replace(/[:.]/g, '-')}-${process.pid}.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  for (const failure of failures) console.error(`FAIL ${failure.name}\n${failure.message}`);
  console.log(`${failures.length ? 'FAIL' : 'PASS'}: ${checks.length - failures.length}/${checks.length} framework syntax checks; TypeScript ${ts.version}.`);
  console.log(`Evidence: ${reportPath}`);
  console.log(`Scope: ${report.scope}`);
  process.exitCode = failures.length ? 1 : 0;
} catch (error) {
  console.error(`Framework syntax verification could not finish: ${error.message}`);
  process.exitCode = 1;
}
