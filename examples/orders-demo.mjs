#!/usr/bin/env node
// Reads a local fixture and prints the recipe's view model. No writes/network.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { toOrderRows } from './order-presentation.mjs';

try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args[0]?.startsWith('--') && args[0] !== '--empty')) {
    throw new Error('Usage: node examples/orders-demo.mjs [--empty | fixture.json]');
  }
  const fixture = args[0]
    ? pathToFileURL(resolve(args[0]))
    : new URL('./orders.fixture.json', import.meta.url);
  const orders = args[0] === '--empty' ? [] : JSON.parse(await readFile(fixture, 'utf8'));
  console.log(JSON.stringify(toOrderRows(orders), null, 2));
} catch (error) {
  console.error(`Orders demo failed: ${error.message}`);
  process.exitCode = 1;
}
