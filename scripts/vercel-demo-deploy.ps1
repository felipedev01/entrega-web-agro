param(
    [Parameter(Mandatory = $true)]
    [string]$ApiBaseUrl
)

$ErrorActionPreference = "Stop"

function Test-VercelAuth {
    if ($env:VERCEL_TOKEN) {
        return $true
    }

    $vercelHome = Join-Path $HOME ".vercel"
    return Test-Path $vercelHome
}

try {
    $apiUri = [Uri]$ApiBaseUrl
} catch {
    throw "ApiBaseUrl invalida. Informe uma URL absoluta, por exemplo https://seu-tunnel-publico.exemplo.dev"
}

if (-not $apiUri.IsAbsoluteUri) {
    throw "ApiBaseUrl precisa ser uma URL absoluta."
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$frontendDir = Join-Path $projectRoot "frontend"
$projectFile = Join-Path $frontendDir ".vercel\project.json"

if (-not (Test-Path $frontendDir)) {
    throw "Nao foi possivel localizar a pasta frontend em $frontendDir"
}

if (-not (Test-Path (Join-Path $frontendDir "package.json"))) {
    throw "package.json nao encontrado em $frontendDir"
}

if (-not (Test-VercelAuth)) {
    throw "Nenhuma autenticacao da Vercel foi encontrada nesta maquina. Rode 'npx vercel login' antes de usar este script."
}

if (-not (Test-Path $projectFile)) {
    throw "O frontend ainda nao esta vinculado a um projeto Vercel. Importe o repositorio na Vercel com Root Directory = frontend ou rode 'npx vercel link' dentro de frontend."
}

$tempEnvFile = [System.IO.Path]::GetTempFileName()

try {
    Push-Location $frontendDir

    Write-Host "Sincronizando configuracao do projeto Vercel..."
    npx vercel pull --yes --environment=production

    Write-Host "Validando build do frontend..."
    npm run build

    Write-Host "Publicando deploy de producao..."
    npx vercel deploy --prod --public --yes --build-env "NEXT_PUBLIC_API_BASE_URL=$ApiBaseUrl" --env "NEXT_PUBLIC_API_BASE_URL=$ApiBaseUrl"
} finally {
    if (Test-Path $tempEnvFile) {
        Remove-Item -LiteralPath $tempEnvFile -Force
    }

    if ((Get-Location).Path -eq $frontendDir) {
        Pop-Location
    }
}
