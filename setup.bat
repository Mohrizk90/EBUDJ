@echo off
echo ========================================
echo Personal Finance Tracker Setup
echo ========================================
echo.

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo To start production server, run:
echo   npm run production
echo.
pause
