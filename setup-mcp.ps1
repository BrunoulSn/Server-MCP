# Script para configurar MCP Server no Claude Desktop
# Executar como: .\setup-mcp.ps1

$projectPath = "C:\MCP_Server-TCS\mcp-meta-server"
$distFile = "$projectPath\dist\index.js"
$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$claudeConfigDir = Split-Path $claudeConfigPath

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CONFIGURADOR DO MCP SERVER" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 1. Compilar
Write-Host ""
Write-Host "Etapa 1: Compilando projeto..." -ForegroundColor Yellow
if (Test-Path $projectPath) {
    Push-Location $projectPath
    npm run clean 2>&1 | Out-Null
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Build completo" -ForegroundColor Green
    } else {
        Write-Host "[ERRO] Falha na compilacao" -ForegroundColor Red
        exit 1
    }
    Pop-Location
} else {
    Write-Host "[ERRO] Diretorio nao encontrado" -ForegroundColor Red
    exit 1
}

# 2. Validar
Write-Host ""
Write-Host "Etapa 2: Validando arquivo compilado..." -ForegroundColor Yellow
if (Test-Path $distFile) {
    Write-Host "[OK] Arquivo encontrado" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Arquivo nao encontrado" -ForegroundColor Red
    exit 1
}

# 3. Configurar
Write-Host ""
Write-Host "Etapa 3: Configurando Claude Desktop..." -ForegroundColor Yellow

if (-not (Test-Path $claudeConfigDir)) {
    New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
}

$config = @{
    mcpServers = @{
        "mcp-meta-server" = @{
            command = "node"
            args = @($distFile)
        }
    }
} | ConvertTo-Json -Depth 10

if (Test-Path $claudeConfigPath) {
    try {
        $existingConfig = Get-Content $claudeConfigPath | ConvertFrom-Json
        if (-not $existingConfig.mcpServers) {
            $existingConfig | Add-Member -Name "mcpServers" -Value @{} -MemberType NoteProperty
        }
        $existingConfig.mcpServers."mcp-meta-server" = @{
            command = "node"
            args = @($distFile)
        }
        $config = $existingConfig | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "[AVISO] Criando config nova" -ForegroundColor Yellow
    }
}

$config | Out-File -FilePath $claudeConfigPath -Encoding UTF8 -Force
Write-Host "[OK] Configuracao salva" -ForegroundColor Green

# 4. Validar JSON
Write-Host ""
Write-Host "Etapa 4: Validando JSON..." -ForegroundColor Yellow
try {
    $validation = Get-Content $claudeConfigPath | ConvertFrom-Json
    Write-Host "[OK] JSON valido" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] JSON invalido" -ForegroundColor Red
    exit 1
}

# 5. Resultado
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CONFIGURACAO COMPLETA!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "1. Feche Claude Desktop" -ForegroundColor White
Write-Host "2. Aguarde 3 segundos" -ForegroundColor White
Write-Host "3. Reabra Claude Desktop" -ForegroundColor White
Write-Host ""
Write-Host "Configuracao salva em:" -ForegroundColor Yellow
Write-Host $claudeConfigPath -ForegroundColor Cyan
Write-Host ""
