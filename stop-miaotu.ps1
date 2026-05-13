$ErrorActionPreference = "SilentlyContinue"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $projectRoot ".miaotu-server.pid"

if (Test-Path $pidFile) {
  $serverPid = Get-Content -LiteralPath $pidFile | Select-Object -First 1
  if ($serverPid) {
    Stop-Process -Id ([int]$serverPid) -Force
  }
  Remove-Item -LiteralPath $pidFile -Force
  Write-Host "MiaoTu local server stopped."
} else {
  Write-Host "No MiaoTu server PID file was found."
}
