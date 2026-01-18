import { Command, Options } from "@effect/cli";
import { Array, Option } from "effect";
import { runConfigCommand } from "../commands/config.js";
import { runSearchCommand } from "../commands/search.js";
import { runExtractCommand } from "../commands/extract.js";

const configSetKey = Command.make("set-key", {
  options: {
    key: Options.text("key"),
  },
}, ({ options }) => runConfigCommand({ _tag: "Config", action: "set-key", key: options.key }));

const configGetKey = Command.make("get-key", {}, () => runConfigCommand({ _tag: "Config", action: "get-key" }));

const configUnsetKey = Command.make("unset-key", {}, () => runConfigCommand({ _tag: "Config", action: "unset-key" }));

const configPath = Command.make("path", {}, () => runConfigCommand({ _tag: "Config", action: "path" }));

const config = Command.make("config").pipe(
  Command.withSubcommands([configSetKey, configGetKey, configUnsetKey, configPath]),
);

// Search options
const searchQuery = Options.text("query").pipe(
  Options.repeated,
);

const searchMode = Options.choice("mode", ["one-shot", "agentic"] as const).pipe(
  Options.withDefault("one-shot" as const),
);

const searchMaxResults = Options.integer("max-results").pipe(
  Options.withDefault(10),
);

const searchExcerptChars = Options.integer("excerpt-chars").pipe(
  Options.withDefault(6000),
);

const searchConcurrency = Options.integer("concurrency").pipe(
  Options.withDefault(5),
);

const searchFormat = Options.choice("format", ["json", "text"] as const).pipe(
  Options.withDefault("json" as const),
);

const searchPretty = Options.boolean("pretty").pipe(Options.withDefault(false));

const searchStdin = Options.boolean("stdin").pipe(Options.withDefault(false));

const search = Command.make("search", {
  options: {
    query: searchQuery,
    mode: searchMode,
    maxResults: searchMaxResults,
    excerptChars: searchExcerptChars,
    concurrency: searchConcurrency,
    format: searchFormat,
    pretty: searchPretty,
    stdin: searchStdin,
  },
}, ({ options }) => {
  const queries = Array.fromIterable(options.query);
  const boundedConcurrency = Math.min(Math.max(1, options.concurrency), 50);

  return runSearchCommand({
    objectives: queries,
    stdin: options.stdin,
    mode: options.mode,
    queries: [],
    maxResults: options.maxResults,
    excerptChars: options.excerptChars,
    concurrency: boundedConcurrency,
    format: options.format,
    pretty: options.pretty,
  });
});

// Extract options
const extractUrl = Options.text("url").pipe(
  Options.repeated,
);

const extractObjective = Options.text("objective").pipe(Options.optional);

const extractExcerpts = Options.boolean("excerpts").pipe(Options.withDefault(true));

const extractFullContent = Options.boolean("full-content").pipe(Options.withDefault(false));

const extractConcurrency = Options.integer("concurrency").pipe(Options.withDefault(5));

const extractFormat = Options.choice("format", ["json", "text"] as const).pipe(
  Options.withDefault("json" as const),
);

const extractPretty = Options.boolean("pretty").pipe(Options.withDefault(false));

const extractStdin = Options.boolean("stdin").pipe(Options.withDefault(false));

const extract = Command.make("extract", {
  options: {
    url: extractUrl,
    objective: extractObjective,
    excerpts: extractExcerpts,
    fullContent: extractFullContent,
    concurrency: extractConcurrency,
    format: extractFormat,
    pretty: extractPretty,
    stdin: extractStdin,
  },
}, ({ options }) => {
  const urls = Array.fromIterable(options.url);
  const boundedConcurrency = Math.min(Math.max(1, options.concurrency), 50);

  return runExtractCommand({
    urls,
    stdin: options.stdin,
    objective: Option.isSome(options.objective) ? Option.some(options.objective.value) : Option.none(),
    excerpts: options.excerpts,
    fullContent: options.fullContent,
    concurrency: boundedConcurrency,
    format: options.format,
    pretty: options.pretty,
  });
});

export const parallel = Command.make("parallel").pipe(
  Command.withSubcommands([config, search, extract]),
);
