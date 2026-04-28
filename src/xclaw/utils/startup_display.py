# -*- coding: utf-8 -*-
"""Fancy startup display utilities using rich."""
from __future__ import annotations

from typing import Optional, Tuple

from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.tree import Tree

from ..constant import PROJECT_NAME


def print_ready_banner(
    api_info: Optional[Tuple[str, int]] = None,
    elapsed_seconds: Optional[float] = None,
) -> None:
    """Print a ready banner with rich formatting (host/port + startup time).

    Args:
        api_info: Optional tuple of (host, port) for the server URL.
        elapsed_seconds: Optional startup time in seconds to display.
    """
    console = Console()
    console.print()

    brand = PROJECT_NAME
    if api_info:
        host, port = api_info
        url = f"http://{host}:{port}"
        tree = Tree(
            f"[bold green]✓[/bold green] [bold]{brand}[/bold]",
            guide_style="bright_black",
        )
        tree.add("[dim]Status:[/dim]  [bold green]Ready[/bold green]")
        tree.add(
            f"[dim]Address:[/dim] [blue underline]{url}[/blue underline]",
        )
        if elapsed_seconds is not None:
            tree.add(
                f"[dim]Startup:[/dim] [yellow]{elapsed_seconds:.3f}s[/yellow]",
            )
        panel = Panel(
            tree,
            border_style="green",
            box=box.ROUNDED,
            padding=(1, 2),
            expand=False,
        )
    else:
        tree = Tree(
            f"[bold green]✓[/bold green] [bold]{brand}[/bold]",
            guide_style="bright_black",
        )
        tree.add("[dim]Status:[/dim]  [bold green]Ready[/bold green]")
        if elapsed_seconds is not None:
            tree.add(
                f"[dim]Startup:[/dim] [yellow]{elapsed_seconds:.3f}s[/yellow]",
            )
        panel = Panel(
            tree,
            border_style="green",
            box=box.ROUNDED,
            padding=(1, 2),
            expand=False,
        )

    console.print(panel)
    console.print()
