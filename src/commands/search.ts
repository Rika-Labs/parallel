import { Effect } from "effect";
import { runSearches } from "../parallel/search.js";

export type SearchMode = "one-shot" | "agentic";
export type Format = "json" | "text";

export interface SearchCommand {
  objectives: string[];
  stdin: boolean;
  mode: SearchMode;
  queries: string[];
  maxResults: number;
  excerptChars: number;
  concurrency: number;
  format: Format;
  pretty: boolean;
}

export function runSearchCommand(cmd: SearchCommand): Effect.Effect<void, any> {
  return runSearches(
    cmd.objectives,
    cmd.stdin,
    cmd.mode,
    cmd.queries,
    cmd.maxResults,
    cmd.excerptChars,
    cmd.concurrency,
    cmd.format,
    cmd.pretty,
  );
}
