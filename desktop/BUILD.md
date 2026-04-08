# supOS X 打包说明

## 环境要求

- Python 3.13+
- Node.js + pnpm（仅用于构建 console；**最终用户无需安装 Node**）
- PyInstaller 6.x：`pip install pyinstaller`
- pywebview：`pip install pywebview`

### 便携 Node（docx 等依赖 Node 的技能）

在 **Windows 上** 执行 `python desktop/build.py` 时，脚本会从 nodejs.org 下载固定版本的
`node-v*-win-x64.zip`，解压到 `dist/xClaw/node/`（与 `xClaw.exe` 同级）。 frozen 启动时会把该目录
排在 `PATH` 最前，shell 技能执行 `node ...` 时会用到这里的 `node.exe`。

- 离线构建：把上述 zip 放到 `desktop/node-v20.18.1-win-x64.zip` 或 `desktop/cache/` 下同名文件。
- 跳过：加 `--skip-node-bundle`（需自行保证目标机有 Node 或手动拷贝 `node/` 目录）。
- **npm 依赖**：若技能目录含 `package.json`，需在打包前于该目录执行 `npm ci` / `npm install`，
  以便 `node_modules` 随 `copaw/agents/skills` 一并打进 PyInstaller（否则仅有 `node.exe` 仍缺包）。

## 打包步骤

### 1. 安装 Python 依赖

在项目根目录执行：

```powershell
pip install -e .
```

### 2. 构建前端

```powershell
cd console
pnpm install
pnpm build
```

### 3. 同步前端产物到后端静态目录

```powershell
Copy-Item -Recurse -Force "console\dist\*" "src\copaw\console\"
```

### 4. 打包

在项目根目录执行（推荐，会自动处理 DLL 复制）：

```powershell
python desktop/build.py
```

或者手动分步：

```powershell
python -m PyInstaller desktop/suposx.spec --clean --noconfirm
```

输出在 `dist/supOS X/`，主程序为 `dist/supOS X/supOS X.exe`。

> 注意：直接用 PyInstaller 打包后，需要手动把 `python313.dll` 和 `python3.dll` 从 Python 安装目录复制到 `dist/supOS X/` 同级，否则在无 Python 环境的机器上会报 `failed to load python313.dll`。`build.py` 会自动完成这一步。

### 5. 可选：生成安装包

需要安装 [NSIS](https://nsis.sourceforge.io/)，然后执行：

```powershell
makensis desktop/installer.nsi
```

## 注意事项

- 大模型配置存储在 `~/.copaw/`，不会被打包进 EXE，用户首次运行需自行配置
- spec 文件使用 `subprocess` 获取包路径，避免 `import copaw` 触发 pygame/litellm 等副作用导致打包卡死
- `hook-block-sandbox.py` 用于屏蔽 agentscope_runtime 的 sandbox，打包时必须存在

## 文件说明

| 文件 | 说明 |
|------|------|
| `main.py` | 桌面入口，PyWebView + uvicorn 启动后端 |
| `suposx.spec` | PyInstaller 打包配置 |
| `build.py` | 打包脚本，自动处理 DLL 复制（推荐使用） |
| `hook-block-sandbox.py` | 运行时 hook，屏蔽 sandbox |
| `icon.ico` | 应用图标 |
| `installer.nsi` | NSIS 安装包脚本 |
