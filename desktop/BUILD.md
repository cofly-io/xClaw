# xClaw 桌面端打包说明

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
  以便 `node_modules` 随 `xclaw/agents/skills` 一并打进 PyInstaller（否则仅有 `node.exe` 仍缺包）。

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
Copy-Item -Recurse -Force "console\dist\*" "src\xclaw\console\"
```

### 4. 打包（推荐）

在项目根目录执行（会自动同步 console、PyInstaller、复制 Python DLL、可选 NSIS 安装包）：

```powershell
python desktop/build.py
```

主程序：`dist/xClaw/xClaw.exe`。

或仅手动跑 PyInstaller（仍需自行处理 DLL 等与 `build.py` 里一致的步骤）：

```powershell
python -m PyInstaller desktop/xclaw.spec --clean --noconfirm
```

> 注意：在无 Python 的目标机上，需保证 `python3xx.dll` / `python3.dll` 与 `xClaw.exe` 同级。
> `build.py` 会在打包后自动从当前解释器目录复制这些 DLL。

### 5. 安装包（NSIS）

Windows 上默认会尝试生成 `dist/xClaw-Setup-<版本>.exe`（需已安装 [NSIS](https://nsis.sourceforge.io/)，
例如 `winget install NSIS.NSIS`）。跳过安装包：`python desktop/build.py --skip-installer`。

若已有完整的 `dist/xClaw/` 目录，也可手动执行（参数需与版本、路径一致）：

```powershell
makensis /DXCLAW_VERSION=1.2.3 /DUNPACKED=dist\xClaw /DOUTPUT_EXE=dist\xClaw-Setup-1.2.3.exe desktop\xclaw.nsi
```

## 注意事项

- 大模型等配置存储在 `~/.xClaw/`，不会被打包进 EXE，用户首次运行需自行配置
- `xclaw.spec` 使用 `subprocess` 获取包路径，避免 `import xclaw` 触发 pygame/litellm 等副作用导致打包卡死
- `hook-block-sandbox.py` 用于屏蔽 agentscope_runtime 的 sandbox，打包时必须存在

## 文件说明

| 文件 | 说明 |
|------|------|
| `main.py` | 桌面入口，PyWebView + uvicorn 启动后端 |
| `xclaw.spec` | PyInstaller 打包配置 |
| `build.py` | 一键打包脚本（推荐使用） |
| `xclaw.nsi` | NSIS 安装脚本（由 `build.py` 调用） |
| `hook-block-sandbox.py` | 运行时 hook，屏蔽 sandbox |
| `icon.ico` | 应用图标 |
| `instance_ipc.py` | 单实例 IPC（被 frozen 入口引用） |
