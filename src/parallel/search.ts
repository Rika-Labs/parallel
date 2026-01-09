import { Effect } from "effect";
import { search } from "./api.js";
import type { SearchRequest } from "./types.js";
import { formatSearchResponse } from "../output/format.js";

export async function readStdin(): Promise<string[]> {
  const chunks: string[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(new TextDecoder().decode(chunk));
  }
  const text = chunks.join("");
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function runSearches(
  objectives: string[],
  stdin: boolean,
  mode: "one-shot" | "agentic",
  queries: string[],
  maxResults: number,
  excerptChars: number,
  concurrency: number,
  format: "json" | "text",
  pretty: boolean,
): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    let allObjectives = [...objectives];
    if (stdin) {
      const stdinLines = yield* Effect.tryPromise({
        try: () => readStdin(),
        catch: (e) => new Error(`Failed to read stdin: ${e instanceof Error ? e.message : String(e)}`),
      });
      allObjectives = [...allObjectives, ...stdinLines];
    }

    if (allObjectives.length === 0) {
      return yield* Effect.fail(new Error("No objectives provided. Use --objective or --stdin"));
    }

    const requests: SearchRequest[] = allObjectives.map((objective) => ({
      mode,
      objective,
      search_queries: queries.length > 0 ? queries : undefined,
      max_results: maxResults,
      excerpts: {
        max_chars_per_result: excerptChars,
      },
    }));

    const results = yield* Effect.forEach(
      requests,
      (req) => search(req),
      { concurrency },
    );

    if (format === "json") {
      const output = results.map((r) => formatSearchResponse(r, format, pretty)).join("\n");
      process.stdout.write(output + "\n");
    } else {
      for (const result of results) {
        process.stdout.write(formatSearchResponse(result, format, pretty) + "\n\n");
      }
    }
  });
}
