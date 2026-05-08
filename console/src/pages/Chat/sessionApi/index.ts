import {
  IAgentScopeRuntimeWebUISession,
  IAgentScopeRuntimeWebUISessionAPI,
  IAgentScopeRuntimeWebUIMessage,
} from "@agentscope-ai/chat";
import api, {
  type ChatSpec,
  type ChatHistory,
  type ChatStatus,
  type Message,
} from "../../../api";
import i18n from "../../../i18n";
import { toDisplayUrl } from "../utils";
import {
  fixedBucketToI18nKey,
  getSessionBucket,
} from "../sessionCalendarGroup";
import { requestSessionsListRefresh } from "../chatNewSessionBridge";

// ---------------------------------------------------------------------------
// Session date grouping
// ---------------------------------------------------------------------------

function getSessionGroup(tsMs: number): string {
  const b = getSessionBucket(tsMs);
  if (b.kind === "month") return b.ym;
  return i18n.t(fixedBucketToI18nKey(b.id));
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_USER_ID = "default";
const DEFAULT_CHANNEL = "console";
const DEFAULT_SESSION_NAME = "New Chat";
//打开会话时首屏请求的最近 last_n 条消息
const PREVIEW_LAST_N = 100;
//上滚「加载更多」时每页请求的条数
const HISTORY_PAGE_SIZE = 100;
const ROLE_TOOL = "tool";
const ROLE_USER = "user";
const ROLE_ASSISTANT = "assistant";
const TYPE_PLUGIN_CALL_OUTPUT = "plugin_call_output";
// const CARD_REQUEST = "AgentScopeRuntimeRequestCard";
const CARD_RESPONSE = "AgentScopeRuntimeResponseCard";

// ---------------------------------------------------------------------------
// Window globals
// ---------------------------------------------------------------------------

interface CustomWindow extends Window {
  currentSessionId?: string;
  currentUserId?: string;
  currentChannel?: string;
}

declare const window: CustomWindow;

// ---------------------------------------------------------------------------
// Local helper types
// ---------------------------------------------------------------------------

/** A single item inside a message's content array. */
interface ContentItem {
  type: string;
  text?: string;
  [key: string]: unknown;
}

/** A backend message after role-normalisation (output of toOutputMessage). */
interface OutputMessage extends Omit<Message, "role"> {
  role: string;
  metadata: unknown;
  sequence_number?: number;
}

/**
 * Extended session carrying extra fields that the library type does not define
 * but our backend / window globals require.
 */
interface ExtendedSession extends IAgentScopeRuntimeWebUISession {
  /** Session identifier (channel:user_id format) */
  sessionId: string;
  /** User identifier */
  userId: string;
  /** Channel name */
  channel: string;
  /** Additional metadata */
  meta: Record<string, unknown>;
  /** Real backend UUID, used when id is overridden with a local timestamp. */
  realId?: string;
  /** Conversation status from backend. */
  status?: ChatStatus;
  /** ISO 8601 creation timestamp from backend. */
  createdAt?: string | null;
  /** ISO 8601 updated timestamp from backend. */
  updatedAt?: string | null;
  /** Whether the backend is still generating a response for this session. */
  generating?: boolean;
  /** Pinned sessions are listed at the top of the sidebar. */
  pinned?: boolean;
}

// ---------------------------------------------------------------------------
// Message conversion helpers: backend flat messages → card-based UI format
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Extract plain text from a message's content array. */
const extractTextFromContent = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content || "");
  return (content as ContentItem[])
    .filter((c) => c.type === "text")
    .map((c) => c.text || "")
    .filter(Boolean)
    .join("\n");
};

function resolveContentItemUrl(c: ContentItem): ContentItem {
  if (c.type === "image" && c.image_url) {
    return { ...c, image_url: toDisplayUrl(c.image_url as string) };
  }
  if (c.type === "audio" && c.data) {
    return { ...c, data: toDisplayUrl(c.data as string) };
  }
  if (c.type === "video" && c.video_url) {
    return { ...c, video_url: toDisplayUrl(c.video_url as string) };
  }
  if (c.type === "file" && (c.file_url || c.file_id)) {
    return {
      ...c,
      file_url: toDisplayUrl((c.file_url as string) || (c.file_id as string)),
      file_name: (c.filename as string) || (c.file_name as string) || "file",
    };
  }
  return c;
}

