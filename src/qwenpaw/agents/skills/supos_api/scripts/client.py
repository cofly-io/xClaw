# -*- coding: utf-8 -*-
"""DEPRECATED: supOS API calling script.

This repository ships an in-process tool `supos_api_call` that works reliably
both in dev and in the desktop executable built by PyInstaller.

Do NOT run external `python` scripts (including this file) to call supOS:
- output can be swallowed in some runtimes
- file output can be unreliable / blocked
- the desktop exe environment may not have a usable system python

Use the built-in tool instead (from the agent/tooling layer):
  supos_api_call(method="get|post|put|delete", path="/os/open-api/...", data={...})
"""

import sys


def main() -> None:
    sys.stderr.write(
        "This script is deprecated.\n"
        "Use the built-in `supos_api_call` tool (in-process) instead.\n",
    )
    raise SystemExit(2)


if __name__ == "__main__":
    main()
