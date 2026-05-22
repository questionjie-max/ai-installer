@echo off
echo ============================================
echo  🔧 AI Tool Installer - Windows 启动脚本
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [❌] 未检测到 Node.js
    echo.
    echo 请先安装 Node.js：https://nodejs.org
    echo 下载 LTS 版本，安装时勾选"Add to PATH"
    echo.
    pause
    exit /b 1
)

echo [✅] Node.js 已安装
echo.

REM Install dependencies if needed
if not exist "node_modules\" (
    echo [⏳] 正在安装依赖（首次运行，耗时约1-2分钟）...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [❌] 依赖安装失败
        pause
        exit /b 1
    )
    echo [✅] 依赖安装完成
    echo.
)

echo [🚀] 启动 AI Tool Installer...
npm start
pause
