param(
    [string]$token = "nfp_7Kz74MMDkivrbvkg8mQ4bBAWLArRstHgc473"
)

$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "Consultando sitios en Netlify..." -ForegroundColor Cyan
try {
    $sites = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites" -Headers $headers -Method Get
    Write-Host "Sitios encontrados:" -ForegroundColor Green
    $sites | ForEach-Object {
        Write-Host " - Nombre: $($_.name) | URL: $($_.ssl_url) | ID: $($_.id)"
    }
} catch {
    Write-Host "Error consultando Netlify: $($_.Exception.Message)" -ForegroundColor Red
}
