# supOS X 个人助手 - 构建脚本
# 用法: powershell -ExecutionPolicy Bypass -File desktop\build.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  supOS X 个人助手 - 构建开始" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ─── Step 1: 构建前端 ───
Write-Host "`n[1/5] 构建前端..." -ForegroundColor Yellow
Set-Location console
pnpm install
pnpm build
Set-Location ..

# ─── Step 2: 复制前端到后端静态目录 ───
Write-Host "`n[2/5] 复制前端到后端..." -ForegroundColor Yellow
if (Test-Path "src\copaw\console") {
    Remove-Item -Recurse -Force "src\copaw\console"
}
New-Item -ItemType Directory -Path "src\copaw\console" -Force | Out-Null
Copy-Item -Recurse -Force "console\dist\*" "src\copaw\console\"

# ─── Step 3: 生成图标 ───
Write-Host "`n[3/5] 生成图标..." -ForegroundColor Yellow
if (-not (Test-Path "desktop\icon.ico")) {
    python desktop\convert_icon.py
}

# ─── Step 4: PyInstaller 打包 ───
Write-Host "`n[4/5] PyInstaller 打包..." -ForegroundColor Yellow
pip install pyinstaller --quiet
Set-Location desktop
pyinstaller suposx.spec --clean --noconfirm
Set-Location ..

# ─── Step 5: NSIS 安装包（可选） ───
$nsis = Get-Command makensis -ErrorAction SilentlyContinue
if ($nsis) {
    Write-Host "`n[5/5] 生成安装包..." -ForegroundColor Yellow
    Set-Location desktop
    makensis installer.nsi
    Set-Location ..
    Write-Host "`n安装包: desktop\supOS-X-Setup.exe" -ForegroundColor Green
} else {
    Write-Host "`n[5/5] 跳过 NSIS（未安装）" -ForegroundColor DarkYellow
    Write-Host "  可直接运行: desktop\dist\supOS X\supOS X.exe" -ForegroundColor DarkYellow
    Write-Host "  安装 NSIS 后可生成安装包: https://nsis.sourceforge.io/" -ForegroundColor DarkYellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  构建完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
