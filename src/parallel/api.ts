import { Effect, Schedule } from "effect";
import { CliError, ApiError } from "../errors.js";
import { loadConfigFile, resolveApiKey } from "../config/config.js";
import type { ExtractRequest, ExtractResponse, SearchRequest, SearchResponse } from "./types.js";

const API_BASE = "https://api.parallel.ai";
const BETA_HEADER = "search-extract-2025-10-10";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 10000;

function getApiKey(): Effect.Effect<string, CliError> {
  return Effect.gen(function* () {
    const config = yield* Effect.catchAll(
      loadConfigFile,
      () => Effect.succeed({}),
    );
    const key = resolveApiKey(config);
    if (!key) {
      return yield* Effect.fail(new CliError("No API key set. Use PARALLEL_API_KEY or parallel config set-key <key>"));
    }
    return key;
  });
}

function isRetryableError(error: CliError | ApiError): boolean {
  if (error._tag === "ApiError") {
    const status = error.status;
    // Retry on 429 (rate limit) and 5xx (server errors)
    return status === 429 || (status !== undefined && status >= 500 && status < 600);
  }
  // Retry on network errors (CliError from fetch failures)
  return error.message.startsWith("Network error");
}

function createRetrySchedule(): Schedule.Schedule<number, unknown> {
  return Schedule.exponential(INITIAL_DELAY_MS).pipe(
    Schedule.either(Schedule.spaced(MAX_DELAY_MS)),
    Schedule.compose(Schedule.elapsed),
    Schedule.whileOutput((elapsed) => elapsed < MAX_DELAY_MS),
    Schedule.intersect(Schedule.recurs(MAX_RETRIES)),
  );
}

function makeRequest<T>(endpoint: string, body: unknown): Effect.Effect<T, CliError | ApiError> {
  const attemptRequest = Effect.gen(function* () {
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
        message = "Rate limit exceeded. Retrying...";
      }

      return yield* Effect.fail(new ApiError(message, response.status, text));
    }

    const data: T = yield* Effect.tryPromise({
      try: () => response.json() as Promise<T>,
      catch: (e) => new CliError(`Failed to parse response: ${e instanceof Error ? e.message : String(e)}`),
    });

    return data;
  });

  return attemptRequest.pipe(
    Effect.retry({
      schedule: createRetrySchedule(),
      while: isRetryableError,
    }),
  );
}

export function search(request: SearchRequest): Effect.Effect<SearchResponse, CliError | ApiError> {
  return makeRequest<SearchResponse>("/v1beta/search", request);
}

export function extract(request: ExtractRequest): Effect.Effect<ExtractResponse, CliError | ApiError> {
  return makeRequest<ExtractResponse>("/v1beta/extract", request);
}
