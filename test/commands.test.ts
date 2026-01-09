import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { Effect } from "effect";
import { runConfigCommand } from "../src/commands/config.js";
import { saveConfigFile, getConfigPath } from "../src/config/config.js";
import { setupTestEnv, cleanupTestEnv } from "./helpers.js";
import fs from "node:fs/promises";

describe("commands", () => {
  const originalEnv = process.env.PARALLEL_API_KEY;

  beforeEach(async () => {
    delete process.env.PARALLEL_API_KEY;
    await setupTestEnv();
  });

  afterEach(async () => {
    process.env.PARALLEL_API_KEY = originalEnv;
    await cleanupTestEnv();
  });

  test("runConfigCommand path", async () => {
    const stdoutWrite = mock((_str: string) => {});
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = stdoutWrite as any;

    await Effect.runPromise(runConfigCommand({ _tag: "Config", action: "path" }));

    process.stdout.write = originalStdoutWrite;
    expect(stdoutWrite.mock.calls[0]?.[0]).toBe(`${getConfigPath()}\n`);
  });

  test("runConfigCommand set-key", async () => {
    const stdoutWrite = mock((_str: string) => {});
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = stdoutWrite as any;

    await Effect.runPromise(runConfigCommand({ _tag: "Config", action: "set-key", key: "new-key" }));

    process.stdout.write = originalStdoutWrite;
    const path = String(stdoutWrite.mock.calls[0]?.[0]).trim();
    const content = await fs.readFile(path, "utf8");
    expect(JSON.parse(content).apiKey).toBe("new-key");
  });

  test("runConfigCommand get-key success", async () => {
    await Effect.runPromise(saveConfigFile({ apiKey: "stored-key" }));
    const stdoutWrite = mock((_str: string) => {});
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = stdoutWrite as any;

    await Effect.runPromise(runConfigCommand({ _tag: "Config", action: "get-key" }));

    process.stdout.write = originalStdoutWrite;
    expect(stdoutWrite.mock.calls[0]?.[0]).toBe(`stored-key\n`);
  });

  test("runConfigCommand get-key missing", async () => {
    try {
      await Effect.runPromise(removeConfigFile);
    } catch {}
    const result = await Effect.runPromiseExit(runConfigCommand({ _tag: "Config", action: "get-key" }));
    expect(result._tag).toBe("Failure");
  });

  test("runConfigCommand unset-key", async () => {
    await Effect.runPromise(saveConfigFile({ apiKey: "stored-key" }));
    const stdoutWrite = mock((_str: string) => {});
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = stdoutWrite as any;

    await Effect.runPromise(runConfigCommand({ _tag: "Config", action: "unset-key" }));

    process.stdout.write = originalStdoutWrite;
    const path = String(stdoutWrite.mock.calls[0]?.[0]).trim();
    const exists = await fs.access(path).then(() => true).catch(() => false);
    expect(exists).toBe(false);
  });
});
