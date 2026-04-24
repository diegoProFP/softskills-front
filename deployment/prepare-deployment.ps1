$ErrorActionPreference = "Stop"

$deploymentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $deploymentDir

$frontendSource = Join-Path $repoRoot "dist\\softskills-demo-jwt"
$frontendTarget = Join-Path $deploymentDir "frontend\\app"

$backendSource = "D:\\Descargas\\ServidorWEB\\ServidorWEB\\back\\softskills\\target\\softskills-0.0.1-SNAPSHOT.jar"
$backendTargetDir = Join-Path $deploymentDir "backend\\app"
$backendTarget = Join-Path $backendTargetDir "softskills.jar"

if (-not (Test-Path $frontendSource)) {
    throw "No existe la dist del frontend en: $frontendSource"
}

if (Test-Path $frontendTarget) {
    Remove-Item -Recurse -Force $frontendTarget
}

New-Item -ItemType Directory -Force -Path $frontendTarget | Out-Null
Copy-Item -Path (Join-Path $frontendSource "*") -Destination $frontendTarget -Recurse -Force

if (Test-Path $backendSource) {
    New-Item -ItemType Directory -Force -Path $backendTargetDir | Out-Null
    Copy-Item -Path $backendSource -Destination $backendTarget -Force
} else {
    Write-Warning "No se ha encontrado el JAR del backend en: $backendSource"
    Write-Warning "Cópialo manualmente a $backendTarget antes de hacer docker compose build."
}

Write-Host "Deployment preparado en: $deploymentDir"
Write-Host "Frontend copiado a: $frontendTarget"
if (Test-Path $backendTarget) {
    Write-Host "Backend copiado a: $backendTarget"
}
