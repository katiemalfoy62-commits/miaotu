$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 5175
$pidFile = Join-Path $projectRoot ".miaotu-server.pid"
$viteCli = Join-Path $projectRoot "node_modules\vite\bin\vite.js"

function Find-Node {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  $bundled = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path $bundled) {
    return $bundled
  }

  throw "Node.js was not found. Install Node.js first, then run this script again."
}

function Test-Server {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

if (-not (Test-Path $viteCli)) {
  throw "Vite was not found in node_modules. Run npm install in $projectRoot first."
}

if (Test-Server) {
  Start-Process "http://127.0.0.1:$port/"
  exit 0
}

$node = Find-Node
$args = "`"$viteCli`" --host 127.0.0.1 --port $port"
$process = Start-Process -FilePath $node -ArgumentList $args -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
$process.Id | Set-Content -LiteralPath $pidFile -Encoding ASCII

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:$port/"
