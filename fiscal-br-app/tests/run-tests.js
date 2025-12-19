#!/usr/bin/env node

/**
 * Script de Testes para Fiscal BR - MCP Server
 *
 * Executa casos de teste específicos para validação de funcionalidades fiscais
 *
 * Uso:
 *   node run-tests.js <BASE_URL>
 *   node run-tests.js http://localhost:8787
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_BASE_URL = 'http://localhost:8787';
const TIMEOUT_MS = 10000;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const args = process.argv.slice(2);
const baseUrl = args.find(a => !a.startsWith('--')) || DEFAULT_BASE_URL;
const verbose = args.includes('--verbose');

const testCasesPath = path.join(__dirname, 'test-cases.json');
const testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf8'));

const results = {
  timestamp: new Date().toISOString(),
  baseUrl,
  summary: { total: 0, passed: 0, failed: 0 },
  tests: []
};

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) {}

    return { status: response.status, body: json || text, ok: response.ok };
  } catch (error) {
    clearTimeout(timeoutId);
    return { status: 0, error: error.message, ok: false };
  }
}

function deepMatch(actual, expected) {
  if (typeof expected !== 'object' || expected === null) return actual === expected;
  for (const key of Object.keys(expected)) {
    if (!(key in actual)) return false;
    if (!deepMatch(actual[key], expected[key])) return false;
  }
  return true;
}

async function runTest(testCase) {
  const startTime = Date.now();
  const result = {
    id: testCase.id,
    name: testCase.name,
    status: 'pending',
    duration: 0,
    assertions: []
  };

  try {
    const response = await makeRequest(testCase.endpoint, {
      method: testCase.method,
      body: testCase.body
    });

    // Status check
    const statusMatch = response.status === testCase.expectedStatus;
    result.assertions.push({
      type: 'status',
      expected: testCase.expectedStatus,
      actual: response.status,
      passed: statusMatch
    });

    // Body check
    if (testCase.expectedBody && response.body) {
      const bodyMatch = deepMatch(response.body, testCase.expectedBody);
      result.assertions.push({
        type: 'body',
        passed: bodyMatch
      });
    }

    // Content validation
    if (testCase.validateContent && response.body) {
      const bodyStr = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
      const contains = bodyStr.includes(testCase.validateContent.contains);
      result.assertions.push({
        type: 'content',
        expected: `contains "${testCase.validateContent.contains}"`,
        passed: contains
      });
    }

    // Array length validation
    if (testCase.validateArrayLength && response.body) {
      const pathParts = testCase.validateArrayLength.path.split('.');
      let arr = response.body;
      for (const part of pathParts) arr = arr?.[part];
      const lengthOk = Array.isArray(arr) && arr.length >= testCase.validateArrayLength.minLength;
      result.assertions.push({
        type: 'arrayLength',
        expected: `>= ${testCase.validateArrayLength.minLength}`,
        actual: arr?.length || 0,
        passed: lengthOk
      });
    }

    result.status = result.assertions.every(a => a.passed) ? 'passed' : 'failed';

  } catch (error) {
    result.status = 'error';
    result.error = error.message;
  }

  result.duration = Date.now() - startTime;
  return result;
}

function printResult(result) {
  const icon = result.status === 'passed' ? '\u2713' : result.status === 'failed' ? '\u2717' : '!';
  const color = result.status === 'passed' ? colors.green : colors.red;
  console.log(`${color}${icon}${colors.reset} [${result.id}] ${result.name} ${colors.gray}(${result.duration}ms)${colors.reset}`);

  if (verbose && result.status !== 'passed') {
    for (const a of result.assertions) {
      if (!a.passed) console.log(`  ${colors.red}\u2717 ${a.type}: ${JSON.stringify(a)}${colors.reset}`);
    }
  }
}

async function main() {
  console.log(`\n${colors.blue}════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  Fiscal BR - Test Suite${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}`);
  console.log(`\nBase URL: ${baseUrl}\n`);

  console.log(`${colors.blue}\u25B6 Testes de Sucesso (${testCases.testCases.success.length} casos)${colors.reset}\n`);

  for (const tc of testCases.testCases.success) {
    const result = await runTest(tc);
    results.tests.push(result);
    printResult(result);
    if (result.status === 'passed') results.summary.passed++;
    else results.summary.failed++;
    results.summary.total++;
  }

  console.log(`\n${colors.blue}\u25B6 Testes de Erro (${testCases.testCases.error.length} casos)${colors.reset}\n`);

  for (const tc of testCases.testCases.error) {
    const result = await runTest(tc);
    results.tests.push(result);
    printResult(result);
    if (result.status === 'passed') results.summary.passed++;
    else results.summary.failed++;
    results.summary.total++;
  }

  console.log(`\n${colors.blue}════════════════════════════════════════════${colors.reset}`);
  console.log(`  Total: ${results.summary.total} | ${colors.green}Passou: ${results.summary.passed}${colors.reset} | ${colors.red}Falhou: ${results.summary.failed}${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}\n`);

  // Save results
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  fs.writeFileSync(path.join(outputDir, 'test-results.json'), JSON.stringify(results, null, 2));

  process.exit(results.summary.failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error(`${colors.red}Error: ${e.message}${colors.reset}`);
  process.exit(1);
});
