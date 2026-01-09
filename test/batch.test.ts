import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { Effect, Option } from "effect";
import { runSearches } from "../src/parallel/search.js";
import { runExtracts } from "../src/parallel/extract.js";
import { saveConfigFile } from "../src/config/config.js";
import { setupTestEnv, cleanupTestEnv } from "./helpers.js";

function createMockFetch(handler: () => Promise<Response>): typeof fetch {
  const mockFn = mock(handler) as unknown as typeof fetch;
  (mockFn as { preconnect: typeof fetch.preconnect }).preconnect = () => {};
  return mockFn;
}

describe("batch", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.PARALLEL_API_KEY;

  beforeEach(async () => {
    delete process.env.PARALLEL_API_KEY;
    await setupTestEnv();
    await Effect.runPromise(saveConfigFile({ apiKey: "test-key" }));
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    process.env.PARALLEL_API_KEY = originalEnv;
    await cleanupTestEnv();
  });

  test("runSearches calls API for each objective and handles text format", async () => {
    let callCount = 0;
    global.fetch = createMockFetch(async () => {
      callCount++;
      return new Response(JSON.stringify({
        search_id: `id-${callCount}`,
        results: [{ url: "http://test.com", title: "Test", excerpts: ["content"] }]
      }), { status: 200 });
    });

    const stdoutWrite = mock((_str: string) => {});
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = stdoutWrite as any;

    await Effect.runPromise(runSearches(
      ["obj1"],
      false,
      "one-shot",
      [],
      10,
      6000,
      1,
      "text",
      false
    ));

    process.stdout.write = originalStdoutWrite;
    expect(callCount).toBe(1);
    expect(stdoutWrite.mock.calls.length).toBeGreaterThan(0);
  });

  test("runExtracts handles text format", async () => {
    global.fetch = createMockFetch(async () => {
      return new Response(JSON.stringify({
        extract_id: `id-1`,
        results: [{ url: "http://test.com", title: "Test", excerpts: ["content"] }]
      }), { status: 200 });
    });

    const stdoutWrite = mock((_str: string) => {});
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = stdoutWrite as any;

    await Effect.runPromise(runExtracts(
      ["url1"],
      false,
      Option.none(),
      true,
      false,
      1,
      "text",
      false
    ));

    process.stdout.write = originalStdoutWrite;
    expect(stdoutWrite.mock.calls.length).toBeGreaterThan(0);
  });

  test("runSearches fails if no objectives provided", async () => {
    const result = await Effect.runPromiseExit(runSearches(
      [],
      false,
      "one-shot",
      [],
      10,
      6000,
      2,
      "json",
      false
    ));
    expect(result._tag).toBe("Failure");
  });

  test("runSearches fails if no URLs provided", async () => {
    const result = await Effect.runPromiseExit(runExtracts(
      [],
      false,
      Option.none(),
      true,
      false,
      2,
      "json",
      false
    ));
    expect(result._tag).toBe("Failure");
  });

  test("runSearches uses stdin", async () => {
    global.fetch = createMockFetch(async () => {
      return new Response(JSON.stringify({
        search_id: `id-stdin`,
        results: []
      }), { status: 200 });
    });

    const originalStdin = Bun.stdin.stream;
    (Bun.stdin as any).stream = () => {
      return {
        async *[Symbol.asyncIterator]() {
          yield new TextEncoder().encode("stdin-obj\n");
        }
      };
    };

    await Effect.runPromise(runSearches(
      [],
      true,
      "one-shot",
      [],
      10,
      6000,
      1,
      "json",
      false
    ));

    (Bun.stdin as any).stream = originalStdin;
  });

  test("runExtracts uses stdin", async () => {
    global.fetch = createMockFetch(async () => {
      return new Response(JSON.stringify({
        extract_id: `id-stdin`,
        results: []
      }), { status: 200 });
    });

    const originalStdin = Bun.stdin.stream;
    (Bun.stdin as any).stream = () => {
      return {
        async *[Symbol.asyncIterator]() {
          yield new TextEncoder().encode("http://stdin.com\n");
        }
      };
    };

    await Effect.runPromise(runExtracts(
      [],
      true,
      Option.none(),
      true,
      false,
      1,
      "json",
      false
    ));

    (Bun.stdin as any).stream = originalStdin;
  });
});
