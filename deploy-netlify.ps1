param(
    [string]$token = "nfp_7Kz74MMDkivrbvkg8mQ4bBAWLArRstHgc473",
    [string]$siteId = "db5c01a9-25dd-409a-a6a4-25873e93e871"
)

$rootDir = $PSScriptRoot
$zipPath = Join-Path $env:TEMP "metronomo_mk_prod.zip"

if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

Write-Host "1. Creando paquete ZIP de produccion..." -ForegroundColor Cyan

# Comprimir archivos directamente desde el root del proyecto usando tar
Set-Location $rootDir
& tar.exe -a -c -f $zipPath index.html manifest.json sw.js css js icons

if (-not (Test-Path $zipPath)) {
    Write-Host "Error: No se pudo generar el archivo ZIP." -ForegroundColor Red
    exit 1
}

$zipBytes = [System.IO.File]::ReadAllBytes($zipPath)
Write-Host "   Tamano del paquete ZIP: $([math]::Round($zipBytes.Length / 1KB, 2)) KB" -ForegroundColor Green

Write-Host "2. Desplegando en Netlify (Sitio ID: $siteId)..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/zip"
}

$deployUrl = "https://api.netlify.com/api/v1/sites/$siteId/deploys"

try {
    $response = Invoke-RestMethod -Uri $deployUrl -Headers $headers -Method Post -InFile $zipPath -ContentType "application/zip"
    
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " ¡DESPLIEGUE A PRODUCCION EXITOSO Y DEFINITIVO!" -ForegroundColor Green
    Write-Host " URL Permanente: $($response.ssl_url)" -ForegroundColor Yellow
    Write-Host " Estado: $($response.state)" -ForegroundColor Cyan
    Write-Host " Deploy ID: $($response.id)" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Green
} catch {
    Write-Host "Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Detalle del error: $($reader.ReadToEnd())" -ForegroundColor Red
    }
} finally {
    if (Test-Path $zipPath) { Remove-Item -Force $zipPath -ErrorAction SilentlyContinue }
}
