#!/bin/bash

# ============================================
# Build Submission Bundle para OpenAI Apps
# ============================================
# Gera todos os assets necessários para submissão
# na OpenAI App Store
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuração
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUNDLE_DIR="${PROJECT_DIR}/submission-bundle"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_step() {
    echo -e "\n${YELLOW}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# ============================================
# CONFIGURAÇÃO DO APP (EDITE AQUI)
# ============================================

APP_NAME="${APP_NAME:-PIX Seguro}"
APP_SUBTITLE="${APP_SUBTITLE:-Proteção contra golpes PIX}"
APP_DESCRIPTION="${APP_DESCRIPTION:-Analisa mensagens e screenshots para detectar tentativas de golpes e fraudes digitais no Brasil. Proteja-se contra golpes PIX, WhatsApp clonado e outros esquemas fraudulentos.}"
APP_VERSION="${APP_VERSION:-1.0.0}"
MCP_SERVER_URL="${MCP_SERVER_URL:-https://seu-worker.workers.dev}"
AUTHOR_NAME="${AUTHOR_NAME:-Seu Nome}"
AUTHOR_EMAIL="${AUTHOR_EMAIL:-seu@email.com}"

# ============================================
# FUNÇÕES
# ============================================

create_bundle_directory() {
    print_step "Creating bundle directory..."
    
    rm -rf "$BUNDLE_DIR"
    mkdir -p "$BUNDLE_DIR"/{assets,docs,logs}
    
    print_success "Bundle directory created: $BUNDLE_DIR"
}

generate_manifest() {
    print_step "Generating manifest.json..."
    
    cat > "$BUNDLE_DIR/manifest.json" << EOF
{
  "schema_version": "1.0",
  "name": "${APP_NAME}",
  "subtitle": "${APP_SUBTITLE}",
  "description": "${APP_DESCRIPTION}",
  "version": "${APP_VERSION}",
  "author": {
    "name": "${AUTHOR_NAME}",
    "email": "${AUTHOR_EMAIL}"
  },
  "mcp_server": {
    "url": "${MCP_SERVER_URL}/sse",
    "transport": "sse"
  },
  "tools": [
    {
      "name": "analyze_message",
      "title": "Analisar Mensagem",
      "description": "Use this when user wants to analyze a suspicious message for potential fraud or scam detection.",
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "openWorldHint": true
      }
    },
    {
      "name": "analyze_screenshot",
      "title": "Analisar Screenshot",
      "description": "Use this when user wants to analyze a screenshot for potential fraud indicators.",
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "openWorldHint": true
      }
    },
    {
      "name": "get_security_tips",
      "title": "Dicas de Segurança",
      "description": "Use this when user wants security tips to protect themselves from scams.",
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "openWorldHint": false
      }
    }
  ],
  "permissions": {
    "network": ["api.openai.com", "api.cloudflare.com"],
    "storage": false
  },
  "privacy": {
    "data_retention": "session_only",
    "pii_handling": "redacted_before_storage",
    "third_party_sharing": false
  },
  "created_at": "$(date -Iseconds)",
  "bundle_id": "bundle_${TIMESTAMP}"
}
EOF

    print_success "manifest.json generated"
}

generate_how_to_test() {
    print_step "Generating how_to_test.md..."
    
    cat > "$BUNDLE_DIR/docs/how_to_test.md" << 'EOF'
# How to Test This MCP Server

## Overview

This MCP server provides fraud/scam detection capabilities for Brazilian users, specifically targeting PIX-related scams.

> **Note:** Analysis is performed by an OpenAI-hosted Agent (OpenAI Agents API). Our MCP exposes the manifest and forwards requests to the configured Agent (via the Agents API). Calls to OpenAI use secure credentials and we redact sensitive data before persistence.

## Quick Test Commands

### 1. Health Check

```bash
curl https://YOUR_WORKER_URL/health
```

Expected response:
```json
{"status":"ok","version":"1.0.0","timestamp":"..."}
```

### 2. Probe (Quick Response Test)

```bash
curl "https://YOUR_WORKER_URL/sse?probe=1"
```

Should respond in < 1 second.

### 3. Verification File

```bash
curl https://YOUR_WORKER_URL/.well-known/openai-verification.txt
```

Should return your verification token.

### 4. List Tools

```bash
curl -X POST https://YOUR_WORKER_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected: List of 3 tools with annotations.

### 5. Test Message Analysis (Scam Detection)

```bash
curl -X POST https://YOUR_WORKER_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"analyze_message",
      "arguments":{
        "message":"Parabéns! Você ganhou R$5.000 no PIX. Clique aqui urgente para resgatar: bit.ly/xyz123"
      }
    }
  }'
