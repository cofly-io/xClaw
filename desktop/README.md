# supOS X 个人助手 - 桌面打包

## 前置条件

- Python 3.10+（已安装 copaw 项目依赖）
- pnpm（前端构建）
- NSIS（可选，生成安装包）

## 快速构建

```powershell
powershell -ExecutionPolicy Bypass -File desktop\build.ps1
```

## 手动构建

```powershell
# 1. 构建前端
cd console
pnpm install; pnpm build
cd ..

# 2. 复制前端到后端
Copy-Item -Recurse -Force "console\dist\*" "src\copaw\console\"

# 3. 生成图标
python desktop\convert_icon.py

# 4. 安装 PyInstaller
pip install pyinstaller

# 5. 打包
cd desktop
pyinstaller suposx.spec --clean --noconfirm

# 6. 运行测试
dist\supOS X\supOS X.exe
```

## 生成安装包（可选）

安装 [NSIS](https://nsis.sourceforge.io/) 后：

```powershell
cd desktop
makensis installer.nsi
```

输出：`desktop\supOS-X-Setup.exe`

## 输出目录

```
desktop/
├── dist/
│   └── supOS X/        # PyInstaller 输出（可直接运行）
│       ├── supOS X.exe
│       └── ...
└── supOS-X-Setup.exe   # NSIS 安装包
```