/** Map backend message content to request card content (text + image + file). */
function contentToRequestParts(
  content: unknown,
): Array<Record<string, unknown>> {
  if (typeof content === "string") {
    return [{ type: "text", text: content, status: "created" }];
  }
  if (!Array.isArray(content)) {
    return [{ type: "text", text: String(content || ""), status: "created" }];
  }
  const parts = (content as ContentItem[])
    .map(resolveContentItemUrl)
    .map((c) => ({ ...c, status: "created" }));

  if (parts.length === 0) {
    return [{ type: "text", text: "", status: "created" }];
  }

  return parts;
}
function normalizeOutputMessageContent(content: unknown): unknown {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return content;
  return (content as ContentItem[]).map(resolveContentItemUrl);
}

/**
 * Convert a backend message to a response output message.
 * Maps system + plugin_call_output → role "tool" and strips metadata.
 */
const toOutputMessage = (msg: Message): OutputMessage => ({
  ...msg,
  role:
    msg.type === TYPE_PLUGIN_CALL_OUTPUT && msg.role === "system"
      ? ROLE_TOOL
      : msg.role,
  metadata: msg.metadata ?? null,
});

/** Build a user card (AgentScopeRuntimeRequestCard) from a user message. */
function buildUserCard(msg: Message): IAgentScopeRuntimeWebUIMessage {
  const contentParts = contentToRequestParts(msg.content);
  return {
    id: (msg.id as string) || generateId(),
    role: "user",
    cards: [
      {
        code: "AgentScopeRuntimeRequestCard",
        data: {
          input: [
            {
              role: "user",
              type: "message",
              content: contentParts,
            },
          ],
        },
      },
    ],
  };
}

/**
 * Build an assistant response card (AgentScopeRuntimeResponseCard)
 * wrapping a group of consecutive non-user output messages.
 */
const buildResponseCard = (
  outputMessages: OutputMessage[],
): IAgentScopeRuntimeWebUIMessage => {
  const now = Math.floor(Date.now() / 1000);
  const maxSeq = outputMessages.reduce(
    (max, m) => Math.max(max, m.sequence_number || 0),
    0,
  );

  const normalizedMessages = outputMessages.map((msg) => ({
    ...msg,
    content: normalizeOutputMessageContent(msg.content),
  }));

  return {
    id: generateId(),
    role: ROLE_ASSISTANT,
    cards: [
      {
        code: CARD_RESPONSE,
        data: {
          id: `response_${generateId()}`,
          output: normalizedMessages,
          object: "response",
          status: "completed",
          created_at: now,
          sequence_number: maxSeq + 1,
          error: null,
          completed_at: now,
          usage: null,
        },
      },
    ],
    msgStatus: "finished",
  };
};

/**
 * Convert flat backend messages into the card-based format expected by
 * the @agentscope-ai/chat component.
 *
 * - User messages → AgentScopeRuntimeRequestCard
 * - Consecutive non-user messages (assistant / system / tool) → grouped
 *   into a single AgentScopeRuntimeResponseCard with all output messages.
 */
const convertMessages = (
  messages: Message[],
): IAgentScopeRuntimeWebUIMessage[] => {
  const result: IAgentScopeRuntimeWebUIMessage[] = [];
  let i = 0;

  while (i < messages.length) {
    if (messages[i].role === ROLE_USER) {
      result.push(buildUserCard(messages[i++]));
    } else {
      const outputMsgs: OutputMessage[] = [];
      while (i < messages.length && messages[i].role !== ROLE_USER) {
        outputMsgs.push(toOutputMessage(messages[i++]));
      }
      if (outputMsgs.length) result.push(buildResponseCard(outputMsgs));
    }
  }

  return result;
};

