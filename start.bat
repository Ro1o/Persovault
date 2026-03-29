@echo off
echo Starting PersoVault...

start "Backend" cmd /k "cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3

start "Ngrok" cmd /k "ngrok http --domain=unavid-roentgenological-rikki.ngrok-free.dev 8000"

timeout /t 2

start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services started!