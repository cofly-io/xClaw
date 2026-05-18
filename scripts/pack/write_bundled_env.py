#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Write encrypted xclaw.env for desktop bundles (Windows / macOS)."""
from __future__ import annotations

import argparse
import os
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from desktop.build import resolve_supos_ak  # noqa: E402
from xclaw.security.bundled_env import write_bundled_env_file  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Write xclaw.env with SUPOS_AK_ENC")
    parser.add_argument("--output", required=True, help="Target xclaw.env path")
    parser.add_argument("--supos-ak", default="", help="Plaintext SUPOS_AK")
    parser.add_argument(
        "--supos-ak-file",
        default="",
        help="File with SUPOS_AK=... (default: desktop/supos_ak.env)",
    )
    parser.add_argument(
        "--allow-missing",
        action="store_true",
        help="Exit 0 when SUPOS_AK is not configured",
    )
    args = parser.parse_args()

    ak = resolve_supos_ak(args.supos_ak, args.supos_ak_file)
    if not ak:
        if args.allow_missing:
            print("==> SUPOS_AK not set; skipping xclaw.env")
            return
        print(
            "ERROR: SUPOS_AK required.\n"
            "  export SUPOS_AK=... or create desktop/supos_ak.env\n"
            "  or: --supos-ak YOUR_KEY",
            file=sys.stderr,
        )
        sys.exit(1)

    write_bundled_env_file(args.output, ak)
    print(f"==> Wrote {args.output} (SUPOS_AK_ENC)")


if __name__ == "__main__":
    main()
