# -*- coding: utf-8 -*-
"""Safe JSON session with filename sanitization for cross-platform
compatibility.

Windows filenames cannot contain: \\ / : * ? " < > |
This module wraps agentscope's SessionBase so that session_id and user_id
are sanitized before being used as filenames.
"""
import os
import re
import json
import logging
import shutil

from typing import Union, Sequence

import aiofiles
from agentscope.session import SessionBase
from agentscope_runtime.engine.schemas.exception import ConfigurationException
from ...exceptions import AgentStateError

logger = logging.getLogger(__name__)


# Characters forbidden in Windows filenames
_UNSAFE_FILENAME_RE = re.compile(r'[\\/:*?"<>|]')


def sanitize_filename(name: str) -> str:
    """Replace characters that are illegal in Windows filenames with ``--``.

    >>> sanitize_filename('discord:dm:12345')
    'discord--dm--12345'
    >>> sanitize_filename('normal-name')
    'normal-name'
    """
    return _UNSAFE_FILENAME_RE.sub("--", name)


class SafeJSONSession(SessionBase):
    """SessionBase subclass with filename sanitization and async file I/O.

    Overrides all file-reading/writing methods to use :mod:`aiofiles` so
    that disk I/O does not block the event loop.
    """

    def __init__(
        self,
        save_dir: str = "./",
    ) -> None:
        """Initialize the JSON session class.

        Args:
            save_dir (`str`, defaults to `"./"):
                The directory to save the session state.
        """
        self.save_dir = save_dir

    def _get_save_path(
        self,
        session_id: str,
        user_id: str,
        channel: str = "",
    ) -> str:
        """Return a filesystem-safe save path.

        Overrides the parent implementation to ensure the generated
        filename is valid on Windows, macOS and Linux.

        Args:
            session_id: Session identifier
            user_id: User identifier
            channel: Optional channel name for subdirectory separation

        Returns:
            Full path to the session file. If channel is provided,
            uses channels/{channel}/ subdirectory structure.
        """
        safe_sid = sanitize_filename(session_id)
        safe_uid = sanitize_filename(user_id) if user_id else ""

        if safe_uid:
            filename = f"{safe_uid}_{safe_sid}.json"
        else:
            filename = f"{safe_sid}.json"

        if channel:
            safe_channel = sanitize_filename(channel)
            target_dir = os.path.join(self.save_dir, safe_channel)
            os.makedirs(target_dir, exist_ok=True)
            target_path = os.path.join(target_dir, filename)

            legacy_path = os.path.join(self.save_dir, filename)
            if not os.path.exists(target_path) and os.path.exists(legacy_path):
                try:
                    shutil.copy2(legacy_path, target_path)
                    logger.info(
                        "Migrated session file from %s to %s",
                        legacy_path,
                        target_path,
                    )
                except OSError as exc:
                    logger.warning(
                        "Failed to migrate session file %s to %s: %s",
                        legacy_path,
                        target_path,
                        exc,
                    )

            return target_path

        os.makedirs(self.save_dir, exist_ok=True)
        return os.path.join(self.save_dir, filename)

    async def save_session_state(
        self,
        session_id: str,
        user_id: str = "",
        channel: str = "",
        **state_modules_mapping,
    ) -> None:
        """Save state modules to a JSON file using async I/O."""
        state_dicts = {
            name: state_module.state_dict()
            for name, state_module in state_modules_mapping.items()
        }
        session_save_path = self._get_save_path(
            session_id,
            user_id=user_id,
            channel=channel,
        )
        tmp_path = session_save_path + ".tmp"
        async with aiofiles.open(
            tmp_path,
            "w",
            encoding="utf-8",
        ) as f:
            await f.write(json.dumps(state_dicts, ensure_ascii=False))
        os.replace(tmp_path, session_save_path)

        logger.info(
            "Saved session state to %s successfully.",
            session_save_path,
        )

    async def load_session_state(
        self,
        session_id: str,
        user_id: str = "",
        channel: str = "",
        allow_not_exist: bool = True,
        **state_modules_mapping,
    ) -> None:
        """Load state modules from a JSON file using async I/O."""
        session_save_path = self._get_save_path(
            session_id,
            user_id=user_id,
            channel=channel,
        )
        if os.path.exists(session_save_path):
            async with aiofiles.open(
                session_save_path,
                "r",
                encoding="utf-8",
                errors="surrogatepass",
            ) as f:
                content = await f.read()
                states = json.loads(content)

            for name, state_module in state_modules_mapping.items():
                if name in states:
                    state_module.load_state_dict(states[name])
            logger.info(
                "Load session state from %s successfully.",
                session_save_path,
            )

        elif allow_not_exist:
            logger.info(
                "Session file %s does not exist. Skip loading session state.",
                session_save_path,
            )

        else:
            raise AgentStateError(
                session_id=session_id,
                message=(
                    f"Failed to load session state for file "
                    f"{session_save_path} because it does not exist"
                ),
            )

    async def update_session_state(
        self,
        session_id: str,
        key: Union[str, Sequence[str]],
        value,
        user_id: str = "",
        channel: str = "",
        create_if_not_exist: bool = True,
    ) -> None:
        session_save_path = self._get_save_path(
            session_id,
            user_id=user_id,
            channel=channel,
        )

        if os.path.exists(session_save_path):
            async with aiofiles.open(
                session_save_path,
                "r",
                encoding="utf-8",
                errors="surrogatepass",
            ) as f:
                content = await f.read()
                states = json.loads(content)

        else:
            if not create_if_not_exist:
                raise AgentStateError(
                    session_id=session_id,
                    message=f"Session file {session_save_path} does not exist",
                )
            states = {}

        path = key.split(".") if isinstance(key, str) else list(key)
        if not path:
            raise ConfigurationException(
                message="key path is empty",
            )

        cur = states
        for k in path[:-1]:
            if k not in cur or not isinstance(cur[k], dict):
                cur[k] = {}
            cur = cur[k]

        cur[path[-1]] = value

        tmp_path = session_save_path + ".tmp"
        async with aiofiles.open(
            tmp_path,
            "w",
            encoding="utf-8",
        ) as f:
            await f.write(json.dumps(states, ensure_ascii=False))
        os.replace(tmp_path, session_save_path)

        logger.info(
            "Updated session state key '%s' in %s successfully.",
            key,
            session_save_path,
        )

    async def get_session_state_dict(
        self,
        session_id: str,
        user_id: str = "",
        channel: str = "",
        allow_not_exist: bool = True,
    ) -> dict:
        """Return the session state dict from the JSON file.

        Args:
            session_id (`str`):
                The session id.
            user_id (`str`, default to `""`):
                The user ID for the storage.
            channel (`str`, default to `""`):
                The channel name for subdirectory separation.
            allow_not_exist (`bool`, defaults to `True`):
                Whether to allow the session to not exist. If `False`, raises
                an error if the session does not exist.

        Returns:
            `dict`:
                The session state dict loaded from the JSON file. Returns an
                empty dict if the file does not exist and
                `allow_not_exist=True`.
        """
        session_save_path = self._get_save_path(
            session_id,
            user_id=user_id,
            channel=channel,
        )
        if os.path.exists(session_save_path):
            async with aiofiles.open(
                session_save_path,
                "r",
                encoding="utf-8",
                errors="surrogatepass",
            ) as file:
                content = await file.read()
                states = json.loads(content)

            logger.info(
                "Get session state dict from %s successfully.",
                session_save_path,
            )
            return states

        if allow_not_exist:
            logger.info(
                "Session file %s does not exist. Return empty state dict.",
                session_save_path,
            )
            return {}

        raise AgentStateError(
            session_id=session_id,
            message=(
                f"Failed to get session state for file {session_save_path} "
                f"because it does not exist"
            ),
        )
