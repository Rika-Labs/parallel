import { Effect, Option } from "effect";
import { runExtracts } from "../parallel/extract.js";

export type Format = "json" | "text";

export interface ExtractCommand {
  urls: string[];
  stdin: boolean;
  objective: Option.Option<string>;
  excerpts: boolean;
  fullContent: boolean;
  concurrency: number;
  format: Format;
  pretty: boolean;
}

export function runExtractCommand(cmd: ExtractCommand): Effect.Effect<void, any> {
  return runExtracts(
    cmd.urls,
    cmd.stdin,
    cmd.objective,
    cmd.excerpts,
    cmd.fullContent,
    cmd.concurrency,
    cmd.format,
    cmd.pretty,
  );
}
