# -*- coding: utf-8 -*-
"""PyInstaller runtime hook: 阻止 agentscope_runtime.sandbox 在分析时初始化 Docker"""
import sys
import types

# 创建假模块阻止 sandbox 初始化
sandbox_mock = types.ModuleType("agentscope_runtime.sandbox")
sandbox_mock.__path__ = []
sys.modules["agentscope_runtime.sandbox"] = sandbox_mock
