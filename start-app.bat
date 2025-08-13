@echo off
echo Starting AI Tutor Application...
echo.

echo Installing backend dependencies...
cd /d "%~dp0"
npm install

echo.
echo Installing frontend dependencies...
cd client
npm install

echo.
echo Starting backend server...
cd ..
start "Backend Server" cmd /k "npm start"

echo.
echo Starting frontend server...
cd client
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Application is starting up...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this script...
pause > nul
