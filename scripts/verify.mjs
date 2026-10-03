#!/usr/bin/env node
// Offline documentation checks. Run explicitly; never imports Wix or contacts a provider.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');
const checks = [];
const documents = new Map();
const counts = { markdownFiles: 0, internalLinks: 0, javascriptFragments: 0, mockedCases: 0 };

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, status: 'passed' });
  } catch (error) {
    checks.push({ name, status: 'failed', message: error.message });
  }
}

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.') || ['node_modules', 'verification-results'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(absolute);
    else if (entry.isFile() && entry.name.endsWith('.md')) {
      documents.set(path.relative(root, absolute), readFileSync(absolute, 'utf8'));
    }
  }
}

// Handles the handbook's ATX headings, inline links, and fenced examples.
// This is intentionally not a general Markdown renderer or external-link checker.
function parseMarkdown(text, file) {
  const prose = [];
  const blocks = [];
  const errors = [];
  let fence;
  text.split('\n').forEach((line, index) => {
    const lineNumber = index + 1;
    if (/[\t ]+$/.test(line)) errors.push(`${file}:${lineNumber}: trailing whitespace`);
    if (fence) {
      const closing = new RegExp(`^ {0,3}${fence.character}{${fence.length},}\\s*$`);
      if (closing.test(line)) {
        blocks.push({ language: fence.language, code: fence.lines.join('\n'), line: fence.line });
        fence = undefined;
      } else fence.lines.push(line);
      return;
    }
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (opening) {
      fence = { character: opening[1][0], length: opening[1].length, language: opening[2].trim(), line: lineNumber, lines: [] };
    } else prose.push({ line, lineNumber });
  });
  if (fence) errors.push(`${file}:${fence.line}: unclosed code fence`);
  const anchors = new Set();
  for (const { line } of prose) {
    const heading = line.match(/^ {0,3}#{1,6}\s+(.+?)(?:\s+#+)?$/);
    if (!heading) continue;
    const base = heading[1].toLowerCase().replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu, '').replace(/\s/g, '-');
    let anchor = base;
    let suffix = 0;
    while (anchors.has(anchor)) anchor = `${base}-${++suffix}`;
    anchors.add(anchor);
  }
  return { prose, blocks, anchors, errors };
}

const parsed = new Map();
const manual = 'the-missing-manual-to-velo.md';
const recipes = 'velo-for-fun-and-profit.md';

function example(file, marker) {
  const matches = parsed.get(file)?.blocks.filter(block => block.language === 'js' && block.code.includes(marker)) ?? [];
  assert.equal(matches.length, 1, `Expected one ${marker} example in ${file}`);
  return matches[0].code;
}

function loadExample(file, marker, imports, exportName, bindings) {
  let source = example(file, marker);
  for (const declaration of imports) {
    assert.equal(source.split(declaration).length - 1, 1, `Example import changed: ${declaration}`);
    source = source.replace(declaration, '');
  }
  source = source.replace(/^export /gm, '');
  return new vm.Script(`${source}\n${exportName};`, { filename: file })
    .runInNewContext(bindings, { timeout: 1000 });
}

function transport(fetch) {
  return loadExample(recipes, '// backend/crmTransport.js', ["import { fetch } from 'wix-fetch';"], 'sendContact', { fetch });
}

const plain = value => JSON.parse(JSON.stringify(value));
const payload = { apiKey: 'synthetic-key', email: 'reader@example.invalid', actionKey: 'synthetic-action' };

function orders(member) {
  const calls = [];
  const rows = ['member-a', 'member-b'].flatMap(memberId => Array.from({ length: 60 }, (_, index) => ({
    _id: `${memberId}-${index}`, memberId, _createdDate: index, total: index + 1, status: 'paid', privateNote: 'must not leave backend',
  })));
  let declaredPermission;
  const Permissions = { SiteMember: 'site-member', Anyone: 'anyone', Admin: 'admin' };
  const wixData = {
    query(collection) {
      calls.push(['query', collection]);
      let selected = rows;
      return {
        eq(field, value) { calls.push(['eq', field, value]); selected = selected.filter(row => row[field] === value); return this; },
        descending(field) { calls.push(['descending', field]); selected = [...selected].sort((a, b) => b[field] - a[field]); return this; },
        limit(size) { calls.push(['limit', size]); selected = selected.slice(0, size); return this; },
        async find(options) { calls.push(['find', plain(options)]); return { items: selected }; },
      };
    },
  };
  const run = loadExample(manual, '// backend/orders.web.js', [
    "import { Permissions, webMethod } from 'wix-web-module';",
    "import { currentMember } from 'wix-members-backend';",
    "import wixData from 'wix-data';",
  ], 'getMyRecentOrders', {
    Permissions, wixData,
    currentMember: { async getMember() { return member; } },
    // Captures the declared permission; it cannot enforce Wix authentication.
    webMethod(permission, handler) { declaredPermission = permission; return handler; },
  });
  assert.equal(declaredPermission, Permissions.SiteMember);
  return { run, calls };
}