```

Expected: High risk score (this is a typical scam message).

### 6. Test Security Tips

```bash
curl -X POST https://YOUR_WORKER_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"get_security_tips",
      "arguments":{"category":"pix"}
    }
  }'
```

Expected: List of PIX security tips.

## Test Scenarios

### Positive Tests (Should Succeed)

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Health | GET /health | 200 OK, status: "ok" |
| Probe | GET /sse?probe=1 | 200 OK, < 1s response |
| Initialize | JSON-RPC initialize | Protocol version returned |
| List Tools | JSON-RPC tools/list | 3 tools with annotations |
| Analyze Message | Scam message test | High risk score |
| Security Tips | Get PIX tips | List of tips |

### Negative Tests (Should Fail Gracefully)

| Test | Description | Expected Error |
|------|-------------|----------------|
| Invalid Tool | Call nonexistent tool | -32000 error |
| Invalid JSON-RPC | Use version 1.0 | -32600 error |
| Unknown Method | Call fake method | -32601 error |

## Automated Testing

Run the full test suite:

```bash
MCP_SERVER_URL=https://YOUR_WORKER_URL ./scripts/run_tests.sh
```

## Security Notes

- API keys are stored as Cloudflare secrets (never in code)
- PII is redacted before logging
- All requests generate trace IDs for debugging
- CSP headers are properly configured

## Support

For testing support or temporary credentials, contact: YOUR_EMAIL
EOF

    print_success "how_to_test.md generated"
}

generate_tool_justification() {
    print_step "Generating tool_justification.md..."
    
    cat > "$BUNDLE_DIR/docs/tool_justification.md" << 'EOF'
# Tool Justification Document

## Purpose

This document explains the purpose and design decisions for each tool in the MCP server, as required by OpenAI's submission guidelines.

---

## Tool 1: analyze_message

### Purpose
Analyzes text messages to detect potential fraud/scam indicators, specifically targeting PIX-related scams common in Brazil.

### Annotations Justification

| Annotation | Value | Reason |
|------------|-------|--------|
| `readOnlyHint` | `true` | Tool only analyzes data, doesn't modify user data |
| `destructiveHint` | `false` | No data is deleted or modified |
| `openWorldHint` | `true` | Calls external AI API for analysis |

### Input/Output
- **Input:** Suspicious message text (string)
- **Output:** Risk assessment with score, indicators, and recommendations

### Privacy
- Messages are analyzed in real-time
- No messages are stored permanently
- PII is redacted before any logging

---

## Tool 2: analyze_screenshot

### Purpose
Analyzes images/screenshots to detect visual fraud indicators (fake bank screens, fraudulent QR codes, etc.).

### Annotations Justification

| Annotation | Value | Reason |
|------------|-------|--------|
| `readOnlyHint` | `true` | Only reads and analyzes image data |
| `destructiveHint` | `false` | No modifications made |
| `openWorldHint` | `true` | Uses vision AI API for image analysis |

### Input/Output
- **Input:** Image URL or base64 encoded image
- **Output:** Visual analysis with fraud indicators

### Privacy
- Images are processed in real-time
- No images are stored
- Analysis results don't include original image data

---

## Tool 3: get_security_tips

### Purpose
Provides educational security tips to help users protect themselves from various types of digital fraud.

### Annotations Justification

| Annotation | Value | Reason |
|------------|-------|--------|
| `readOnlyHint` | `true` | Returns static educational content |
| `destructiveHint` | `false` | No modifications |
| `openWorldHint` | `false` | No external API calls, content is local |

### Input/Output
- **Input:** Category (pix, whatsapp, email, telefone, geral)
- **Output:** List of security tips for the category

### Privacy
- No user data is processed
- Content is pre-defined and educational

---

## Architecture Notes

### Processing Model

> **Important:** The analysis is performed by an OpenAI-hosted Agent (OpenAI Agents API). Our MCP server acts as an orchestrator that:
> 1. Receives requests via MCP protocol
> 2. Forwards analysis requests to OpenAI Agents API
> 3. Returns formatted results to the user

This architecture ensures:
- High-quality AI analysis (using OpenAI's models)
- Simplified infrastructure (no GPU requirements)
- Consistent security standards (OpenAI's model governance)

### Data Flow

```
User Request → MCP Server → OpenAI Agents API → Analysis Result → User
                  ↓
            PII Redaction
            Trace Logging
