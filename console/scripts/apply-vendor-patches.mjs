/**
 * Idempotent hotfixes for vendor packages (React keys, antd deprecations).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function patchFile(rel, sentinel, apply) {
  const file = path.join(root, "node_modules", ...rel.split("/"));
  if (!fs.existsSync(file)) return;
  let s = fs.readFileSync(file, "utf8");
  if (sentinel && s.includes(sentinel)) return;
  const next = apply(s);
  if (next !== s) fs.writeFileSync(file, next, "utf8");
}

const SENDER_NEEDLE = `              children: [allowSpeech && /*#__PURE__*/_jsx(ActionButtonContext.Provider, {
                value: contextValue,
                children: /*#__PURE__*/_jsx(SpeechButton, {})
              }), prefix]`;

const SENDER_REPL = `              children: [allowSpeech && /*#__PURE__*/_jsx(ActionButtonContext.Provider, {
                value: contextValue,
                children: /*#__PURE__*/_jsx(SpeechButton, {})
              }, "sender-speech")].concat(_toConsumableArray(prefix.map(function (node, index) {
                return /*#__PURE__*/_jsx(_Fragment, {
                  children: node
                }, "sender-prefix-".concat(index));
              })))`;

patchFile("@agentscope-ai/chat/lib/Sender/index.js", "sender-prefix-", (s) =>
  s.includes(SENDER_NEEDLE) ? s.replace(SENDER_NEEDLE, SENDER_REPL) : s,
);

const INPUT_PREFIX_NEEDLE = `          children: [uploadPrefixNodes, onInput === null || onInput === void 0 ? void 0 : onInput.morePrefixActions]`;

const INPUT_PREFIX_REPL = `          children: [/*#__PURE__*/_jsx(_Fragment, {
            children: uploadPrefixNodes
          }, "chat-anywhere-upload-prefix"), onInput !== null && onInput !== void 0 && onInput.morePrefixActions ? /*#__PURE__*/_jsx(_Fragment, {
            children: onInput.morePrefixActions
          }, "chat-anywhere-more-prefix") : null]`;

const INPUT_SPAN_NEEDLE = `          children: [item.title && /*#__PURE__*/_jsx("span", {
            children: item.title
          }), item.description && /*#__PURE__*/_jsx("span", {
            style: {
              fontSize: '0.8em',
              opacity: 0.8
            },
            children: item.description
          })]`;

const INPUT_SPAN_REPL = `          children: [item.title && /*#__PURE__*/_jsx("span", {
            children: item.title,
            key: "title"
          }), item.description && /*#__PURE__*/_jsx("span", {
            style: {
              fontSize: '0.8em',
              opacity: 0.8
            },
            children: item.description,
            key: "desc"
          })]`;

patchFile("@agentscope-ai/chat/lib/ChatAnywhere/Input/index.js", "chat-anywhere-upload-prefix", (s) => {
  let t = s;
  if (t.includes(INPUT_PREFIX_NEEDLE)) t = t.replace(INPUT_PREFIX_NEEDLE, INPUT_PREFIX_REPL);
  if (t.includes(INPUT_SPAN_NEEDLE)) t = t.replace(INPUT_SPAN_NEEDLE, INPUT_SPAN_REPL);
  return t;
});

patchFile("@agentscope-ai/chat/lib/Sender/components/ActionButton.js", "ANTD_ACTION_BUTTON_HOTFIX", (s) => {
  let t = s;
  // Step 1: fix forwardRef signature if still old.
  if (t.includes("export function ActionButton(props)")) {
    t = t
      .replace(
        "export function ActionButton(props) {",
        "function ActionButtonInner(props, ref) {",
      )
      .replace(
        "  }, restProps), {}, {\n    disabled: mergedDisabled,",
        "  }, restProps), {}, {\n    ref: ref,\n    disabled: mergedDisabled,",
      )
      .replace(
        "export default /*#__PURE__*/React.forwardRef(ActionButton);",
        "export var ActionButton = /*#__PURE__*/React.forwardRef(ActionButtonInner);\nexport default ActionButton;",
      );
  }

  // Step 2: replace design IconButton path to avoid Tooltip deprecation chain.
  t = t.replace(
    /import \{ IconButton \} from '@agentscope-ai\/design';/,
    "import { Button as AntdButton } from 'antd';",
  );
  t = t.replace(
    /return \/\*#\__PURE__\*\/_jsx\(IconButton, _objectSpread\(_objectSpread\(\{\s*bordered: false\s*\}, restProps\), \{\}, \{/,
    "return /*#__PURE__*/_jsx(AntdButton, _objectSpread(_objectSpread({\n    // ANTD_ACTION_BUTTON_HOTFIX: bypass design IconButton/Tooltip wrapper.\n    type: 'text',\n    icon: restProps.icon\n  }, restProps), {}, {",
  );
  return t;
});

const TOOLTIP_RETURN_NEEDLE = `    antPrefix = _getCommonConfig.antPrefix;
  return /*#__PURE__*/_jsxs(_Fragment, {`;

const TOOLTIP_RETURN_REPL = `    antPrefix = _getCommonConfig.antPrefix;
  var userClassNames = restProps.classNames;
  return /*#__PURE__*/_jsxs(_Fragment, {`;

const TOOLTIP_OVERLAY_NEEDLE = `      overlayClassName: classNames(overlayClassName, mode === 'light' && "".concat(sparkPrefix, "-tooltip-light")),`;

const TOOLTIP_CLASSNAMES_REPL = `      classNames: _objectSpread(_objectSpread({}, userClassNames), {}, {
        root: classNames(overlayClassName, mode === 'light' && "".concat(sparkPrefix, "-tooltip-light"), userClassNames && userClassNames.root)
      }),`;

patchFile(
  "@agentscope-ai/design/lib/components/commonComponents/Tooltip/index.js",
  "userClassNames = restProps.classNames",
  (s) => {
    let t = s;
    if (t.includes(TOOLTIP_RETURN_NEEDLE)) t = t.replace(TOOLTIP_RETURN_NEEDLE, TOOLTIP_RETURN_REPL);
    if (t.includes(TOOLTIP_OVERLAY_NEEDLE)) t = t.replace(TOOLTIP_OVERLAY_NEEDLE, TOOLTIP_CLASSNAMES_REPL);
    return t;
  },
);

patchFile("@agentscope-ai/chat/lib/ChatAnywhere/Chat/index.js", "FLUSHSYNC_HOTFIX", (s) => {
  if (!s.includes("flushSync(function () {")) return s;
  return s
    .replace(
      "      setTimeout(function () {\n        flushSync(function () {\n          return setDisplayCount(function (prev) {\n            return prev + PAGE_SIZE;\n          });\n        });\n        resolve();\n      }, 300);",
      "      setTimeout(function () {\n        // FLUSHSYNC_HOTFIX: avoid flushSync during lifecycle render paths.\n        setDisplayCount(function (prev) {\n          return prev + PAGE_SIZE;\n        });\n        resolve();\n      }, 300);",
    )
    .replace(
      "import { flushSync } from 'react-dom';\n",
      "",
    );
});

// Patch Markdown Link to avoid leaking non-DOM props onto <a>
// (e.g. domNode / streamStatus from markdown pipeline).
const MARKDOWN_LINK_NEEDLE = `export default function Link(props) {
  if (props['data-footnote-ref'] === '') return /*#__PURE__*/_jsx(Sup, _objectSpread({}, props));
  if (props.children === '↩' && props['data-footnote-backref'] === '') return null;
  return /*#__PURE__*/_jsx("a", _objectSpread({}, props));
}`;

const MARKDOWN_LINK_REPL = `export default function Link(props) {
  // LINK_PROP_FILTER: strip non-DOM props to silence React warnings.
  var cleaned = _objectWithoutProperties(props, ["domNode", "streamStatus"]);
  if (cleaned['data-footnote-ref'] === '') return /*#__PURE__*/_jsx(Sup, _objectSpread({}, cleaned));
  if (cleaned.children === '↩' && cleaned['data-footnote-backref'] === '') return null;
  return /*#__PURE__*/_jsx("a", _objectSpread({}, cleaned));
}`;

patchFile(
  "@agentscope-ai/chat/lib/Markdown/core/components/Link.js",
  "LINK_PROP_FILTER",
  (s) => (s.includes(MARKDOWN_LINK_NEEDLE) ? s.replace(MARKDOWN_LINK_NEEDLE, MARKDOWN_LINK_REPL) : s),
);

// Patch Tool.js to show Chinese tool names in the chat UI.
const TOOL_TITLE_NEEDLE = `var title = "".concat(serverLabel).concat(toolName);`;
const TOOL_TITLE_REPL = `var TOOL_LABELS_ZH = {
  read_file: '读取文件', write_file: '写入文件', edit_file: '编辑文件', append_file: '追加文件',
  execute_shell_command: '执行命令', grep_search: '搜索内容', glob_search: '搜索文件',
  desktop_screenshot: '截取屏幕', browser_use: '操控浏览器',
  view_image: '查看图片', view_video: '查看视频',
  get_current_time: '获取当前时间', set_user_timezone: '设置时区',
  list_agents: '列出助手', chat_with_agent: '与助手对话',
  send_file_to_user: '发送文件给用户', get_token_usage: '获取用量',
  supos_api_call: 'SupOS API 调用', memory_search: '搜索记忆',
  list_directory: '列出目录'
};
var title = "".concat(serverLabel).concat(TOOL_LABELS_ZH[toolName] || toolName);`;

patchFile(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Tool.js",
  "TOOL_LABELS_ZH",
  (s) => s.includes(TOOL_TITLE_NEEDLE) ? s.replace(TOOL_TITLE_NEEDLE, TOOL_TITLE_REPL) : s,
);

/**
 * @ant-design/x CodeHighlighter uses dynamic import(`.../prism/${lang}`), which
 * browsers cannot resolve after Vite transform. Use static import paths per language.
 */
function patchAntDesignXCodeHighlighterEs() {
  const pnpmDir = path.join(root, "node_modules", ".pnpm");
  if (!fs.existsSync(pnpmDir)) return;
  const sentinel = "VITE_PRISM_LANG_HOTFIX";
  const loaderBlock = `const ${sentinel}_LOADERS = {
  json: () => import('react-syntax-highlighter/dist/esm/languages/prism/json.js'),
  javascript: () => import('react-syntax-highlighter/dist/esm/languages/prism/javascript.js'),
  js: () => import('react-syntax-highlighter/dist/esm/languages/prism/javascript.js'),
  typescript: () => import('react-syntax-highlighter/dist/esm/languages/prism/typescript.js'),
  ts: () => import('react-syntax-highlighter/dist/esm/languages/prism/typescript.js'),
  tsx: () => import('react-syntax-highlighter/dist/esm/languages/prism/tsx.js'),
  jsx: () => import('react-syntax-highlighter/dist/esm/languages/prism/jsx.js'),
  python: () => import('react-syntax-highlighter/dist/esm/languages/prism/python.js'),
  py: () => import('react-syntax-highlighter/dist/esm/languages/prism/python.js'),
  ruby: () => import('react-syntax-highlighter/dist/esm/languages/prism/ruby.js'),
  rust: () => import('react-syntax-highlighter/dist/esm/languages/prism/rust.js'),
  kotlin: () => import('react-syntax-highlighter/dist/esm/languages/prism/kotlin.js'),
  csharp: () => import('react-syntax-highlighter/dist/esm/languages/prism/csharp.js'),
  cs: () => import('react-syntax-highlighter/dist/esm/languages/prism/csharp.js'),
  markdown: () => import('react-syntax-highlighter/dist/esm/languages/prism/markdown.js'),
  md: () => import('react-syntax-highlighter/dist/esm/languages/prism/markdown.js'),
  yaml: () => import('react-syntax-highlighter/dist/esm/languages/prism/yaml.js'),
  yml: () => import('react-syntax-highlighter/dist/esm/languages/prism/yaml.js'),
  shell: () => import('react-syntax-highlighter/dist/esm/languages/prism/bash.js'),
  bash: () => import('react-syntax-highlighter/dist/esm/languages/prism/bash.js'),
  sh: () => import('react-syntax-highlighter/dist/esm/languages/prism/bash.js'),
  zsh: () => import('react-syntax-highlighter/dist/esm/languages/prism/bash.js'),
  sql: () => import('react-syntax-highlighter/dist/esm/languages/prism/sql.js'),
  css: () => import('react-syntax-highlighter/dist/esm/languages/prism/css.js'),
  html: () => import('react-syntax-highlighter/dist/esm/languages/prism/markup.js'),
  xml: () => import('react-syntax-highlighter/dist/esm/languages/prism/markup.js'),
  diff: () => import('react-syntax-highlighter/dist/esm/languages/prism/diff.js'),
  dockerfile: () => import('react-syntax-highlighter/dist/esm/languages/prism/docker.js'),
};
`;
  const newGetAsync = `const getAsyncHighlighter = lang => {
  if (!highlighterCache.has(lang)) {
    const resolvedLang = ${sentinel}_LOADERS[lang] ? lang : 'javascript';
    const LazyHighlighter = /*#__PURE__*/lazy(async () => {
      try {
        const load = ${sentinel}_LOADERS[resolvedLang] || ${sentinel}_LOADERS.javascript;
        const mod = await load();
        if (mod != null && mod.default) {
          SyntaxHighlighter.registerLanguage(resolvedLang, mod.default);
        }
      } catch (error) {
        console.warn(\`[CodeHighlighter] Failed to load language: \${lang}\`, error);
      }
      return {
        default: ({
          children,
          ...rest
        }) => /*#__PURE__*/React.createElement(SyntaxHighlighter, _extends({
          language: resolvedLang
        }, rest), children)
      };
    });
    highlighterCache.set(lang, LazyHighlighter);
  }
  return highlighterCache.get(lang);
};`;

  for (const dir of fs.readdirSync(pnpmDir)) {
    if (!dir.startsWith("@ant-design+x@")) continue;
    const file = path.join(
      pnpmDir,
      dir,
      "node_modules",
      "@ant-design",
      "x",
      "es",
      "code-highlighter",
      "CodeHighlighter.js",
    );
    if (!fs.existsSync(file)) continue;
    let s = fs.readFileSync(file, "utf8");
    if (s.includes(sentinel)) continue;
    const marker = "const getAsyncHighlighter = lang => {";
    const idx = s.indexOf(marker);
    if (idx === -1) continue;
    const endMarker = "const getFullPrismHighlighter";
    const endIdx = s.indexOf(endMarker, idx);
    if (endIdx === -1) continue;
    s =
      s.slice(0, idx) +
      loaderBlock +
      "\n" +
      newGetAsync +
      "\n" +
      s.slice(endIdx);
    fs.writeFileSync(file, s, "utf8");
  }
}

patchAntDesignXCodeHighlighterEs();

patchFile(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereSessionsContext.js",
  "FLUSHSYNC_SESSIONS_HOTFIX",
  (s) => {
    let t = s;
    if (t.includes("ReactDOM.flushSync(function () {\n            setMessages([]);\n          });")) {
      t = t.replace(
        "ReactDOM.flushSync(function () {\n            setMessages([]);\n          });",
        "// FLUSHSYNC_SESSIONS_HOTFIX: avoid flushSync during lifecycle rendering.\n          setMessages([]);",
      );
    }
    t = t.replace("import * as ReactDOM from 'react-dom';\n", "");
    return t;
  },
);

const MESSAGE_LIST_IMPORT_NEEDLE = `import { ChatAnywhereSessionsContext } from "../../Context/ChatAnywhereSessionsContext";
import cls from 'classnames';`;

const MESSAGE_LIST_IMPORT_REPL = `import { ChatAnywhereSessionsContext } from "../../Context/ChatAnywhereSessionsContext";
import { useChatAnywhereOptions } from "../../Context/ChatAnywhereOptionsContext";
import cls from 'classnames';`;

const MESSAGE_LIST_MESSAGES_NEEDLE = `  var messages = useContextSelector(ChatAnywhereMessagesContext, function (v) {
    return v.messages;
  });
  var safeMessages = React.useMemo(function () {
    return _toConsumableArray(messages || []).reverse();
  }, [messages]);`;

const MESSAGE_LIST_MESSAGES_REPL = `  var messages = useContextSelector(ChatAnywhereMessagesContext, function (v) {
    return v.messages;
  });
  var setMessages = useContextSelector(ChatAnywhereMessagesContext, function (v) {
    return v.setMessages;
  });
  var sessionApi = useChatAnywhereOptions(function (v) {
    var _v$session;
    return (_v$session = v.session) === null || _v$session === void 0 ? void 0 : _v$session.api;
  });
  var safeMessages = React.useMemo(function () {
    return _toConsumableArray(messages || []).reverse();
  }, [messages]);`;

const MESSAGE_LIST_REF_NEEDLE = `  var listRef = React.useRef(null);
  var prevMessagesLengthRef = React.useRef(safeMessages.length);`;

const MESSAGE_LIST_REF_REPL = `  var listRef = React.useRef(null);
  var prevMessagesLengthRef = React.useRef(safeMessages.length);
  var justLoadedHistoryRef = React.useRef(false);`;

const MESSAGE_LIST_SCROLL_NEEDLE = `  React.useEffect(function () {
    if (safeMessages.length > prevMessagesLengthRef.current) {
      var _listRef$current;
      (_listRef$current = listRef.current) === null || _listRef$current === void 0 || _listRef$current.scrollToBottom();
    }
    prevMessagesLengthRef.current = safeMessages.length;
  }, [safeMessages.length]);`;

const MESSAGE_LIST_SCROLL_REPL = `  React.useEffect(function () {
    if (safeMessages.length > prevMessagesLengthRef.current) {
      if (justLoadedHistoryRef.current) {
        justLoadedHistoryRef.current = false;
      } else {
        var _listRef$current;
        (_listRef$current = listRef.current) === null || _listRef$current === void 0 || _listRef$current.scrollToBottom();
      }
    }
    prevMessagesLengthRef.current = safeMessages.length;
  }, [safeMessages.length]);`;

const MESSAGE_LIST_SET_HISTORY_NEEDLE = `      if (older.length > 0) {
        setMessages(function (prev) {
          return [].concat(older, _toConsumableArray(prev));
        });
      }`;

const MESSAGE_LIST_SET_HISTORY_REPL = `      if (older.length > 0) {
        justLoadedHistoryRef.current = true;
        setMessages(function (prev) {
          return [].concat(older, _toConsumableArray(prev));
        });
      }`;

const MESSAGE_LIST_LOADMORE_NEEDLE = `  var _useSimulatedMessageP = useSimulatedMessagePagination(safeMessages, currentSessionId),
    visibleMessages = _useSimulatedMessageP.visibleMessages,
    noMore = _useSimulatedMessageP.noMore,
    loadMore = _useSimulatedMessageP.loadMore;
  React.useEffect(function () {`;

const MESSAGE_LIST_LOADMORE_REPL = `  var _useSimulatedMessageP = useSimulatedMessagePagination(safeMessages, currentSessionId),
    visibleMessages = _useSimulatedMessageP.visibleMessages,
    noMore = _useSimulatedMessageP.noMore,
    loadMore = _useSimulatedMessageP.loadMore;
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    backendNoMore = _useState4[0],
    setBackendNoMore = _useState4[1];
  useEffect(function () {
    setBackendNoMore(false);
  }, [currentSessionId]);
  var handleLoadMore = useCallback(function () {
    console.debug('[xclaw][MessageList] handleLoadMore', { noMore: noMore, backendNoMore: backendNoMore, hasGetSessionMore: !!(sessionApi && sessionApi.getSessionMore), currentSessionId: currentSessionId });
    if (!noMore) {
      return loadMore();
    }
    if (backendNoMore) {
      console.debug('[xclaw][MessageList] backendNoMore=true, skip');
      return Promise.resolve();
    }
    if (!(sessionApi !== null && sessionApi !== void 0 && sessionApi.getSessionMore) || !currentSessionId) {
      console.debug('[xclaw][MessageList] no getSessionMore or no sessionId, skip');
      return Promise.resolve();
    }
    console.debug('[xclaw][MessageList] calling getSessionMore', currentSessionId);
    return Promise.resolve(sessionApi.getSessionMore(currentSessionId)).then(function (result) {
      var older = (result !== null && result !== void 0 && result.messages ? result.messages : []).map(function (item) {
        return Object.assign({}, item, {
          history: true
        });
      });
      if (older.length > 0) {
        setMessages(function (prev) {
          return [].concat(older, _toConsumableArray(prev));
        });
      }
      if ((result === null || result === void 0 ? void 0 : result.noMore) || older.length === 0) {
        setBackendNoMore(true);
      }
    }).catch(function () {
      setBackendNoMore(true);
    });
  }, [noMore, loadMore, backendNoMore, sessionApi, currentSessionId, setMessages]);
  React.useEffect(function () {`;

const MESSAGE_LIST_BUBBLE_NEEDLE = `    onLoadMore: noMore ? undefined : loadMore,
    noMore: noMore,`;

const MESSAGE_LIST_BUBBLE_REPL = `    onLoadMore: backendNoMore && noMore ? undefined : handleLoadMore,
    noMore: backendNoMore ? noMore : false,`;

patchFile(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Chat/MessageList/index.js",
  "sessionApi.getSessionMore",
  (s) => {
    let t = s;
    if (t.includes(MESSAGE_LIST_IMPORT_NEEDLE)) t = t.replace(MESSAGE_LIST_IMPORT_NEEDLE, MESSAGE_LIST_IMPORT_REPL);
    if (t.includes(MESSAGE_LIST_MESSAGES_NEEDLE)) t = t.replace(MESSAGE_LIST_MESSAGES_NEEDLE, MESSAGE_LIST_MESSAGES_REPL);
    if (t.includes(MESSAGE_LIST_REF_NEEDLE)) t = t.replace(MESSAGE_LIST_REF_NEEDLE, MESSAGE_LIST_REF_REPL);
    if (t.includes(MESSAGE_LIST_LOADMORE_NEEDLE)) t = t.replace(MESSAGE_LIST_LOADMORE_NEEDLE, MESSAGE_LIST_LOADMORE_REPL);
    if (t.includes(MESSAGE_LIST_SET_HISTORY_NEEDLE)) t = t.replace(MESSAGE_LIST_SET_HISTORY_NEEDLE, MESSAGE_LIST_SET_HISTORY_REPL);
    if (t.includes(MESSAGE_LIST_SCROLL_NEEDLE)) t = t.replace(MESSAGE_LIST_SCROLL_NEEDLE, MESSAGE_LIST_SCROLL_REPL);
    if (t.includes(MESSAGE_LIST_BUBBLE_NEEDLE)) t = t.replace(MESSAGE_LIST_BUBBLE_NEEDLE, MESSAGE_LIST_BUBBLE_REPL);
    return t;
  },
);
