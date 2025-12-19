#!/usr/bin/env node

/**
 * Script de Testes para MCP Server - OpenAI App Store
 *
 * Executa 7 casos de sucesso + 3 casos de erro
 * Gera relatório em JSON e HTML
 *
 * Uso:
 *   node run-tests.js <BASE_URL>
 *   node run-tests.js https://mcp.seudominio.com
 *
 * Opções:
 *   --json     Saída apenas em JSON
 *   --html     Gera relatório HTML
 *   --verbose  Mostra detalhes de cada teste
 */

const fs = require('fs');
const path = require('path');

// Configuração
const DEFAULT_BASE_URL = 'http://localhost:8787';
const TIMEOUT_MS = 10000;

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

// Argumentos da CLI
const args = process.argv.slice(2);
const baseUrl = args.find(a => !a.startsWith('--')) || DEFAULT_BASE_URL;
const jsonOnly = args.includes('--json');
const generateHtml = args.includes('--html');
const verbose = args.includes('--verbose');

// Carregar casos de teste
const testCasesPath = path.join(__dirname, 'test-cases.json');
const testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf8'));

// Resultados
const results = {
  timestamp: new Date().toISOString(),
  baseUrl,
  summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
  tests: []
};

// ============================================================================
// FUNÇÕES DE TESTE
// ============================================================================

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // Resposta não é JSON
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: json || text,
      ok: response.ok
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      status: 0,
      error: error.message,
      ok: false
    };
  }
}

