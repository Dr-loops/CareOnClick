# Safe Start Script for Dr. Kal's Virtual Hospital
# Kills any process listening on port 3000 before starting the server

Write-Host "Checking for processes on port 3000..." -ForegroundColor Cyan

$port = 3000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($process) {
    Write-Host "Found process on port $port. Terminating..." -ForegroundColor Yellow
    $process | ForEach-Object {
        try {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Process $($_.OwningProcess) terminated." -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to terminate process $($_.OwningProcess)." -ForegroundColor Red
        }
    }
}
else {
    Write-Host "Port $port is clear." -ForegroundColor Green
}

# Also kill node.exe generally to be safe if it's zombie
Write-Host "Cleaning up any zombie Node processes..." -ForegroundColor Cyan
taskkill /F /IM node.exe /T 2>$null

Write-Host "Starting Server..." -ForegroundColor Green
npm run dev
