# -*- coding: utf-8 -*-
"""
演示经验蒸馏功能

使用方法：
    python scripts/demo_distill.py <workspace_dir> <agent_id>

示例：
    python scripts/demo_distill.py ~/.copaw/workspaces/default default
"""
import asyncio
import sys
import io
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))


async def demo_distill(workspace_dir: str, agent_id: str):
    """演示蒸馏功能"""
    from xclaw.agents.memory.reme_light_memory_manager import (
        ReMeLightMemoryManager,
    )

    print(f"\n{'='*60}")
    print("用户经验蒸馏演示")
    print(f"{'='*60}")
    print(f"Workspace: {workspace_dir}")
    print(f"Agent ID:  {agent_id}")
    print(f"{'='*60}\n")

    # 检查 workspace 是否存在
    ws_path = Path(workspace_dir).expanduser()
    if not ws_path.exists():
        print(f"❌ Workspace 不存在: {ws_path}")
        print("请先创建一个 Agent 或指定正确的 workspace 路径")
        return

    # 检查是否有记忆文件
    memory_md = ws_path / "MEMORY.md"
    memory_dir = ws_path / "memory"
    
    print("📂 检查记忆文件...")
    if memory_md.exists():
        print(f"  ✓ MEMORY.md 存在 ({memory_md.stat().st_size} bytes)")
    else:
        print(f"  ✗ MEMORY.md 不存在")
    
    if memory_dir.exists():
        md_files = list(memory_dir.glob("*.md"))
        print(f"  ✓ memory/ 目录存在 ({len(md_files)} 个 .md 文件)")
        for f in md_files[:5]:
            print(f"    - {f.name}")
        if len(md_files) > 5:
            print(f"    ... 还有 {len(md_files) - 5} 个文件")
    else:
        print(f"  ✗ memory/ 目录不存在")

    # 检查现有 PROFILE.md
    profile_md = ws_path / "PROFILE.md"
    print("\n📄 检查 PROFILE.md...")
    if profile_md.exists():
        content = profile_md.read_text(encoding="utf-8")
        print(f"  现有内容 ({len(content)} 字符):")
        print("-" * 40)
        # 只显示前 500 字符
        print(content[:500] + ("..." if len(content) > 500 else ""))
        print("-" * 40)
    else:
        print("  ✗ PROFILE.md 不存在，将被创建")

    # 初始化 Memory Manager
    print("\n🔧 初始化 ReMeLightMemoryManager...")
    try:
        manager = ReMeLightMemoryManager(
            working_dir=str(ws_path),
            agent_id=agent_id,
        )
        await manager.start()
        print("  ✓ Memory Manager 已启动")
    except Exception as e:
        print(f"  ❌ 初始化失败: {e}")
        return

    # 执行蒸馏
    print("\n🧪 开始执行经验蒸馏...")
    print("  (这可能需要 30-60 秒，取决于 LLM 响应速度)")
    print("-" * 40)
    
    try:
        await manager.distill_experience()
        print("-" * 40)
        print("  ✓ 蒸馏完成!")
    except Exception as e:
        print(f"  ❌ 蒸馏失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await manager.close()

    # 显示蒸馏后的 PROFILE.md
    print("\n📄 蒸馏后的 PROFILE.md:")
    print("=" * 40)
    if profile_md.exists():
        content = profile_md.read_text(encoding="utf-8")
        print(content)
    else:
        print("  (文件未生成)")
    print("=" * 40)

    # 检查备份
    backup_dir = ws_path / "backup"
    if backup_dir.exists():
        backups = list(backup_dir.glob("profile_backup_*.md"))
        if backups:
            print(f"\n📦 已创建 {len(backups)} 个备份:")
            for b in backups[-3:]:
                print(f"  - {b.name}")

    print("\n✅ 演示完成!")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        print("\n可用的 workspace 目录示例:")
        print("  ~/.copaw/workspaces/default")
        print("  ~/.copaw/workspaces/<agent_id>")
        sys.exit(1)

    workspace_dir = sys.argv[1]
    agent_id = sys.argv[2]

    asyncio.run(demo_distill(workspace_dir, agent_id))


if __name__ == "__main__":
    main()