const chatSpecToSession = (chat: ChatSpec): ExtendedSession => {
  const updateAt = chat.updated_at
    ? new Date(chat.updated_at).getTime()
    : Date.now();
  const groupTs = updateAt;
  return {
    id: chat.id,
    name: (chat as ChatSpec & { name?: string }).name || DEFAULT_SESSION_NAME,
    updateAt,
    group: getSessionGroup(groupTs),
    sessionId: chat.session_id,
    userId: chat.user_id,
    channel: chat.channel,
    createdAt: chat.created_at ?? null,
    updatedAt: chat.updated_at ?? null,
    messages: [],
    meta: chat.meta || {},
    status: chat.status ?? "idle",
    pinned: chat.pinned ?? false,
  } as ExtendedSession;
};

/** Returns true when id is a pure numeric local timestamp (not a backend UUID). */
const isLocalTimestamp = (id: string): boolean => /^\d+$/.test(id);

/** Detect if backend is still generating content for this chat. */
const isGenerating = (chatHistory: ChatHistory): boolean => {
  if (chatHistory.status === "running") return true;
  if (chatHistory.status === "idle") return false;
  const msgs = chatHistory.messages || [];
  if (msgs.length === 0) return false;
  const last = msgs[msgs.length - 1];
  return last.role === ROLE_USER;
};

/**
 * Resolve and persist the real backend UUID for a local timestamp session.
 * Stores the real UUID as realId while keeping the timestamp as id, so the
 * library's internal currentSessionId (timestamp) remains valid.
 * Returns the resolved real UUID, or null if not found.
 */
const resolveRealId = (
  sessionList: IAgentScopeRuntimeWebUISession[],
  tempSessionId: string,
): { list: IAgentScopeRuntimeWebUISession[]; realId: string | null } => {
  const realSession = sessionList.find(
    (s) => (s as ExtendedSession).sessionId === tempSessionId,
  );
  if (!realSession) return { list: sessionList, realId: null };

  const realUUID = realSession.id;
  (realSession as ExtendedSession).realId = realUUID;
  realSession.id = tempSessionId;
  return {
    list: [realSession, ...sessionList.filter((s) => s !== realSession)],
    realId: realUUID,
  };
};

// ---------------------------------------------------------------------------
// Per-session user message persistence (survives page refresh)
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = "xclaw_pending_user_msg_";

function savePendingUserMessage(sessionId: string, text: string): void {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${sessionId}`, text);
  } catch {
    /* quota exceeded – ignore */
  }
}

function loadPendingUserMessage(sessionId: string): string {
  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}${sessionId}`) || "";
  } catch {
    return "";
  }
}

