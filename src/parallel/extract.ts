import { Effect, Option } from "effect";
import { extract } from "./api.js";
import type { ExtractRequest } from "./types.js";
import { formatExtractResponse } from "../output/format.js";
import { readStdin } from "./search.js";
import { ValidationError } from "../errors.js";

function validateUrl(url: string): Effect.Effect<string, ValidationError> {
  return Effect.gen(function* () {
    const parsed = yield* Effect.try({
      try: () => new URL(url),
      catch: (_error) => new ValidationError(`Invalid URL format: ${url}`),
    });

    if (!["http:", "https:"].includes(parsed.protocol)) {
      yield* Effect.fail(new ValidationError(`Invalid URL protocol: ${url}. Only http: and https: are allowed`));
    }

    return url;
  });
}

export function runExtracts(
  urls: string[],
  stdin: boolean,
  objective: Option.Option<string>,
  excerpts: boolean,
  fullContent: boolean,
  concurrency: number,
  format: "json" | "text",
  pretty: boolean,
): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    let allUrls = [...urls];
    if (stdin) {
      const stdinLines = yield* Effect.tryPromise({
        try: () => readStdin(),
        catch: (e) => new Error(`Failed to read stdin: ${e instanceof Error ? e.message : String(e)}`),
      });
      allUrls = [...allUrls, ...stdinLines];
    }

    if (allUrls.length === 0) {
      return yield* Effect.fail(new Error("No URLs provided. Provide URLs as arguments or use --stdin"));
    }

    // Validate all URLs before processing
    const validatedUrls = yield* Effect.forEach(allUrls, (url) => validateUrl(url), { concurrency: 1 });

    // Default to excerpts if neither is requested
    const useExcerpts = excerpts || !fullContent;

    const requests: ExtractRequest[] = validatedUrls.map((url) => ({
      urls: [url],
      objective: Option.isSome(objective) ? objective.value : undefined,
      excerpts: useExcerpts,
      full_content: fullContent,
    }));

    const results = yield* Effect.forEach(
      requests,
      (req) => extract(req),
      { concurrency },
    );

    if (format === "json") {
      const output = results.map((r) => formatExtractResponse(r, format, pretty)).join("\n");
      process.stdout.write(output + "\n");
    } else {
      for (const result of results) {
        process.stdout.write(formatExtractResponse(result, format, pretty) + "\n\n");
      }
    }
  });
}
