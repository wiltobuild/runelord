$ErrorActionPreference = 'Stop'
$galleryUrl = 'http://localhost:4317'
try { $null = Invoke-RestMethod "$galleryUrl/api/art" -TimeoutSec 3 } catch {
    $galleryNode = (Get-Command node -ErrorAction Stop).Source
    Start-Process -FilePath $galleryNode -ArgumentList ('"' + (Join-Path $PSScriptRoot 'server.mjs') + '"') -WindowStyle Hidden
}
Start-Process $galleryUrl
