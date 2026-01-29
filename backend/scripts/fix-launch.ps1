# Run this script as Administrator to allow npm scripts to run if you see "SecurityError"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Write-Host "Execution policy updated. You should now be able to run 'npm run dev:firefox'." -ForegroundColor Green
