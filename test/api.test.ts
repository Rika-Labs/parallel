import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { Effect, Cause } from "effect";
import { search, extract } from "../src/parallel/api.js";
import { saveConfigFile } from "../src/config/config.js";
import { setupTestEnv, cleanupTestEnv } from "./helpers.js";
import type { CliError, ApiError } from "../src/errors.js";

function createMockFetch(handler: (url: string | URL | Request, init?: RequestInit) => Promise<Response>): typeof fetch {
  const mockFn = mock(handler) as unknown as typeof fetch;
  (mockFn as { preconnect: typeof fetch.preconnect }).preconnect = () => {};
  return mockFn;
}

describe("api", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.PARALLEL_API_KEY;

  beforeEach(async () => {
    delete process.env.PARALLEL_API_KEY;
    await setupTestEnv();
    await Effect.runPromise(saveConfigFile({ apiKey: "valid-test-key-1234567890" }));
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    process.env.PARALLEL_API_KEY = originalEnv;
    await cleanupTestEnv();
  });

  test("search makes correct request", async () => {
    global.fetch = createMockFetch(async (url, init) => {
      expect(url).toBe("https://api.parallel.ai/v1beta/search");
      expect(init?.method).toBe("POST");
      const headers = init?.headers as Record<string, string>;
      expect(headers["x-api-key"]).toBe("valid-test-key-1234567890");
      expect(headers["parallel-beta"]).toBe("search-extract-2025-10-10");

      return new Response(JSON.stringify({
        search_id: "test-id",
        results: []
      }), { status: 200 });
    });

    const result = await Effect.runPromise(search({ objective: "test" }));
    expect(result.search_id).toBe("test-id");
  });

  test("extract makes correct request", async () => {
    global.fetch = createMockFetch(async (url, init) => {
      expect(url).toBe("https://api.parallel.ai/v1beta/extract");
      const body = JSON.parse(init?.body as string) as { urls: string[] };
      expect(body.urls).toEqual(["https://example.com"]);
      
      return new Response(JSON.stringify({
        extract_id: "test-id",
        results: []
      }), { status: 200 });
    });

    const result = await Effect.runPromise(extract({ urls: ["https://example.com"] }));
    expect(result.extract_id).toBe("test-id");
  });

  test("handles 401 error", async () => {
    global.fetch = createMockFetch(async () => new Response("Unauthorized", { status: 401 }));
    const result = await Effect.runPromiseExit(search({ objective: "test" }));
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = Cause.failureOption(result.cause);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect((error.value as CliError | ApiError).message).toContain("Invalid API key");
      }
    }
  });

  test("handles 402 error", async () => {
    global.fetch = createMockFetch(async () => new Response("Payment Required", { status: 402 }));
    const result = await Effect.runPromiseExit(search({ objective: "test" }));
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = Cause.failureOption(result.cause);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect((error.value as CliError | ApiError).message).toContain("Insufficient credits");
      }
    }
  });

  test("handles 429 error", async () => {
    global.fetch = createMockFetch(async () => new Response("Too Many Requests", { status: 429 }));
    const result = await Effect.runPromiseExit(search({ objective: "test" }));
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = Cause.failureOption(result.cause);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect((error.value as CliError | ApiError).message).toContain("Rate limit exceeded");
      }
    }
  });

  test("handles 422 validation error", async () => {
    const errorBody = JSON.stringify({
      type: "error",
      error: { message: "Neither excerpts nor full_content were requested." }
    });
    global.fetch = createMockFetch(async () => new Response(errorBody, { status: 422 }));
    const result = await Effect.runPromiseExit(extract({ urls: ["https://example.com"] }));
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = Cause.failureOption(result.cause);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect((error.value as CliError | ApiError).message).toContain("Validation error");
        expect((error.value as CliError | ApiError).message).toContain("excerpts");
      }
    }
  });

  test("handles other API errors", async () => {
    global.fetch = createMockFetch(async () => new Response("Server Error", { status: 500 }));
    const result = await Effect.runPromiseExit(search({ objective: "test" }));
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = Cause.failureOption(result.cause);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect((error.value as CliError | ApiError).message).toContain("API error (500)");
      }
    }
  });

  test("handles invalid json response", async () => {
    global.fetch = createMockFetch(async () => new Response("not json", { status: 200 }));
    const result = await Effect.runPromiseExit(search({ objective: "test" }));
    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = Cause.failureOption(result.cause);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect((error.value as CliError | ApiError).message).toContain("Failed to parse response");
      }
    }
  });
});
