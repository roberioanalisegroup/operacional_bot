Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gerador Automatico de Executavel" -ForegroundColor Cyan
Write-Host "Automação SPED - Sem Instalação" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$tempDir = Join-Path $PSScriptRoot "temp_build"
$nodeZip = Join-Path $tempDir "node.zip"
$nodeExtracted = Join-Path $tempDir "node-v20.11.0-win-x64"

# Limpa pasta temporária anterior
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Verifica se Node.js já está instalado
$nodeInstalled = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
        $nodeInstalled = $true
    }
} catch {
    $nodeInstalled = $false
}

if (-not $nodeInstalled) {
    Write-Host "Baixando Node.js portable (não será instalado)..." -ForegroundColor Yellow
    Write-Host "Isso pode demorar alguns minutos..." -ForegroundColor Yellow
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip" -OutFile $nodeZip -UseBasicParsing
        
        Write-Host "Extraindo Node.js..." -ForegroundColor Yellow
        Expand-Archive -Path $nodeZip -DestinationPath $tempDir -Force
        
        $nodePath = Join-Path $nodeExtracted "node.exe"
        $npmPath = Join-Path $nodeExtracted "npm.cmd"
        
        if (-not (Test-Path $nodePath)) {
            throw "Node.js não foi extraído corretamente"
        }
        
        Write-Host "Node.js baixado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Não foi possível baixar Node.js automaticamente." -ForegroundColor Red
        Write-Host ""
        Write-Host "Solução: Use a versão HTML (AutomacaoSPED.html)" -ForegroundColor Yellow
        Write-Host "que funciona perfeitamente sem precisar de .exe" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    $nodePath = "node"
    $npmPath = "npm"
}

Write-Host ""
Write-Host "Instalando dependências do Electron..." -ForegroundColor Yellow

try {
    if ($nodeInstalled) {
        & npm install electron electron-builder --save-dev 2>&1 | Out-Null
    } else {
        Push-Location $PSScriptRoot
        $env:PATH = "$nodeExtracted;$env:PATH"
        & npm install electron electron-builder --save-dev 2>&1 | Out-Null
        Pop-Location
    }
    
    if (-not (Test-Path "node_modules\electron")) {
        throw "Electron não foi instalado"
    }
    Write-Host "Dependências instaladas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "ERRO ao instalar dependências: $_" -ForegroundColor Red
    Write-Host "Tentando continuar mesmo assim..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Gerando executável..." -ForegroundColor Yellow

try {
    if ($nodeInstalled) {
        & npm run build-win 2>&1 | Out-Null
    } else {
        Push-Location $PSScriptRoot
        $env:PATH = "$nodeExtracted;$env:PATH"
        & npm run build-win 2>&1 | Out-Null
        Pop-Location
    }
} catch {
    Write-Host "Aviso durante a geração: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Limpando arquivos temporários..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

$exeFiles = Get-ChildItem -Path "dist" -Filter "*.exe" -ErrorAction SilentlyContinue

if ($exeFiles) {
    Write-Host "SUCESSO! Executável criado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Arquivos em: dist\" -ForegroundColor Cyan
    foreach ($file in $exeFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "O arquivo PORTABLE pode ser copiado e executado" -ForegroundColor Green
    Write-Host "em qualquer computador Windows sem instalação!" -ForegroundColor Green
} else {
    Write-Host "AVISO: Executável não foi gerado." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Use a versão HTML (AutomacaoSPED.html)" -ForegroundColor Yellow
    Write-Host "que funciona perfeitamente sem precisar de .exe" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Pressione Enter para sair"

