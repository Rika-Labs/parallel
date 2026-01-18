import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Effect, Exit, Cause } from "effect";
import { runConfigCommand } from "../src/commands/config.js";
import { setupTestEnv, cleanupTestEnv } from "./helpers.js";

describe("error handling integration", () => {
  const originalEnv = process.env.PARALLEL_API_KEY;

  beforeEach(async () => {
    delete process.env.PARALLEL_API_KEY;
    await setupTestEnv();
  });

  afterEach(async () => {
    process.env.PARALLEL_API_KEY = originalEnv;
    await cleanupTestEnv();
  });

  test("config get-key with invalid env key returns CliError through Effect channel", async () => {
    process.env.PARALLEL_API_KEY = "invalid@key#format";
    const cmd = { _tag: "Config" as const, action: "get-key" as const };

    const result = await Effect.runPromiseExit(runConfigCommand(cmd));

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("CliError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });

  test("config get-key with newline injection attempt returns CliError", async () => {
    process.env.PARALLEL_API_KEY = "valid-key-1234567890\r\nX-Evil: header";
    const cmd = { _tag: "Config" as const, action: "get-key" as const };

    const result = await Effect.runPromiseExit(runConfigCommand(cmd));

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const error = Cause.failureOption(result.cause);
      expect(error).toBeDefined();
      if (error) {
        expect(error._tag).toBe("CliError");
        expect(error.message).toContain("Invalid API key format");
      }
    }
  });

  test("config get-key with valid key succeeds", async () => {
    process.env.PARALLEL_API_KEY = "valid-api-key-1234567890";
    const cmd = { _tag: "Config" as const, action: "get-key" as const };

    const result = await Effect.runPromiseExit(runConfigCommand(cmd));

    expect(Exit.isSuccess(result)).toBe(true);
  });
});
