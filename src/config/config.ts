import { Effect } from "effect";
import fs from "node:fs/promises";
import path from "node:path";
import { ConfigError } from "../errors.js";
import { configFilePath } from "./paths.js";

export type StoredConfig = {
  apiKey?: string;
};

export const AppName = "parallel";

export const loadConfigFile = Effect.tryPromise({
  try: async () => {
    const file = configFilePath(AppName);
    const data = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(data) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const apiKey = (parsed as Record<string, unknown>).apiKey;
    if (typeof apiKey === "string") return { apiKey } satisfies StoredConfig;
    return {};
  },
  catch: (e) => {
    const err = e instanceof Error ? e : new Error(String(e));
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return new ConfigError("Config not found");
    return new ConfigError(err.message);
  },
});

export const saveConfigFile = (config: StoredConfig) =>
  Effect.tryPromise({
    try: async () => {
      const file = configFilePath(AppName);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, `${JSON.stringify(config)}\n`, { encoding: "utf8" });
      await fs.chmod(file, 0o600);

      // Verify permissions were actually set
      const stats = await fs.stat(file);
      // biome-ignore lint/style/noNonNullAssertion: stats.mode is always defined for existing files
      if ((stats.mode! & 0o777) !== 0o600) {
        throw new Error("Failed to secure config file permissions");
      }

      return file;
    },
    catch: (e) => (e instanceof Error ? new ConfigError(e.message) : new ConfigError(String(e))),
  });

export const removeConfigFile = Effect.tryPromise({
  try: async () => {
    const file = configFilePath(AppName);
    await fs.rm(file, { force: true });
    return file;
  },
  catch: (e) => (e instanceof Error ? new ConfigError(e.message) : new ConfigError(String(e))),
});

function validateApiKeyFormat(key: string): boolean {
  // API keys should only contain alphanumeric characters, underscores, and hyphens
  // Length between 20-100 characters to prevent header injection attacks
  return /^[a-zA-Z0-9_-]{20,100}$/.test(key);
}

export function resolveApiKey(config: StoredConfig): Effect.Effect<string | undefined, ConfigError> {
  return Effect.gen(function* () {
    const envKey = process.env.PARALLEL_API_KEY;
    if (envKey && envKey.trim().length > 0) {
      const trimmed = envKey.trim();
      if (!validateApiKeyFormat(trimmed)) {
        return yield* Effect.fail(new ConfigError("Invalid API key format. API keys must be 20-100 characters and contain only alphanumeric characters, underscores, and hyphens."));
      }
      return trimmed;
    }
    const fileKey = config.apiKey;
    if (fileKey && fileKey.trim().length > 0) {
      const trimmed = fileKey.trim();
      if (!validateApiKeyFormat(trimmed)) {
        return yield* Effect.fail(new ConfigError("Invalid API key format. API keys must be 20-100 characters and contain only alphanumeric characters, underscores, and hyphens."));
      }
      return trimmed;
    }
    return undefined;
  });
}

export function getConfigPath(): string {
  return configFilePath(AppName);
}

