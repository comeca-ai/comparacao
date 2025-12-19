#!/usr/bin/env node

/**
 * Gerador de Bundle de Submissão - OpenAI App Store
 *
 * Automatiza a criação do pacote de submissão para a App Store:
 * - Gera manifesto MCP validado
 * - Verifica requisitos obrigatórios
 * - Cria checklist interativo
 * - Prepara assets para upload
 *
 * Uso:
 *   node generate-bundle.js --name "Meu App" --url "https://mcp.exemplo.com"
 *
 * Opções:
 *   --name        Nome do app (obrigatório)
 *   --url         URL do MCP Server (obrigatório)
 *   --description Descrição do app
 *   --category    Categoria (productivity, developer, etc)
 *   --output      Diretório de saída (default: ./bundle)
 *   --validate    Apenas validar, não gerar
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CATEGORIES = [
  'productivity',
  'developer',
  'education',
  'finance',
  'lifestyle',
  'utilities',
  'entertainment',
  'health',
  'business',
  'other'
];

const REQUIRED_ANNOTATIONS = ['readOnlyHint', 'destructiveHint', 'openWorldHint'];

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

// ============================================================================
// PARSE ARGS
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    name: null,
    url: null,
    description: '',
    category: 'other',
    output: './bundle',
    validate: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
        options.name = args[++i];
        break;
      case '--url':
        options.url = args[++i];
        break;
      case '--description':
        options.description = args[++i];
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--validate':
        options.validate = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
${colors.bold}Gerador de Bundle de Submissão - OpenAI App Store${colors.reset}

${colors.blue}Uso:${colors.reset}
  node generate-bundle.js --name "Meu App" --url "https://mcp.exemplo.com"

${colors.blue}Opções:${colors.reset}
  --name        Nome do app (obrigatório)
  --url         URL do MCP Server (obrigatório)
  --description Descrição do app (max 500 caracteres)
  --category    Categoria: ${CATEGORIES.join(', ')}
  --output      Diretório de saída (default: ./bundle)
  --validate    Apenas validar, não gerar bundle
  --help        Mostra esta ajuda

${colors.blue}Exemplo:${colors.reset}
  node generate-bundle.js \\
    --name "Analisador Fiscal BR" \\
    --url "https://fiscal.mcp.exemplo.com" \\
    --description "Análise de documentos fiscais brasileiros" \\
    --category "finance"
`);
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Resposta não é JSON válido: ${data.substring(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

async function validateMCPServer(url) {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  console.log(`\n${colors.blue}▶ Validando MCP Server: ${url}${colors.reset}\n`);

  // 1. Verificar HTTPS
  if (url.startsWith('https://')) {
    results.passed.push({ check: 'HTTPS', message: 'Servidor usa HTTPS' });
  } else {
    results.failed.push({ check: 'HTTPS', message: 'Servidor deve usar HTTPS para produção' });
  }

  // 2. Verificar health endpoint
  try {
    const health = await fetchJson(`${url}/health`);
    if (health.status === 'healthy') {
      results.passed.push({ check: 'Health', message: 'Endpoint /health respondendo' });
    } else {
      results.warnings.push({ check: 'Health', message: 'Status não é "healthy"' });
    }
  } catch (e) {
    results.failed.push({ check: 'Health', message: `Endpoint /health falhou: ${e.message}` });
  }

  // 3. Verificar manifesto MCP
  try {
    const manifest = await fetchJson(`${url}/.well-known/mcp.json`);

    if (manifest.name && manifest.version) {
      results.passed.push({ check: 'Manifesto', message: 'Manifesto MCP válido' });
    }

    if (manifest.tools && manifest.tools.length > 0) {
      results.passed.push({ check: 'Tools', message: `${manifest.tools.length} tools encontradas` });

      // Verificar annotations
      let annotationsComplete = true;
      for (const tool of manifest.tools) {
        if (!tool.annotations) {
          annotationsComplete = false;
          results.failed.push({
            check: 'Annotations',
            message: `Tool "${tool.name}" não tem annotations`
          });
        } else {
          for (const annotation of REQUIRED_ANNOTATIONS) {
            if (typeof tool.annotations[annotation] !== 'boolean') {
              annotationsComplete = false;
              results.warnings.push({
                check: 'Annotations',
                message: `Tool "${tool.name}" falta ${annotation}`
              });
            }
          }
        }
      }

      if (annotationsComplete) {
        results.passed.push({ check: 'Annotations', message: 'Todas as tools têm annotations completas' });
      }
    } else {
      results.failed.push({ check: 'Tools', message: 'Nenhuma tool encontrada no manifesto' });
    }

    return { ...results, manifest };
  } catch (e) {
    results.failed.push({ check: 'Manifesto', message: `Manifesto não encontrado: ${e.message}` });
    return results;
  }
}

function printValidationResults(results) {
  console.log(`${colors.green}✓ Passou (${results.passed.length})${colors.reset}`);
  for (const item of results.passed) {
    console.log(`  ${colors.green}✓${colors.reset} ${item.check}: ${item.message}`);
  }

  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠ Avisos (${results.warnings.length})${colors.reset}`);
    for (const item of results.warnings) {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${item.check}: ${item.message}`);
    }
  }

  if (results.failed.length > 0) {
    console.log(`\n${colors.red}✗ Falhou (${results.failed.length})${colors.reset}`);
    for (const item of results.failed) {
      console.log(`  ${colors.red}✗${colors.reset} ${item.check}: ${item.message}`);
    }
  }

  const score = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100);
  console.log(`\n${colors.bold}Score de Validação: ${score}%${colors.reset}`);

  return results.failed.length === 0;
}

// ============================================================================
// GERAÇÃO DE BUNDLE
// ============================================================================

function generateManifest(options, serverManifest) {
  return {
    "$schema": "https://openai.com/schemas/mcp-app-v1.json",
    "name": options.name,
    "version": serverManifest?.version || "1.0.0",
    "description": options.description,
    "category": options.category,
    "mcp_server": {
      "url": options.url,
      "protocol_version": serverManifest?.protocolVersion || "2024-11-05"
    },
    "tools": serverManifest?.tools || [],
    "requirements": {
      "openai_account": true,
      "owner_role": true
    },
    "metadata": {
      "author": "",
      "website": "",
      "support_email": "",
      "privacy_policy_url": "",
      "terms_of_service_url": ""
    },
    "generated_at": new Date().toISOString(),
    "generator": "openai-app-store-toolkit"
  };
}

function generateChecklist(options) {
  return `# Checklist de Submissão - ${options.name}

## Pré-Requisitos

### Conta e Permissões
- [ ] Conta OpenAI verificada
- [ ] Role "Owner" na organização
- [ ] Aceito os termos de desenvolvedor

### Servidor MCP
- [ ] MCP Server rodando em HTTPS público
- [ ] Endpoint /health respondendo
- [ ] Manifesto /.well-known/mcp.json válido
- [ ] Todas as Tool Annotations declaradas
- [ ] Content Security Policy (CSP) configurado
- [ ] Rate limiting implementado

### Testes
- [ ] Todos os 7 casos de sucesso passando
- [ ] Todos os 3 casos de erro passando
- [ ] Testado com diferentes inputs
- [ ] Testado com usuário real

## Submissão

### Informações do App
- [ ] Nome: ${options.name}
- [ ] Descrição (< 500 chars): ${options.description || '[PREENCHER]'}
- [ ] Categoria: ${options.category}
- [ ] URL: ${options.url}

### Assets
- [ ] Screenshot principal (1280x800px)
- [ ] Screenshots adicionais (opcional)
- [ ] Ícone do app (512x512px)

### Documentação
- [ ] Instruções de uso claras
- [ ] Exemplos de prompts
- [ ] FAQ básico

## Pós-Submissão

### Monitoramento
- [ ] Alertas de erro configurados
- [ ] Dashboard de analytics ativo
- [ ] Keep-alive programado

### Comunicação
- [ ] Email de suporte configurado
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados

---

**Status**: Aguardando submissão
**Data**: ${new Date().toLocaleDateString('pt-BR')}
**URL do Bundle**: ./manifest.json
`;
}

function generateReadme(options) {
  return `# ${options.name}

## Sobre

${options.description || 'Descrição do seu app aqui.'}

## Instalação

1. Acesse a OpenAI App Store
2. Procure por "${options.name}"
3. Clique em "Instalar"
4. Autorize o acesso

## Uso

### Exemplos de Prompts

\`\`\`
[Adicione exemplos de prompts aqui]
\`\`\`

## Tools Disponíveis

[Lista de tools será preenchida automaticamente]

## Suporte

- Email: [seu-email@exemplo.com]
- Issues: [link para issues]

## Licença

[Sua licença aqui]
`;
}

async function generateBundle(options) {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  Gerador de Bundle de Submissão${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  // Validar servidor
  const validation = await validateMCPServer(options.url);
  const isValid = printValidationResults(validation);

  if (!isValid) {
    console.log(`\n${colors.red}✗ Servidor não passou na validação. Corrija os problemas antes de continuar.${colors.reset}\n`);
    if (!options.validate) {
      console.log(`${colors.yellow}Dica: Use --validate para apenas validar sem gerar o bundle.${colors.reset}\n`);
    }
    process.exit(1);
  }

  if (options.validate) {
    console.log(`\n${colors.green}✓ Validação concluída com sucesso!${colors.reset}\n`);
    process.exit(0);
  }

  // Criar diretório de saída
  const outputDir = path.resolve(options.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n${colors.blue}▶ Gerando Bundle${colors.reset}\n`);

  // Gerar manifesto
  const manifest = generateManifest(options, validation.manifest);
  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`${colors.green}✓${colors.reset} Manifesto: ${manifestPath}`);

  // Gerar checklist
  const checklist = generateChecklist(options);
  const checklistPath = path.join(outputDir, 'CHECKLIST.md');
  fs.writeFileSync(checklistPath, checklist);
  console.log(`${colors.green}✓${colors.reset} Checklist: ${checklistPath}`);

  // Gerar README
  const readme = generateReadme(options);
  const readmePath = path.join(outputDir, 'README.md');
  fs.writeFileSync(readmePath, readme);
  console.log(`${colors.green}✓${colors.reset} README: ${readmePath}`);

  // Criar diretório de assets
  const assetsDir = path.join(outputDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
  console.log(`${colors.green}✓${colors.reset} Diretório de assets: ${assetsDir}/`);

  // Resumo final
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}  Bundle gerado com sucesso!${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  console.log(`
${colors.bold}Próximos passos:${colors.reset}

1. Adicione screenshots em ${assetsDir}/
   - screenshot-main.png (1280x800px)
   - icon.png (512x512px)

2. Complete o checklist em ${checklistPath}

3. Edite o README em ${readmePath}

4. Submeta na OpenAI App Store:
   - Upload do manifest.json
   - Upload dos assets
   - Preencher informações adicionais

${colors.gray}Dica: Mantenha o bundle versionado para atualizações futuras.${colors.reset}
`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const options = parseArgs();

  if (!options.name || !options.url) {
    console.error(`${colors.red}Erro: --name e --url são obrigatórios${colors.reset}`);
    console.log('Use --help para ver as opções disponíveis');
    process.exit(1);
  }

  if (options.description.length > 500) {
    console.error(`${colors.red}Erro: Descrição deve ter no máximo 500 caracteres${colors.reset}`);
    process.exit(1);
  }

  if (!CATEGORIES.includes(options.category)) {
    console.error(`${colors.red}Erro: Categoria inválida. Use uma de: ${CATEGORIES.join(', ')}${colors.reset}`);
    process.exit(1);
  }

  await generateBundle(options);
}

main().catch(error => {
  console.error(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});
