# -*- coding: utf-8 -*-
"""Normalize agent messages before sending them to the model API.

Clones message lists so history is not mutated, and optionally strips
image/audio/video blocks when the active model does not support them.
"""

from __future__ import annotations

import copy
from typing import Any, List

from agentscope.message import Msg

from ...constant import MEDIA_UNSUPPORTED_PLACEHOLDER

_MEDIA_TYPES = frozenset({"image", "video", "audio"})


def _clone_msg(msg: Msg) -> Msg:
    return copy.deepcopy(msg)


def _clone_messages(msgs: List[Msg]) -> List[Msg]:
    return [_clone_msg(m) for m in msgs]


def _strip_media_blocks_in_place(msgs: List[Msg]) -> int:
    """Remove media blocks from messages in place. Returns blocks removed."""
    total = 0
    for msg in msgs:
        content = msg.content
        if not isinstance(content, list):
            continue

        new_content: list[Any] = []
        stripped_here = 0

        for block in content:
            if isinstance(block, dict) and block.get("type") in _MEDIA_TYPES:
                total += 1
                stripped_here += 1
                continue

            if (
                isinstance(block, dict)
                and block.get("type") == "tool_result"
                and isinstance(block.get("output"), list)
            ):
                original = block["output"]
                filtered = [
                    item
                    for item in original
                    if not (
                        isinstance(item, dict)
                        and item.get("type") in _MEDIA_TYPES
                    )
                ]
                removed = len(original) - len(filtered)
                if removed:
                    total += removed
                    stripped_here += removed
                    if not filtered:
                        block["output"] = MEDIA_UNSUPPORTED_PLACEHOLDER
                    else:
                        block["output"] = filtered

            new_content.append(block)

        if not new_content and stripped_here > 0:
            new_content.append(
                {"type": "text", "text": MEDIA_UNSUPPORTED_PLACEHOLDER},
            )

        msg.content = new_content

    return total


def normalize_messages_for_model_request(
    msgs: List[Msg],
    *,
    supports_multimodal: bool,
) -> List[Msg]:
    """Return a copy of ``msgs`` suitable for the model request.

    Original messages are never modified. When ``supports_multimodal`` is
    false, image/audio/video blocks are replaced with placeholder text
    (including media nested in tool results).
    """
    cloned = _clone_messages(msgs)
    if not supports_multimodal:
        _strip_media_blocks_in_place(cloned)
    return cloned
