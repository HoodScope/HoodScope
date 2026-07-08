@echo off
setlocal

echo.
echo  HoodScope CLI Installer
echo  =======================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [ERROR] Node.js not found. Install Node 18+ from https://nodejs.org
  exit /b 1
)

for /f "tokens=*" %%v in ('node -p "process.version.slice(1).split('.')[0]"') do set NODE_MAJOR=%%v
if %NODE_MAJOR% lss 18 (
  echo [ERROR] Node.js 18+ required. Current: 
  node -v
  exit /b 1
)

cd /d "%~dp0.."
set ROOT=%CD%

echo [1/3] Installing root dependencies...
call npm install
if %ERRORLEVEL% neq 0 exit /b 1

echo.
echo [2/3] Building CLI...
cd cli
call npm install
if %ERRORLEVEL% neq 0 exit /b 1
call npm run build
if %ERRORLEVEL% neq 0 exit /b 1

echo.
echo [3/3] Linking global command: hoodscope ...
call npm link
if %ERRORLEVEL% neq 0 exit /b 1

cd /d "%ROOT%"

echo.
echo  Done! Try:
echo    hoodscope scan 0xYOUR_ADDRESS
echo    hoodscope chains
echo    hoodscope skills
echo.
echo  Cursor agent skill:
echo    hoodscope install --skill
echo.
echo  Without global install, use:
echo    npm run cli -- scan 0xYOUR_ADDRESS
echo.

endlocal