function deepMatch(actual, expected) {
  if (typeof expected !== 'object' || expected === null) {
    return actual === expected;
  }

  for (const key of Object.keys(expected)) {
    if (!(key in actual)) return false;
    if (!deepMatch(actual[key], expected[key])) return false;
  }

  return true;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

async function runTest(testCase) {
  const startTime = Date.now();

  const result = {
    id: testCase.id,
    name: testCase.name,
    description: testCase.description,
    status: 'pending',
    duration: 0,
    request: {
      method: testCase.method,
      endpoint: testCase.endpoint,
      body: testCase.body
    },
    response: null,
    assertions: [],
    error: null
  };

  try {
    // Executa a requisição
    const response = await makeRequest(testCase.endpoint, {
      method: testCase.method,
      headers: testCase.headers,
      body: testCase.body
    });

    result.response = response;

    // Verifica status HTTP
    const expectedStatuses = Array.isArray(testCase.expectedStatus)
      ? testCase.expectedStatus
      : [testCase.expectedStatus];

    const statusMatch = expectedStatuses.includes(response.status);
    result.assertions.push({
      type: 'status',
      expected: expectedStatuses,
      actual: response.status,
      passed: statusMatch
    });

    // Verifica body esperado
    if (testCase.expectedBody && response.body) {
      const bodyMatch = deepMatch(response.body, testCase.expectedBody);
      result.assertions.push({
        type: 'body',
        expected: testCase.expectedBody,
        actual: response.body,
        passed: bodyMatch
      });
    }

    // Verifica headers esperados
    if (testCase.expectedHeaders) {
      for (const [key, value] of Object.entries(testCase.expectedHeaders)) {
        const headerMatch = response.headers[key.toLowerCase()] === value;
        result.assertions.push({
          type: 'header',
          header: key,
          expected: value,
          actual: response.headers[key.toLowerCase()],
          passed: headerMatch
        });
      }
    }

    // Valida array não vazio
    if (testCase.validateArrayNotEmpty) {
      const arr = getNestedValue(response.body, testCase.validateArrayNotEmpty);
      const notEmpty = Array.isArray(arr) && arr.length > 0;
      result.assertions.push({
        type: 'arrayNotEmpty',
        path: testCase.validateArrayNotEmpty,
        passed: notEmpty
      });
    }

    // Determina status do teste
    const allPassed = result.assertions.every(a => a.passed);
    result.status = allPassed ? 'passed' : 'failed';

  } catch (error) {
    result.status = 'error';
    result.error = error.message;
  }

  result.duration = Date.now() - startTime;
  return result;
}

async function runRateLimitTest(testCase) {
  const startTime = Date.now();

  const result = {
    id: testCase.id,
    name: testCase.name,
    description: testCase.description,
    status: 'pending',
    duration: 0,
    request: {
      method: testCase.method,
      endpoint: testCase.endpoint,
      repeatCount: testCase.repeatCount
    },
    response: null,
    assertions: [],
    error: null
  };

  try {
    let rateLimited = false;
    let lastResponse = null;

    // Envia requisições rapidamente
    for (let i = 0; i < testCase.repeatCount; i++) {
      const response = await makeRequest(testCase.endpoint, {
        method: testCase.method,
        body: testCase.body
      });

      lastResponse = response;

      if (response.status === 429) {
        rateLimited = true;
        break;
      }
    }

    result.response = lastResponse;

    result.assertions.push({
      type: 'rateLimited',
      expected: true,
      actual: rateLimited,
      passed: rateLimited
    });

    if (rateLimited && testCase.expectedHeaders) {
      for (const [key, value] of Object.entries(testCase.expectedHeaders)) {
        const headerMatch = lastResponse.headers[key.toLowerCase()] === value;
        result.assertions.push({
          type: 'header',
          header: key,
          expected: value,
          actual: lastResponse.headers[key.toLowerCase()],
          passed: headerMatch
        });
      }
    }

    const allPassed = result.assertions.every(a => a.passed);
    result.status = allPassed ? 'passed' : 'failed';

  } catch (error) {
    result.status = 'error';
    result.error = error.message;
  }

  result.duration = Date.now() - startTime;
  return result;
}

// ============================================================================
// RELATÓRIOS
// ============================================================================

function printResult(result) {
  const icon = result.status === 'passed' ? '✓' : result.status === 'failed' ? '✗' : '!';
  const color = result.status === 'passed' ? colors.green :
                result.status === 'failed' ? colors.red : colors.yellow;

  console.log(`${color}${icon}${colors.reset} [${result.id}] ${result.name} ${colors.gray}(${result.duration}ms)${colors.reset}`);

  if (verbose || result.status !== 'passed') {
    for (const assertion of result.assertions) {
      const assertIcon = assertion.passed ? '  ✓' : '  ✗';
      const assertColor = assertion.passed ? colors.green : colors.red;
      console.log(`${assertColor}${assertIcon}${colors.reset} ${assertion.type}: expected ${JSON.stringify(assertion.expected)}, got ${JSON.stringify(assertion.actual)}`);
    }

    if (result.error) {
      console.log(`${colors.red}  Error: ${result.error}${colors.reset}`);
    }
  }
}

function generateHtmlReport(results) {
  const passed = results.tests.filter(t => t.status === 'passed').length;
  const failed = results.tests.filter(t => t.status === 'failed').length;
  const total = results.tests.length;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Testes - MCP Server</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
    .header h1 { font-size: 24px; margin-bottom: 10px; }
    .summary { display: flex; gap: 20px; margin-top: 15px; }
    .summary-item { background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 5px; }
    .summary-item .number { font-size: 24px; font-weight: bold; }
    .test-card { background: white; border-radius: 8px; margin-bottom: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .test-header { padding: 15px 20px; cursor: pointer; display: flex; align-items: center; gap: 10px; }
    .test-header:hover { background: #f9f9f9; }
    .test-header.passed { border-left: 4px solid #10b981; }
    .test-header.failed { border-left: 4px solid #ef4444; }
    .test-id { background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .test-name { flex: 1; font-weight: 500; }
    .test-duration { color: #6b7280; font-size: 14px; }
    .test-details { padding: 15px 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: none; }
    .test-details.show { display: block; }
    .assertion { padding: 8px; margin: 5px 0; border-radius: 4px; font-family: monospace; font-size: 13px; }
    .assertion.passed { background: #d1fae5; }
    .assertion.failed { background: #fee2e2; }
    pre { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Relatório de Testes - MCP Server</h1>
      <p>Base URL: ${results.baseUrl}</p>
      <p>Data: ${new Date(results.timestamp).toLocaleString('pt-BR')}</p>
      <div class="summary">
        <div class="summary-item">
          <div class="number">${total}</div>
          <div>Total</div>
        </div>
        <div class="summary-item">
          <div class="number">${passed}</div>
          <div>Passou</div>
        </div>
        <div class="summary-item">
          <div class="number">${failed}</div>
          <div>Falhou</div>
        </div>
      </div>
    </div>

    ${results.tests.map(test => `
    <div class="test-card">
      <div class="test-header ${test.status}" onclick="this.nextElementSibling.classList.toggle('show')">
        <span class="test-id">${test.id}</span>
        <span class="test-name">${test.name}</span>
        <span class="test-duration">${test.duration}ms</span>
        <span>${test.status === 'passed' ? '✓' : '✗'}</span>
      </div>
      <div class="test-details">
        <p><strong>Descrição:</strong> ${test.description}</p>
        <p><strong>Endpoint:</strong> ${test.request.method} ${test.request.endpoint}</p>
        ${test.assertions.map(a => `
        <div class="assertion ${a.passed ? 'passed' : 'failed'}">
          ${a.type}: esperado ${JSON.stringify(a.expected)}, recebido ${JSON.stringify(a.actual)}
        </div>
        `).join('')}
        ${test.response ? `
        <h4 style="margin-top: 15px;">Resposta:</h4>
        <pre>${JSON.stringify(test.response.body, null, 2)}</pre>
        ` : ''}
      </div>
    </div>
    `).join('')}
  </div>
</body>
</html>`;

  return html;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  if (!jsonOnly) {
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  MCP Server Test Suite${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`\nBase URL: ${baseUrl}\n`);
  }

  // Testes de sucesso
  if (!jsonOnly) {
    console.log(`${colors.blue}▶ Testes de Sucesso (7 casos)${colors.reset}\n`);
  }

  for (const testCase of testCases.testCases.success) {
    const result = await runTest(testCase);
    results.tests.push(result);

    if (!jsonOnly) {
      printResult(result);
    }

    if (result.status === 'passed') results.summary.passed++;
    else results.summary.failed++;
    results.summary.total++;
  }

  // Testes de erro
  if (!jsonOnly) {
    console.log(`\n${colors.blue}▶ Testes de Erro (3 casos)${colors.reset}\n`);
  }

  for (const testCase of testCases.testCases.error) {
    let result;

    if (testCase.repeatCount) {
      result = await runRateLimitTest(testCase);
    } else {
      result = await runTest(testCase);
    }

    results.tests.push(result);

    if (!jsonOnly) {
      printResult(result);
    }

    if (result.status === 'passed') results.summary.passed++;
    else results.summary.failed++;
    results.summary.total++;
  }

  // Resumo
  if (!jsonOnly) {
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`  Total: ${results.summary.total} | ${colors.green}Passou: ${results.summary.passed}${colors.reset} | ${colors.red}Falhou: ${results.summary.failed}${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);
  }

  // Salvar resultados
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // JSON
  const jsonPath = path.join(outputDir, 'test-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  if (jsonOnly) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`Resultados salvos em: ${jsonPath}`);
  }

  // HTML
  if (generateHtml) {
    const htmlPath = path.join(outputDir, 'test-results.html');
    fs.writeFileSync(htmlPath, generateHtmlReport(results));
    console.log(`Relatório HTML: ${htmlPath}`);
  }

  // Exit code baseado nos resultados
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});
