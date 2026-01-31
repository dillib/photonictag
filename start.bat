@echo off
echo ========================================
echo Starting PhotonicTag Server
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

echo DATABASE_URL: %DATABASE_URL%
echo PORT: %PORT%
echo.
echo Starting server on http://localhost:%PORT%
echo Press Ctrl+C to stop
echo.

call npm run dev