async function main() {
  assert.ok(Number(process.versions.node.split('.')[0]) >= 20, 'Use Node.js 20 or later.');
  collect(root);
  counts.markdownFiles = documents.size;
  for (const [file, text] of documents) parsed.set(file, parseMarkdown(text, file));
  await check('Markdown fences, whitespace, relative links, and heading anchors', () => {
    assert.ok(documents.size > 0, 'No Markdown files found');
    const errors = [];
    for (const [file, document] of parsed) {
      errors.push(...document.errors);
      for (const { line, lineNumber } of document.prose) {
        for (const match of line.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
          const target = match[1];
          if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('//')) continue;
          counts.internalLinks++;
          try {
            const [rawPath, rawAnchor] = target.split('#');
            const destination = path.resolve(root, path.dirname(file), decodeURIComponent(rawPath || path.basename(file)));
            const relative = path.relative(root, destination);
            assert.ok(relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative), 'link leaves handbook');
            assert.ok(existsSync(destination) && statSync(destination).isFile(), 'missing target file');
            if (rawAnchor && parsed.has(relative)) assert.ok(parsed.get(relative).anchors.has(decodeURIComponent(rawAnchor)), 'missing heading anchor');
          } catch (error) { errors.push(`${file}:${lineNumber}: ${target}: ${error.message}`); }
        }
      }
    }
    assert.equal(errors.length, 0, errors.join('\n'));
  });
  for (const [file, document] of parsed) {
    for (const block of document.blocks.filter(item => ['js', 'javascript'].includes(item.language))) {
      counts.javascriptFragments++;
      await check(`JavaScript syntax: ${file}:${block.line}`, () => {
        const result = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: block.code, encoding: 'utf8', timeout: 10000 });
        assert.ifError(result.error);
        assert.equal(result.status, 0, result.stderr || 'Syntax check did not finish successfully');
      });
    }
  }
  for (const status of [200, 202, 400, 401, 429, 500]) {
    counts.mockedCases++;
    await check(`CRM HTTP ${status}`, async () => {
      let requests = 0;
      const send = transport(async (url, options) => {
        requests++;
        assert.equal(url, 'https://crm.example.com/v1/contacts');
        assert.equal(options.method, 'POST');
        assert.equal(options.headers.authorization, `Bearer ${payload.apiKey}`);
        assert.equal(options.headers['idempotency-key'], payload.actionKey);
        assert.equal(options.headers['content-type'], 'application/json');
        assert.deepEqual(JSON.parse(options.body), { email: payload.email });
        return { ok: status >= 200 && status < 300, status };
      });
      if (status < 300) assert.deepEqual(plain(await send(payload)), { httpAccepted: true, status });
      else await assert.rejects(() => send(payload), error => error.message === `CRM HTTP failure: ${status}`);
      assert.equal(requests, 1);
    });
  }
  counts.mockedCases++;
  await check('CRM network rejection propagates', async () => {
    const failure = new Error('Synthetic network failure');
    const send = transport(async () => { throw failure; });
    await assert.rejects(() => send(payload), error => error === failure);
  });
  for (const memberId of ['member-a', 'member-b']) {
    counts.mockedCases++;
    await check(`Orders isolate and bound ${memberId} results`, async () => {
      const fixture = orders({ _id: memberId });
      const result = plain(await fixture.run());
      assert.deepEqual(fixture.calls, [
        ['query', 'Orders'], ['eq', 'memberId', memberId], ['descending', '_createdDate'], ['limit', 50], ['find', { suppressAuth: true }],
      ]);
      assert.deepEqual(result, Array.from({ length: 50 }, (_, index) => ({ id: `${memberId}-${59 - index}`, total: 60 - index, status: 'paid' })));
    });
  }
  for (const [label, member] of [['missing', undefined], ['invalid', {}]]) {
    counts.mockedCases++;
    await check(`Orders reject ${label} member before data access`, async () => {
      const fixture = orders(member);
      await assert.rejects(() => fixture.run(), error => error.message === 'Not signed in');
      assert.deepEqual(fixture.calls, []);
    });
  }
  const failed = checks.filter(item => item.status === 'failed');
  const report = {
    createdAt: new Date().toISOString(), status: failed.length ? 'failed' : 'passed', nodeVersion: process.version,
    counts, checks,
    scope: 'Offline Markdown checks, snippet syntax, and controlled mocks. No live Wix authentication, import resolution, rendering, provider, or deployment verification. No external URL availability check.',
    sourceHashes: Object.fromEntries([...documents, ['scripts/verify.mjs', readFileSync(scriptPath, 'utf8')]].map(([name, text]) => [name, createHash('sha256').update(text).digest('hex')])),
  };
  const reportDirectory = path.join(root, 'verification-results');
  mkdirSync(reportDirectory, { recursive: true });
  const reportPath = path.join(reportDirectory, `${report.createdAt.replace(/[:.]/g, '-')}-${process.pid}.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  for (const failure of failed) console.error(`FAIL ${failure.name}\n${failure.message}`);
  console.log(`${failed.length ? 'FAIL' : 'PASS'}: ${checks.length - failed.length}/${checks.length} checks; ${counts.markdownFiles} Markdown files; ${counts.internalLinks} internal links; ${counts.javascriptFragments} JS fragments; ${counts.mockedCases} mocked cases.`);
  console.log(`Evidence: ${reportPath}`);
  console.log('Scope: offline checks only; live Wix/provider behavior remains unverified.');
  process.exitCode = failed.length ? 1 : 0;
}

main().catch(error => { console.error(`Verification could not finish: ${error.message}`); process.exitCode = 1; });