function clearPendingUserMessage(sessionId: string): void {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// SessionApi
// ---------------------------------------------------------------------------

class SessionApi implements IAgentScopeRuntimeWebUISessionAPI {
  sessionList: IAgentScopeRuntimeWebUISession[] = [];

  /**
   * Pending resolvers waiting for a specific session's realId.
   * Used to replace setTimeout-based busy-wait with event-driven notification.
   */
  private realIdResolvers: Map<string, Array<() => void>> = new Map();

  /** Notify any pending waiters that a session's realId has been resolved. */
  private notifyRealIdResolved(sessionId: string): void {
    const resolvers = this.realIdResolvers.get(sessionId);
    if (resolvers) {
      this.realIdResolvers.delete(sessionId);
      for (const resolve of resolvers) resolve();
    }
  }

  /** Wait until a session's realId is available (set by updateSession). */
  private waitForRealId(sessionId: string): Promise<void> {
    const session = this.sessionList.find((x) => x.id === sessionId) as
      | ExtendedSession
      | undefined;
    if (session?.realId) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const existing = this.realIdResolvers.get(sessionId) || [];
      existing.push(resolve);
      this.realIdResolvers.set(sessionId, existing);
    });
  }

  /**
   * When set, getSessionList will move the matching session to the front on the first call,
   * so the library's useMount auto-selects it instead of always defaulting to sessions[0].
   * Cleared after first use.
   */
  preferredChatId: string | null = null;

  /**
   * Cache the latest user message for a chat so it can be patched into
   * history during reconnect (the backend only persists it after generation
   * completes). Persisted to sessionStorage so it survives page refresh.
   */
  setLastUserMessage(sessionId: string, text: string): void {
    if (!sessionId || !text) return;
    savePendingUserMessage(sessionId, text);
  }

  /**
   * Deduplicates concurrent getSessionList calls so that two parallel
   * invocations share one network request and write sessionList only once,
   * preserving any realId mappings that were already resolved.
   */
  private sessionListRequest: Promise<IAgentScopeRuntimeWebUISession[]> | null =
    null;

  /**
   * Deduplicates concurrent getSession calls for the same sessionId.
   * Key: sessionId, Value: in-flight promise for getSession.
   */
  private sessionRequests: Map<
    string,
    Promise<IAgentScopeRuntimeWebUISession>
  > = new Map();

  /** Track how many newest messages are already loaded (keyed by backend chat UUID). */
  private loadedTailCount: Map<string, number> = new Map();

  /**
   * One in-flight getSessionMore per backend chat id so parallel onLoadMore /
   * duplicate triggers cannot reuse the same skip_last_n.
   */
  private sessionMoreInFlight: Map<
    string,
    Promise<{ messages: IAgentScopeRuntimeWebUIMessage[]; noMore: boolean }>
  > = new Map();

  /** Persist tail counts under both runtime id and backend UUID when they differ. */
  private setLoadedTailCount(
    backendChatId: string,
    runtimeSessionId: string,
    count: number,
  ): void {
    this.loadedTailCount.set(backendChatId, count);
    if (runtimeSessionId !== backendChatId) {
      this.loadedTailCount.set(runtimeSessionId, count);
    }
  }

  /** Resolve backend UUID for API calls (null if not yet available). */
  private async resolveBackendChatId(sessionId: string): Promise<string | null> {
    if (!sessionId || sessionId === "undefined" || sessionId === "null") {
      return null;
    }
    if (!isLocalTimestamp(sessionId)) {
      return sessionId;
    }
    const fromList = this.sessionList.find((s) => s.id === sessionId) as
      | ExtendedSession
      | undefined;
    if (fromList?.realId) {
      return fromList.realId;
    }
    await this.getSessionList();
    const refreshed = this.sessionList.find((s) => s.id === sessionId) as
      | ExtendedSession
      | undefined;
    return refreshed?.realId ?? null;
  }

  /**
   * Called when a temporary timestamp session id is resolved to a real backend
   * UUID. Consumers (e.g. Chat/index.tsx) can register here to update the URL.
   */
  onSessionIdResolved: ((tempId: string, realId: string) => void) | null = null;

  /**
   * Called after a session is removed. Consumers can register here to clear
   * the session id from the URL.
   */
  onSessionRemoved: ((removedId: string) => void) | null = null;

  /**
   * Called when a session is selected from the session list.
   * Consumers can register here to update the URL when switching sessions.
   */
  onSessionSelected:
    | ((sessionId: string | null | undefined, realId: string | null) => void)
    | null = null;

  /**
   * Called when a new session is created.
   * Consumers can register here to update the URL with the new session id.
   */
  onSessionCreated: ((sessionId: string) => void) | null = null;

  /**
   * When reconnecting to a running conversation, the backend history may not
   * include the latest user message (it's only persisted after generation
   * completes). If generating, look up the cached text from sessionStorage
   * and patch it into the message list.
   *
   * When not generating the conversation is done — clear the cached entry.
   */
  private patchLastUserMessage(
    messages: IAgentScopeRuntimeWebUIMessage[],
    generating: boolean,
    backendSessionId: string,
  ): void {
    if (!generating) {
      clearPendingUserMessage(backendSessionId);
      return;
    }

    const cachedText = loadPendingUserMessage(backendSessionId);
    if (!cachedText) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === ROLE_USER) {
      const text = extractTextFromContent(
        lastMsg?.cards?.[0]?.data?.input?.[0]?.content,
      );
      if (!text) {
        lastMsg.cards = buildUserCard({
          content: [{ type: "text", text: cachedText }],
          role: ROLE_USER,
        } as Message).cards;
      }
    } else {
      messages.push(
        buildUserCard({
          content: [{ type: "text", text: cachedText }],
          role: ROLE_USER,
        } as Message),
      );
    }
  }

  private createEmptySession(sessionId: string): ExtendedSession {
    window.currentSessionId = sessionId;
    window.currentUserId = DEFAULT_USER_ID;
    window.currentChannel = DEFAULT_CHANNEL;
    return {
      id: sessionId,
      name: DEFAULT_SESSION_NAME,
      sessionId,
      userId: DEFAULT_USER_ID,
      channel: DEFAULT_CHANNEL,
      messages: [],
      meta: {},
    } as ExtendedSession;
  }

  private updateWindowVariables(session: ExtendedSession): void {
    window.currentSessionId = session.sessionId || "";
    window.currentUserId = session.userId || DEFAULT_USER_ID;
    window.currentChannel = session.channel || DEFAULT_CHANNEL;
  }

  private getLocalSession(sessionId: string): IAgentScopeRuntimeWebUISession {
    const local = this.sessionList.find((s) => s.id === sessionId);
    if (local) {
      this.updateWindowVariables(local as ExtendedSession);
      return local;
    }
    return this.createEmptySession(sessionId);
  }

  /**
   * Returns the real backend UUID for a session identified by id (which may be
   * a local timestamp). Returns null when not yet resolved or not found.
   */
  getRealIdForSession(sessionId: string): string | null {
    const s = this.sessionList.find((x) => x.id === sessionId) as
      | ExtendedSession
      | undefined;
    return s?.realId ?? null;
  }

  async getSessionList() {
    if (this.sessionListRequest) return this.sessionListRequest;

    this.sessionListRequest = (async () => {
      try {
        const chats = await api.listChats();
        const newList = chats
          .filter((c) => c.id && c.id !== "undefined" && c.id !== "null")
          .map(chatSpecToSession)
          .reverse();

        this.sessionList = newList.map((s) => {
          const existing = this.sessionList.find(
            (e) =>
              (e as ExtendedSession).sessionId ===
              (s as ExtendedSession).sessionId,
          ) as ExtendedSession | undefined;
          return existing?.realId
            ? { ...s, id: existing.id, realId: existing.realId }
            : s;
        });

        this.notifySubscribers();
        return [...this.sessionList];
      } finally {
        this.sessionListRequest = null;
      }
    })();

    return this.sessionListRequest;
  }

  /** Track the last session ID that triggered onSessionSelected to avoid duplicate calls. */
  private lastSelectedSessionId: string | null = null;

  async getSessionMore(
    sessionId: string,
  ): Promise<{ messages: IAgentScopeRuntimeWebUIMessage[]; noMore: boolean }> {
    const backendId = await this.resolveBackendChatId(sessionId);
    if (!backendId) {
      return { messages: [], noMore: true };
    }

    const existing = this.sessionMoreInFlight.get(backendId);
    if (existing) return existing;

    const p = this.loadSessionMoreOnce(sessionId, backendId).finally(() => {
      this.sessionMoreInFlight.delete(backendId);
    });
    this.sessionMoreInFlight.set(backendId, p);
    return p;
  }

  private async loadSessionMoreOnce(
    sessionId: string,
    backendId: string,
  ): Promise<{ messages: IAgentScopeRuntimeWebUIMessage[]; noMore: boolean }> {
    const loaded =
      this.loadedTailCount.get(backendId) ??
      this.loadedTailCount.get(sessionId) ??
      PREVIEW_LAST_N;
    console.debug('[xclaw][getSessionMore] fetching', { sessionId, backendId, skip_last_n: loaded, last_n: HISTORY_PAGE_SIZE });
    const chatHistory = await api.getChat(
      backendId,
      HISTORY_PAGE_SIZE,
      loaded,
    );
    const olderMessages = convertMessages(chatHistory.messages || []);
    const fetchedCount = chatHistory.messages?.length || 0;
    this.setLoadedTailCount(backendId, sessionId, loaded + fetchedCount);
    return {
      messages: olderMessages,
      noMore: fetchedCount < HISTORY_PAGE_SIZE,
    };
  }

  async getSessionFull(sessionId: string) {
    console.debug("[xclaw][sessionApi] getSessionFull:start", { sessionId });
    // Resolve backend id for local timestamp sessions
    let backendId = sessionId;
    const fromList = this.sessionList.find((s) => s.id === sessionId) as
      | ExtendedSession
      | undefined;

    if (isLocalTimestamp(sessionId)) {
      if (fromList?.realId) {
        backendId = fromList.realId;
      } else {
        await this.getSessionList();
        const refreshed = this.sessionList.find((s) => s.id === sessionId) as
          | ExtendedSession
          | undefined;
        if (refreshed?.realId) {
          backendId = refreshed.realId;
        } else {
          return this.getLocalSession(sessionId);
        }
      }
    }

    const chatHistory = await api.getChat(backendId);
    console.debug("[xclaw][sessionApi] getSessionFull:fetched", {
      sessionId,
      backendId,
      messageCount: chatHistory.messages?.length ?? 0,
    });
    const generating = isGenerating(chatHistory);
    const messages = convertMessages(chatHistory.messages || []);
    this.patchLastUserMessage(messages, generating, backendId);

    const session: ExtendedSession = {
      id: sessionId,
      name: fromList?.name || DEFAULT_SESSION_NAME,
      sessionId: fromList?.sessionId || sessionId,
      userId: fromList?.userId || DEFAULT_USER_ID,
      channel: fromList?.channel || DEFAULT_CHANNEL,
      messages,
      meta: fromList?.meta || {},
      realId:
        fromList?.realId || (backendId !== sessionId ? backendId : undefined),
      generating,
    };

    this.updateWindowVariables(session);
    return session;
  }

  async getSession(sessionId: string) {
    const existingRequest = this.sessionRequests.get(sessionId);
    if (existingRequest) return existingRequest;

    const requestPromise = this._doGetSession(sessionId);
    this.sessionRequests.set(sessionId, requestPromise);

    try {
      const session = await requestPromise;
      // Trigger onSessionSelected only when session actually changes
      if (sessionId !== this.lastSelectedSessionId) {
        this.lastSelectedSessionId = sessionId;
        const extendedSession = session as ExtendedSession;
        const realId = extendedSession.realId || null;
        this.onSessionSelected?.(sessionId, realId);
      }
      return session;
    } finally {
      this.sessionRequests.delete(sessionId);
    }
  }

  private async _doGetSession(
    sessionId: string,
  ): Promise<IAgentScopeRuntimeWebUISession> {
    // --- Local timestamp ID (New Chat before first reply) ---
    if (isLocalTimestamp(sessionId)) {
      const fromList = this.sessionList.find((s) => s.id === sessionId) as
        | ExtendedSession
        | undefined;

      // If realId is already resolved, use it directly to fetch history.
      if (fromList?.realId) {
        const chatHistory = await api.getChat(fromList.realId, PREVIEW_LAST_N);
        const generating = isGenerating(chatHistory);
        const messages = convertMessages(chatHistory.messages || []);
        const n = chatHistory.messages?.length || 0;
        this.setLoadedTailCount(fromList.realId, sessionId, n);
        this.patchLastUserMessage(messages, generating, fromList.realId);
        const session: ExtendedSession = {
          id: sessionId,
          name: fromList.name || DEFAULT_SESSION_NAME,
          sessionId: fromList.sessionId || sessionId,
          userId: fromList.userId || DEFAULT_USER_ID,
          channel: fromList.channel || DEFAULT_CHANNEL,
          messages,
          meta: fromList.meta || {},
          realId: fromList.realId,
          generating,
        };
        this.updateWindowVariables(session);
        return session;
      }

      // Pure local session (not yet sent to backend): wait until updateSession
      // resolves the realId, then fetch history with the real UUID.
      await this.waitForRealId(sessionId);

      const refreshed = this.sessionList.find((s) => s.id === sessionId) as
        | ExtendedSession
        | undefined;
      if (refreshed?.realId) {
        const chatHistory = await api.getChat(refreshed.realId, PREVIEW_LAST_N);
        const generating = isGenerating(chatHistory);
        const messages = convertMessages(chatHistory.messages || []);
        const n = chatHistory.messages?.length || 0;
        this.setLoadedTailCount(refreshed.realId, sessionId, n);
        this.patchLastUserMessage(messages, generating, refreshed.realId);
        const session: ExtendedSession = {
          id: sessionId,
          name: refreshed.name || DEFAULT_SESSION_NAME,
          sessionId: refreshed.sessionId || sessionId,
          userId: refreshed.userId || DEFAULT_USER_ID,
          channel: refreshed.channel || DEFAULT_CHANNEL,
          messages,
          meta: refreshed.meta || {},
          realId: refreshed.realId,
          generating,
        };
        this.updateWindowVariables(session);
        return session;
      }

      return this.getLocalSession(sessionId);
    }

    // --- No session selected (e.g. after delete) ---
    if (!sessionId || sessionId === "undefined" || sessionId === "null") {
      return this.createEmptySession(Date.now().toString());
    }

    // --- Regular backend UUID ---
    const fromList = this.sessionList.find((s) => s.id === sessionId) as
      | ExtendedSession
      | undefined;
    const chatHistory = await api.getChat(sessionId, PREVIEW_LAST_N);
    const generating = isGenerating(chatHistory);
    const messages = convertMessages(chatHistory.messages || []);
    const n = chatHistory.messages?.length || 0;
    this.setLoadedTailCount(sessionId, sessionId, n);
    this.patchLastUserMessage(messages, generating, sessionId);
    const session: ExtendedSession = {
      id: sessionId,
      name: fromList?.name || sessionId,
      sessionId: fromList?.sessionId || sessionId,
      userId: fromList?.userId || DEFAULT_USER_ID,
      channel: fromList?.channel || DEFAULT_CHANNEL,
      messages,
      meta: fromList?.meta || {},
      generating,
    };

    this.updateWindowVariables(session);
    return session;
  }

  async updateSession(session: Partial<IAgentScopeRuntimeWebUISession>) {
    session.messages = [];
    const index = this.sessionList.findIndex((s) => s.id === session.id);
    let listRefetched = false;

    if (index > -1) {
      this.sessionList[index] = { ...this.sessionList[index], ...session };

      const existing = this.sessionList[index] as ExtendedSession;
      if (isLocalTimestamp(existing.id) && !existing.realId) {
        const tempId = existing.id;
        await this.getSessionList();
        listRefetched = true;
        const resolved = resolveRealId(this.sessionList, tempId);
        this.sessionList = resolved.list;
        if (resolved.realId) {
          this.notifyRealIdResolved(tempId);
          this.onSessionIdResolved?.(tempId, resolved.realId);
        }
      }
    } else {
      const tempId = session.id!;
      await this.getSessionList();
      listRefetched = true;
      const resolved = resolveRealId(this.sessionList, tempId);
      this.sessionList = resolved.list;
      if (resolved.realId) {
        this.notifyRealIdResolved(tempId);
        this.onSessionIdResolved?.(tempId, resolved.realId);
      }
    }

    this.notifySubscribers();
    if (listRefetched) {
      requestSessionsListRefresh();
    }
    return [...this.sessionList];
  }

  async createSession(session: Partial<IAgentScopeRuntimeWebUISession>) {
    session.id = Date.now().toString();

    const extended: ExtendedSession = {
      ...session,
      sessionId: session.id,
      userId: DEFAULT_USER_ID,
      channel: DEFAULT_CHANNEL,
    } as ExtendedSession;

    this.updateWindowVariables(extended);
    // this.sessionList.unshift(extended);
    this.onSessionCreated?.(session.id);
    return this.sessionList;
  }

  async removeSession(session: Partial<IAgentScopeRuntimeWebUISession>) {
    if (!session.id) return [...this.sessionList];

    const { id: sessionId } = session;

    const existing = this.sessionList.find((s) => s.id === sessionId) as
      | ExtendedSession
      | undefined;

    const deleteId =
      existing?.realId ?? (isLocalTimestamp(sessionId) ? null : sessionId);

    if (deleteId) await api.deleteChat(deleteId);

    this.sessionList = this.sessionList.filter((s) => s.id !== sessionId);

    const resolvedId = existing?.realId ?? sessionId;
    this.onSessionRemoved?.(resolvedId);

    this.notifySubscribers();
    return [...this.sessionList];
  }

  // ---------------------------------------------------------------------------
  // Subscriber mechanism for external React components
  // ---------------------------------------------------------------------------

  private subscribers: Set<() => void> = new Set();

  subscribe(fn: () => void): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((fn) => fn());
  }
}

export default new SessionApi();
