export interface AgentRequest {
  input: unknown;
  session_id?: string | null;
  user_id?: string | null;
  channel?: string | null;
  [key: string]: unknown;
}

export interface ContextCompactConfig {
  enabled: boolean;
  compact_threshold_ratio: number;
  reserve_threshold_ratio: number;
  compact_with_thinking_block: boolean;
}

export interface ToolResultPruningConfig {
  enabled: boolean;
  pruning_recent_n: number;
  pruning_old_msg_max_bytes: number;
  pruning_recent_msg_max_bytes: number;
  offload_retention_days: number;
  exempt_file_extensions: string[];
  exempt_tool_names: string[];
}

export interface LightContextConfig {
  dialog_path: string;
  token_count_estimate_divisor: number;
  context_compact_config: ContextCompactConfig;
  tool_result_pruning_config: ToolResultPruningConfig;
}

export interface AutoMemorySearchConfig {
  enabled: boolean;
  max_results: number;
  min_score: number;
}

export interface EmbeddingModelConfig {
  backend: string;
  api_key: string;
  base_url: string;
  model_name: string;
  dimensions: number;
  enable_cache: boolean;
  use_dimensions: boolean;
  max_cache_size: number;
  max_input_length: number;
  max_batch_size: number;
}

export interface AutoTitleConfig {
  enabled: boolean;
  timeout_seconds: number;
}

export interface ADBPGMemoryConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  dbname: string;
  llm_model: string;
  llm_api_key: string;
  llm_base_url: string;
  embedding_model: string;
  embedding_api_key: string;
  embedding_base_url: string;
  embedding_dims: number;
  api_mode: string;
  rest_api_key: string;
  rest_base_url: string;
  memory_isolation: boolean;
  search_timeout: number;
  pool_minconn: number;
  pool_maxconn: number;
}

export interface AgentsRunningConfig {
  max_iters: number;
  auto_continue_on_text_only: boolean;
  shell_command_timeout: number;
  shell_command_executable: string;
  llm_retry_enabled: boolean;
  llm_max_retries: number;
  llm_backoff_base: number;
  llm_backoff_cap: number;
  llm_max_concurrent: number;
  llm_max_qpm: number;
  llm_rate_limit_pause: number;
  llm_rate_limit_jitter: number;
  llm_acquire_timeout: number;
  max_input_length: number;
  history_max_length: number;
  context_compact: ContextCompactConfig;
  tool_result_compact: ToolResultCompactConfig;
  memory_summary: MemorySummaryConfig;
  embedding_config: EmbeddingConfig;
  adbpg_memory_config?: ADBPGMemoryConfig | null;
  memory_manager_backend: "remelight" | "adbpg";
  approval_level?: string;
  auto_title_config: AutoTitleConfig;
}
