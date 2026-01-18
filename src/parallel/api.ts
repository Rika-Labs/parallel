import { Effect } from "effect";
import { CliError, ApiError } from "../errors.js";
import { loadConfigFile, resolveApiKey } from "../config/config.js";
import type { ExtractRequest, ExtractResponse, SearchRequest, SearchResponse } from "./types.js";

const API_BASE = "https://api.parallel.ai";
const BETA_HEADER = "search-extract-2025-10-10";

function getApiKey(): Effect.Effect<string, CliError> {
  return Effect.gen(function* () {
    const config = yield* Effect.catchAll(
      loadConfigFile,
      () => Effect.succeed({}),
    );
    const key = yield* Effect.mapError(
      resolveApiKey(config),
      (e) => new CliError(e.message),
    );
    if (!key) {
      return yield* Effect.fail(new CliError("No API key set. Use PARALLEL_API_KEY or parallel config set-key <key>"));
    }
    return key;
  });
}

function makeRequest<T>(endpoint: string, body: unknown): Effect.Effect<T, CliError | ApiError> {
  return Effect.gen(function* () {
    const apiKey = yield* getApiKey();
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "parallel-beta": BETA_HEADER,
          },
          body: JSON.stringify(body),
        }),
      catch: (e) => new CliError(`Network error: ${e instanceof Error ? e.message : String(e)}`),
    });

    if (!response.ok) {
      const text: string = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: (): CliError => new CliError("Failed to read error response"),
      }).pipe(Effect.orElseSucceed(() => "Failed to read error response"));
      
      let message = `API error (${response.status})`;
      if (response.status === 401) {
        message = "Invalid API key. Check your key with 'parallel config get-key'";
      } else if (response.status === 402) {
        message = "Insufficient credits. Add credits at https://platform.parallel.ai";
      } else if (response.status === 422) {
        message = `Validation error: ${text}`;
      } else if (response.status === 429) {
        message = "Rate limit exceeded. Try again later.";
      }
      
      return yield* Effect.fail(new ApiError(message, response.status, text));
    }

    const data: T = yield* Effect.tryPromise({
      try: () => response.json() as Promise<T>,
      catch: (e) => new CliError(`Failed to parse response: ${e instanceof Error ? e.message : String(e)}`),
    });

    return data;
  });
}

export function search(request: SearchRequest): Effect.Effect<SearchResponse, CliError | ApiError> {
  return makeRequest<SearchResponse>("/v1beta/search", request);
}

export function extract(request: ExtractRequest): Effect.Effect<ExtractResponse, CliError | ApiError> {
  return makeRequest<ExtractResponse>("/v1beta/extract", request);
}
