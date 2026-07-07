# serve.ps1 -- tiny localhost static server for the POS Barcode Generator.
# Built on Windows PowerShell's HttpListener; localhost only.
#   Start:  powershell -ExecutionPolicy Bypass -File "C:\Users\Noah\Projects\pos-barcode\serve.ps1" [port]
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = if ($args.Count -ge 1) { [int]$args[0] } else { 8777 }
$prefix = "http://localhost:$port/"

$ctypes = @{
  ".html" = "text/html; charset=utf-8"; ".js" = "text/javascript; charset=utf-8";
  ".css" = "text/css; charset=utf-8"; ".json" = "application/json; charset=utf-8";
  ".svg" = "image/svg+xml"; ".ico" = "image/x-icon"; ".png" = "image/png"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch { Write-Host "Could not start on $prefix : $($_.Exception.Message)"; exit 1 }
Write-Host "POS Barcode Generator running at $prefix  (Ctrl+C to stop)"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request; $res = $ctx.Response
    $res.Headers.Add("Cache-Control", "no-store")
    $path = $req.Url.AbsolutePath
    $rel = if ($path -eq "/") { "index.html" } else { $path.TrimStart("/") }
    if ($rel -match "\.\.") { $res.StatusCode = 400; $res.Close(); continue }
    $file = Join-Path $root $rel
    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ct = if ($ctypes.ContainsKey($ext)) { $ctypes[$ext] } else { "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $res.StatusCode = 200; $res.ContentType = $ct; $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length); $res.OutputStream.Close()
    } else {
      $res.StatusCode = 404; $res.Close()
    }
  } catch {
    try { $res.StatusCode = 500; $res.Close() } catch {}
  }
}
