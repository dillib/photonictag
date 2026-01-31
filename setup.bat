@echo off
echo ========================================
echo PhotonicTag SAP Connector - Full Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b %errorlevel%
)
echo.

echo Step 2: Setting up database...
call npm run setup
if %errorlevel% neq 0 (
    echo ERROR: Failed to setup database
    pause
    exit /b %errorlevel%
)
echo.

echo ========================================
echo Setup complete! Starting server...
echo ========================================
echo.

REM Load environment variables from .env file
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if not "%%b"=="" (
        if not "%%a"=="#" (
            set "%%a=%%b"
        )
    )
)

echo Server starting at: http://localhost:5000
echo.
echo SAP Connector Features:
echo  - 100 mock SAP materials pre-loaded
echo  - Bidirectional sync engine ready
echo  - Live progress visualization
echo  - Full audit trail
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev
