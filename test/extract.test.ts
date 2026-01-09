import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { Effect } from "effect";
import { Option } from "effect";
import { runExtracts } from "../src/parallel/extract.js";
import { saveConfigFile } from "../src/config/config.js";
import { setupTestEnv, cleanupTestEnv } from "./helpers.js";

function createMockFetch(handler: (url: string | URL | Request, init?: RequestInit) => Promise<Response>): typeof fetch {
  const mockFn = mock(handler) as unknown as typeof fetch;
  (mockFn as { preconnect: typeof fetch.preconnect }).preconnect = () => {};
  return mockFn;
}

describe("extract", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.PARALLEL_API_KEY;
  const originalStdout = process.stdout.write;
  let output: string;

  beforeEach(async () => {
    delete process.env.PARALLEL_API_KEY;
    await setupTestEnv();
    await Effect.runPromise(saveConfigFile({ apiKey: "test-key" }));
    output = "";
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    process.env.PARALLEL_API_KEY = originalEnv;
    process.stdout.write = originalStdout;
    await cleanupTestEnv();
  });

  test("defaults to excerpts when neither excerpts nor fullContent requested", async () => {
    let capturedBody: { excerpts: boolean; full_content: boolean } | undefined;
    
    global.fetch = createMockFetch(async (_url, init) => {
      capturedBody = JSON.parse(init?.body as string) as typeof capturedBody;
      return new Response(JSON.stringify({
        extract_id: "test-id",
        results: [{ url: "https://example.com", title: "Test", excerpts: ["content"] }]
      }), { status: 200 });
    });

    await Effect.runPromise(runExtracts(
      ["https://example.com"],
      false,           // stdin
      Option.none(),   // objective
      false,           // excerpts (simulating CLI default behavior)
      false,           // fullContent
      1,               // concurrency
      "json",          // format
      false            // pretty
    ));

    expect(capturedBody?.excerpts).toBe(true);
    expect(capturedBody?.full_content).toBe(false);
  });

  test("respects fullContent when explicitly set", async () => {
    let capturedBody: { excerpts: boolean; full_content: boolean } | undefined;
    
    global.fetch = createMockFetch(async (_url, init) => {
      capturedBody = JSON.parse(init?.body as string) as typeof capturedBody;
      return new Response(JSON.stringify({
        extract_id: "test-id",
        results: [{ url: "https://example.com", title: "Test", full_content: "content" }]
      }), { status: 200 });
    });

    await Effect.runPromise(runExtracts(
      ["https://example.com"],
      false,           // stdin
      Option.none(),   // objective
      false,           // excerpts
      true,            // fullContent
      1,               // concurrency
      "json",          // format
      false            // pretty
    ));

    expect(capturedBody?.excerpts).toBe(false);
    expect(capturedBody?.full_content).toBe(true);
  });

  test("uses excerpts when explicitly set", async () => {
    let capturedBody: { excerpts: boolean; full_content: boolean } | undefined;
    
    global.fetch = createMockFetch(async (_url, init) => {
      capturedBody = JSON.parse(init?.body as string) as typeof capturedBody;
      return new Response(JSON.stringify({
        extract_id: "test-id",
        results: [{ url: "https://example.com", title: "Test", excerpts: ["content"] }]
      }), { status: 200 });
    });

    await Effect.runPromise(runExtracts(
      ["https://example.com"],
      false,           // stdin
      Option.none(),   // objective
      true,            // excerpts
      false,           // fullContent
      1,               // concurrency
      "json",          // format
      false            // pretty
    ));

    expect(capturedBody?.excerpts).toBe(true);
    expect(capturedBody?.full_content).toBe(false);
  });
});