```

### Security Measures

1. **API Keys:** Stored as Cloudflare secrets, never in code
2. **PII Handling:** Redacted before any persistence
3. **Logging:** Only trace IDs and sanitized metadata
4. **CSP:** Properly configured for allowed domains
EOF

    print_success "tool_justification.md generated"
}

generate_privacy_policy() {
    print_step "Generating privacy_policy.md..."
    
    cat > "$BUNDLE_DIR/docs/privacy_policy.md" << 'EOF'
# Privacy Policy

**Last Updated:** [DATE]

## Overview

This MCP server ("Service") provides fraud detection and security advisory services. We are committed to protecting user privacy.

## Data Collection

### What We Process
- Text messages submitted for analysis
- Screenshots/images submitted for analysis
- Request metadata (timestamps, trace IDs)

### What We Do NOT Collect
- Personal identification information (intentionally)
- Login credentials
- Financial account details
- Location data

## Data Processing

### Real-Time Analysis
All submitted content is analyzed in real-time and NOT stored permanently. The analysis flow:

1. User submits content via ChatGPT interface
2. MCP server receives request
3. Request is forwarded to OpenAI Agents API for analysis
4. Results are returned to user
5. No content is retained after response

### PII Redaction
Before any logging occurs, we automatically redact:
- CPF numbers (Brazilian tax ID)
- Phone numbers
- Email addresses
- Other identifiable patterns

### Logging
We only log:
- Trace IDs (for debugging)
- Request timestamps
- Error messages (without user content)
- Performance metrics

## Third-Party Services

### OpenAI
Analysis is performed by OpenAI's Agents API. OpenAI's privacy policy applies to their processing: https://openai.com/privacy

### Cloudflare
Infrastructure is hosted on Cloudflare Workers. Cloudflare's privacy policy applies: https://www.cloudflare.com/privacy/

## Data Retention

- **User Content:** Not retained (processed in real-time only)
- **Logs:** Retained for 7 days for debugging purposes
- **Metrics:** Aggregated, anonymized, retained for 30 days

## User Rights

Users have the right to:
- Know what data is processed (this document)
- Request deletion of any stored data
- Opt-out of the service at any time

## Security

We implement:
- HTTPS encryption for all communications
- API key protection via secrets management
- CSP headers for browser security
- Regular security audits

## Contact

For privacy-related inquiries: [YOUR_EMAIL]

## Changes

We may update this policy periodically. Significant changes will be communicated through the app listing.

---

**Nota em Português:** Este serviço processa dados em tempo real e NÃO armazena mensagens ou imagens enviadas. Informações pessoais (CPF, telefone, email) são automaticamente removidas dos logs antes de qualquer registro.
EOF

    print_success "privacy_policy.md generated"
}

generate_submission_checklist() {
    print_step "Generating submission_checklist.md..."
    
    cat > "$BUNDLE_DIR/docs/submission_checklist.md" << 'EOF'
# OpenAI App Submission Checklist

Use this checklist before submitting your app to the OpenAI Store.

## Infrastructure

- [ ] MCP Server deployed to public HTTPS URL
- [ ] `/sse` endpoint responding correctly
- [ ] `/.well-known/openai-verification.txt` configured
- [ ] Health check endpoint working (`/health`)
- [ ] Probe responds in < 1 second (`/sse?probe=1`)

## Tools Configuration

- [ ] All tools have `readOnlyHint` annotation
- [ ] All tools have `destructiveHint` annotation  
- [ ] All tools that call external APIs have `openWorldHint: true`
- [ ] All tools have "Use this when..." descriptions
- [ ] All tools have complete input schemas
- [ ] All tools return `structuredContent` in responses

## Security

- [ ] No API keys in code (using secrets/env vars)
- [ ] No API keys in manifest or public files
- [ ] CSP configured for allowed domains
- [ ] PII redaction implemented
- [ ] Auth handled within MCP Server

## Account Requirements

- [ ] OpenAI account verified (individual or business)
- [ ] Role: Owner in organization
- [ ] NOT using EU data residency (must be global)

## Assets

- [ ] Logo: 512x512 PNG
- [ ] App name: ≤ 30 characters
- [ ] Subtitle: ≤ 50 characters
- [ ] Description: ≤ 500 characters
- [ ] Screenshots (optional but recommended)

## Documentation

- [ ] How to test document prepared
- [ ] Tool justification document prepared
- [ ] Privacy policy prepared

## Testing

- [ ] All positive tests passing
- [ ] All negative tests passing
- [ ] Tested with real ChatGPT interface
- [ ] Tested error scenarios

## Final Steps

1. Go to: https://developers.openai.com/apps-sdk/deploy/submission
2. Fill out the form
3. Add MCP Server URL
4. Click "Scan Tools" and verify detection
5. Complete domain verification
6. Check compliance boxes
7. Submit!

## Post-Submission

- [ ] Monitor email for review feedback
- [ ] Keep MCP Server running and stable
- [ ] Be ready to make changes if requested

---

**Remember:**
- Only 1 version in review at a time
- Tool names/descriptions are LOCKED after publish
- Apps can be removed for instability
EOF

    print_success "submission_checklist.md generated"
}

generate_placeholder_assets() {
    print_step "Creating placeholder assets..."
    
    # Cria um README para a pasta de assets
    cat > "$BUNDLE_DIR/assets/README.md" << EOF
# Assets Directory

Place your app assets here:

## Required
- \`logo.png\` - 512x512 PNG logo for your app

## Optional
- \`screenshot_1.png\` - Screenshot showing the app in action
- \`screenshot_2.png\` - Additional screenshot
- \`banner.png\` - Promotional banner

## Logo Guidelines
- Size: 512x512 pixels
- Format: PNG with transparency
- Style: Clear, recognizable, professional
- No text required (app name shown separately)

## Screenshot Guidelines
- Show the app working in ChatGPT
- Highlight key features
- Use realistic (but not real user) data
EOF

    print_success "Asset placeholders created"
}

copy_source_files() {
    print_step "Copying source files..."
    
    cp "$PROJECT_DIR/src/index.js" "$BUNDLE_DIR/"
    cp "$PROJECT_DIR/wrangler.toml" "$BUNDLE_DIR/"
    cp "$PROJECT_DIR/package.json" "$BUNDLE_DIR/"
    
    print_success "Source files copied"
}

generate_summary() {
    print_step "Generating bundle summary..."
    
    cat > "$BUNDLE_DIR/BUNDLE_INFO.txt" << EOF
========================================
OpenAI App Submission Bundle
========================================

App Name: ${APP_NAME}
Version: ${APP_VERSION}
Generated: $(date)
Bundle ID: bundle_${TIMESTAMP}

========================================
Contents
========================================

/manifest.json          - App manifest
/index.js               - MCP Server source code
/wrangler.toml          - Cloudflare Worker config
/package.json           - Node.js dependencies

/docs/
  how_to_test.md        - Testing instructions for reviewers
  tool_justification.md - Tool design documentation
  privacy_policy.md     - Privacy policy
  submission_checklist.md - Pre-submission checklist

/assets/
  README.md             - Asset requirements
  (Add your logo.png here)

/logs/
  (Test logs will be placed here)

========================================
Next Steps
========================================

1. Add your logo (512x512 PNG) to /assets/logo.png
2. Update MCP_SERVER_URL in manifest.json
3. Run tests: ./scripts/run_tests.sh
4. Review submission_checklist.md
5. Submit at: https://developers.openai.com/apps-sdk/deploy/submission

========================================
EOF

    print_success "Bundle summary generated"
}

# ============================================
# MAIN
# ============================================

main() {
    print_header "OpenAI App Submission Bundle Builder"
    
    echo "App: ${APP_NAME} v${APP_VERSION}"
    echo "Building to: ${BUNDLE_DIR}"
    
    create_bundle_directory
    generate_manifest
    generate_how_to_test
    generate_tool_justification
    generate_privacy_policy
    generate_submission_checklist
    generate_placeholder_assets
    copy_source_files
    generate_summary
    
    print_header "Bundle Complete!"
    
    echo -e "\nBundle created at: ${GREEN}${BUNDLE_DIR}${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Add your logo to ${BUNDLE_DIR}/assets/logo.png"
    echo "  2. Update MCP_SERVER_URL in ${BUNDLE_DIR}/manifest.json"
    echo "  3. Run tests: MCP_SERVER_URL=https://your-url ./scripts/run_tests.sh"
    echo "  4. Review: ${BUNDLE_DIR}/docs/submission_checklist.md"
    echo ""
    
    # Lista o conteúdo
    echo "Bundle contents:"
    find "$BUNDLE_DIR" -type f | sed "s|$BUNDLE_DIR/||" | sort | sed 's/^/  /'
}

main "$@"
