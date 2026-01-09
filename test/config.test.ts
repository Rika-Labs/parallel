import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Effect } from "effect";
import { getConfigPath, loadConfigFile, removeConfigFile, resolveApiKey, saveConfigFile } from "../src/config/config.js";
import { configFilePath } from "../src/config/paths.js";
import { setupTestEnv, cleanupTestEnv } from "./helpers.js";
import fs from "node:fs/promises";

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

  test("resolveApiKey prefers env over file", () => {
    process.env.PARALLEL_API_KEY = "env-key";
    const config = { apiKey: "file-key" };
    expect(resolveApiKey(config)).toBe("env-key");
  });

  test("resolveApiKey falls back to file", () => {
    delete process.env.PARALLEL_API_KEY;
    const config = { apiKey: "file-key" };
    expect(resolveApiKey(config)).toBe("file-key");
  });

  test("resolveApiKey returns undefined when neither set", () => {
    delete process.env.PARALLEL_API_KEY;
    const config = {};
    expect(resolveApiKey(config)).toBeUndefined();
  });

  test("resolveApiKey trims whitespace", () => {
    process.env.PARALLEL_API_KEY = "  env-key  ";
    expect(resolveApiKey({})).toBe("env-key");
  });

  test("getConfigPath returns valid path", () => {
    const p = getConfigPath();
    expect(p).toBeTruthy();
    expect(typeof p).toBe("string");
    expect(p.endsWith("config.json")).toBe(true);
  });

  test("saveConfigFile creates file with correct content", async () => {
    const result = await Effect.runPromise(saveConfigFile({ apiKey: "test-key" }));
    expect(result).toBeTruthy();

    const exists = await fs.access(result).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    const content = await fs.readFile(result, "utf8");
    const parsed = JSON.parse(content.trim());
    expect(parsed.apiKey).toBe("test-key");
  });

  test("loadConfigFile reads valid config", async () => {
    await Effect.runPromise(saveConfigFile({ apiKey: "test-key" }));
    const result = await Effect.runPromise(loadConfigFile);
    expect(result.apiKey).toBe("test-key");
  });

  test("loadConfigFile handles missing file gracefully", async () => {
    try {
      await Effect.runPromise(removeConfigFile);
    } catch {}
    const result = await Effect.runPromiseExit(loadConfigFile);
    expect(result._tag).toBe("Failure");
  });

  test("removeConfigFile deletes file", async () => {
    const file = await Effect.runPromise(saveConfigFile({ apiKey: "test-key" }));
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
});
