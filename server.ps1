# Servidor HTTP ligero en PowerShell para pruebas locales de PWA (Metrónomo MK)
$port = 8080
$path = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()

Write-Output "Servidor HTTP iniciado en http://localhost:8080/"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8";
    ".css"  = "text/css; charset=utf-8";
    ".js"   = "application/javascript; charset=utf-8";
    ".json" = "application/json; charset=utf-8";
    ".svg"  = "image/svg+xml";
    ".png"  = "image/png";
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq '/' -or $urlPath -eq '') {
            $urlPath = '/index.html'
        }

        $subPath = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $path $subPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $contentType = $mimeTypes[$ext]
            }
            $response.ContentType = $contentType
            $response.Headers.Add('Access-Control-Allow-Origin', '*')

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}
