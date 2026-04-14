# -*- coding: utf-8 -*-
"""Allow running xClaw via ``python -m xclaw``."""
from .cli.main import cli

if __name__ == "__main__":
    cli()  # pylint: disable=no-value-for-parameter
