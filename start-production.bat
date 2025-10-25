@echo off
echo ========================================
echo Starting Personal Finance Tracker
echo ========================================
echo.

echo Building frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend!
    pause
    exit /b 1
)
cd ..

echo.
echo Starting production server...
call npm start

pause
