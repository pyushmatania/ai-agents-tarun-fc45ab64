// AI model configuration for the app
export const BUILT_IN_MODELS = [
  { id: "google/gemini-2.5-flash", label: "Gemini Flash", provider: "lovable", emoji: "⚡", desc: "Fast & balanced" },
  { id: "google/gemini-2.5-pro", label: "Gemini Pro", provider: "lovable", emoji: "🧠", desc: "Best reasoning" },
  { id: "google/gemini-2.5-flash-lite", label: "Gemini Lite", provider: "lovable", emoji: "🪶", desc: "Fastest" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini", provider: "lovable", emoji: "🤖", desc: "Strong & fast" },
  { id: "openai/gpt-5", label: "GPT-5", provider: "lovable", emoji: "🏆", desc: "Most powerful" },
  { id: "anthropic/claude-sonnet", label: "Claude Sonnet", provider: "byok", emoji: "🟠", desc: "Smart & safe" },
  { id: "anthropic/claude-haiku", label: "Claude Haiku", provider: "byok", emoji: "🍃", desc: "Fast & light" },
] as const;

export const BYOK_PROVIDERS = [
  { id: "openai", label: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini"], emoji: "🟢" },
  { id: "google", label: "Google AI", models: ["gemini-2.5-pro", "gemini-2.5-flash"], emoji: "🔵" },
  { id: "anthropic", label: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"], emoji: "🟠" },
] as const;

export type AIConfig = {
  mode: "builtin" | "byok";
  builtinModel: string;
  byokProvider: string;
  byokModel: string;
  byokApiKey: string;
};

const DEFAULT_CONFIG: AIConfig = {
  mode: "builtin",
  builtinModel: "google/gemini-2.5-flash",
  byokProvider: "",
  byokModel: "",
  byokApiKey: "",
};

export const getAIConfig = (): AIConfig => {
  try {
    const stored = localStorage.getItem("adojo_ai_config");
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_CONFIG;
};

export const saveAIConfig = (config: AIConfig) => {
  localStorage.setItem("adojo_ai_config", JSON.stringify(config));
};

export const getActiveModelLabel = (): string => {
  const config = getAIConfig();
  if (config.mode === "byok") {
    const provider = BYOK_PROVIDERS.find(p => p.id === config.byokProvider);
    return `${provider?.emoji || "🔑"} ${config.byokModel || "Custom"}`;
  }
  const model = BUILT_IN_MODELS.find(m => m.id === config.builtinModel);
  return `${model?.emoji || "⚡"} ${model?.label || "Gemini Flash"}`;
};
