import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Effect, Exit, Cause } from "effect";
import { getConfigPath, loadConfigFile, removeConfigFile, resolveApiKey, saveConfigFile } from "../src/config/config.js";
import { configFilePath } from "../src/config/paths.js";
import { setupTestEnv, cleanupTestEnv } from "./helpers.js";
import fs from "node:fs/promises";
import { ConfigError } from "../src/errors.js";

describe("config", () => {
  const originalEnv = process.env.PARALLEL_API_KEY;

  beforeEach(async () => {
    delete process.env.PARALLEL_API_KEY;
    await setupTestEnv();
  });

  afterEach(async () => {
    process.env.PARALLEL_API_KEY = originalEnv;
    await cleanupTestEnv();
  });

  test("resolveApiKey prefers env over file", async () => {
    process.env.PARALLEL_API_KEY = "valid-env-key-1234567890";
    const config = { apiKey: "valid-file-key-1234567890" };
    const result = await Effect.runPromise(resolveApiKey(config));
    expect(result).toBe("valid-env-key-1234567890");
  });

  test("resolveApiKey falls back to file", async () => {
    delete process.env.PARALLEL_API_KEY;
    const config = { apiKey: "valid-file-key-1234567890" };
    const result = await Effect.runPromise(resolveApiKey(config));
    expect(result).toBe("valid-file-key-1234567890");
  });

  test("resolveApiKey returns undefined when neither set", async () => {
    delete process.env.PARALLEL_API_KEY;
    const config = {};
    const result = await Effect.runPromise(resolveApiKey(config));
    expect(result).toBeUndefined();
  });

  test("resolveApiKey trims whitespace", async () => {
    process.env.PARALLEL_API_KEY = "  valid-api-key-12345678  ";
    const result = await Effect.runPromise(resolveApiKey({}));
    expect(result).toBe("valid-api-key-12345678");
  });

  test("resolveApiKey rejects keys with newlines (header injection)", async () => {
    process.env.PARALLEL_API_KEY = "valid-key-1234567890\r\nX-Injected: malicious";
    const result = await Effect.runPromiseExit(resolveApiKey({}));
    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("ConfigError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });

  test("resolveApiKey rejects keys with special characters", async () => {
    process.env.PARALLEL_API_KEY = "invalid@key#with$special%chars";
    const result = await Effect.runPromiseExit(resolveApiKey({}));
    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("ConfigError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });

  test("resolveApiKey rejects keys that are too short", async () => {
    process.env.PARALLEL_API_KEY = "short";
    const result = await Effect.runPromiseExit(resolveApiKey({}));
    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("ConfigError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });

  test("resolveApiKey rejects keys that are too long", async () => {
    process.env.PARALLEL_API_KEY = "a".repeat(101);
    const result = await Effect.runPromiseExit(resolveApiKey({}));
    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("ConfigError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });

  test("resolveApiKey accepts valid keys with hyphens and underscores", async () => {
    process.env.PARALLEL_API_KEY = "valid-api_key-123456";
    const result = await Effect.runPromise(resolveApiKey({}));
    expect(result).toBe("valid-api_key-123456");
  });

  test("resolveApiKey validates file-based keys", async () => {
    delete process.env.PARALLEL_API_KEY;
    const config = { apiKey: "invalid@key" };
    const result = await Effect.runPromiseExit(resolveApiKey(config));
    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("ConfigError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });

  test("getConfigPath returns valid path", () => {
    const p = getConfigPath();
    expect(p).toBeTruthy();
    expect(typeof p).toBe("string");
    expect(p.endsWith("config.json")).toBe(true);
  });

  test("saveConfigFile creates file with correct content", async () => {
    const result = await Effect.runPromise(saveConfigFile({ apiKey: "valid-test-key-1234567890" }));
    expect(result).toBeTruthy();

    const exists = await fs.access(result).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    const content = await fs.readFile(result, "utf8");
    const parsed = JSON.parse(content.trim());
    expect(parsed.apiKey).toBe("valid-test-key-1234567890");
  });

  test("saveConfigFile sets secure file permissions (0o600)", async () => {
    const result = await Effect.runPromise(saveConfigFile({ apiKey: "test-key" }));
    const stats = await fs.stat(result);
    // biome-ignore lint/style/noNonNullAssertion: stats.mode is always defined for existing files
    const permissions = stats.mode! & 0o777;
    expect(permissions).toBe(0o600);
  });

  test("loadConfigFile reads valid config", async () => {
    await Effect.runPromise(saveConfigFile({ apiKey: "valid-test-key-1234567890" }));
    const result = await Effect.runPromise(loadConfigFile);
    expect(result.apiKey).toBe("valid-test-key-1234567890");
  });

  test("loadConfigFile handles missing file gracefully", async () => {
    try {
      await Effect.runPromise(removeConfigFile);
    } catch {}
    const result = await Effect.runPromiseExit(loadConfigFile);
    expect(result._tag).toBe("Failure");
  });

  test("removeConfigFile deletes file", async () => {
    const file = await Effect.runPromise(saveConfigFile({ apiKey: "valid-test-key-1234567890" }));
    const result = await Effect.runPromise(removeConfigFile);
    expect(result).toBe(file);

    const exists = await fs.access(file).then(() => true).catch(() => false);
    expect(exists).toBe(false);
  });

  test("configFilePath uses XDG_CONFIG_HOME on non-darwin", () => {
    const originalPlatform = process.platform;
    const originalXdg = process.env.XDG_CONFIG_HOME;
    const originalTestDir = process.env.PARALLEL_TEST_CONFIG_DIR;
    
    delete process.env.PARALLEL_TEST_CONFIG_DIR;
    Object.defineProperty(process, "platform", { value: "linux", writable: true });
    process.env.XDG_CONFIG_HOME = "/custom/config";
    
    const path = configFilePath("test-app");
    expect(path).toBe("/custom/config/test-app/config.json");
    
    Object.defineProperty(process, "platform", { value: originalPlatform, writable: true });
    process.env.XDG_CONFIG_HOME = originalXdg;
    if (originalTestDir) process.env.PARALLEL_TEST_CONFIG_DIR = originalTestDir;
  });

  test("configFilePath uses .config fallback on non-darwin without XDG", () => {
    const originalPlatform = process.platform;
    const originalXdg = process.env.XDG_CONFIG_HOME;
    const originalTestDir = process.env.PARALLEL_TEST_CONFIG_DIR;

    delete process.env.PARALLEL_TEST_CONFIG_DIR;
    Object.defineProperty(process, "platform", { value: "linux", writable: true });
    delete process.env.XDG_CONFIG_HOME;

    const path = configFilePath("test-app");
    expect(path).toContain(".config/test-app/config.json");

    Object.defineProperty(process, "platform", { value: originalPlatform, writable: true });
    process.env.XDG_CONFIG_HOME = originalXdg;
    if (originalTestDir) process.env.PARALLEL_TEST_CONFIG_DIR = originalTestDir;
  });

  test("resolveApiKey returns ConfigError through Effect channel for invalid env key", async () => {
    process.env.PARALLEL_API_KEY = "invalid-key-with-newline\nX-Injected: header";
    const result = await Effect.runPromiseExit(resolveApiKey({}));

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("ConfigError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });

  test("resolveApiKey returns ConfigError through Effect channel for invalid file key", async () => {
    delete process.env.PARALLEL_API_KEY;
    const config = { apiKey: "short" };
    const result = await Effect.runPromiseExit(resolveApiKey(config));

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("ConfigError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });
});
