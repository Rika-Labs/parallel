import { Args, Command, Options } from "@effect/cli";
import { Array, Option } from "effect";
import { runConfigCommand } from "../commands/config.js";
import { runSearchCommand } from "../commands/search.js";
import { runExtractCommand } from "../commands/extract.js";

const configSetKey = Command.make("set-key", {
  args: Args.text({ name: "key" }),
}, ({ args }) => runConfigCommand({ _tag: "Config", action: "set-key", key: args }));

const configGetKey = Command.make("get-key", {}, () => runConfigCommand({ _tag: "Config", action: "get-key" }));

const configUnsetKey = Command.make("unset-key", {}, () => runConfigCommand({ _tag: "Config", action: "unset-key" }));

const configPath = Command.make("path", {}, () => runConfigCommand({ _tag: "Config", action: "path" }));

const config = Command.make("config").pipe(
  Command.withSubcommands([configSetKey, configGetKey, configUnsetKey, configPath]),
);

const searchMode = Options.choice("mode", ["one-shot", "agentic"] as const).pipe(
  Options.withDefault("one-shot" as const),
);

const searchObjective = Options.text("objective").pipe(Options.optional);

const searchQuery = Options.text("query").pipe(Options.optional);

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
  args: Args.text({ name: "objective" }).pipe(Args.optional),
  options: {
    mode: searchMode,
    objective: searchObjective,
    query: searchQuery,
    maxResults: searchMaxResults,
    excerptChars: searchExcerptChars,
    concurrency: searchConcurrency,
    format: searchFormat,
    pretty: searchPretty,
    stdin: searchStdin,
  },
}, ({ args, options }) => {
  const objectives: string[] = [];
  if (Option.isSome(args)) objectives.push(args.value);
  if (Option.isSome(options.objective)) objectives.push(options.objective.value);
  const queries: string[] = [];
  if (Option.isSome(options.query)) queries.push(options.query.value);

  return runSearchCommand({
    objectives,
    stdin: options.stdin,
    mode: options.mode,
    queries,
    maxResults: options.maxResults,
    excerptChars: options.excerptChars,
    concurrency: options.concurrency,
    format: options.format,
    pretty: options.pretty,
  });
});

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
  args: Args.text({ name: "url" }).pipe(Args.repeated),
  options: {
    objective: extractObjective,
    excerpts: extractExcerpts,
    fullContent: extractFullContent,
    concurrency: extractConcurrency,
    format: extractFormat,
    pretty: extractPretty,
    stdin: extractStdin,
  },
}, ({ args, options }) => {
  const urls = Array.fromIterable(args);
  return runExtractCommand({
    urls,
    stdin: options.stdin,
    objective: Option.isSome(options.objective) ? Option.some(options.objective.value) : Option.none(),
    excerpts: options.excerpts,
    fullContent: options.fullContent,
    concurrency: options.concurrency,
    format: options.format,
    pretty: options.pretty,
  });
});

export const parallel = Command.make("parallel").pipe(
  Command.withSubcommands([config, search, extract]),
);
