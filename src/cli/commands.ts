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
  Options.optional,
);

const searchObjective = Options.text("objective").pipe(Options.optional);

const searchQuery = Options.text("query").pipe(Options.optional);

const searchMaxResults = Options.integer("max-results").pipe(
  Options.withDefault(10),
  Options.optional,
);

const searchExcerptChars = Options.integer("excerpt-chars").pipe(
  Options.withDefault(6000),
  Options.optional,
);

const searchConcurrency = Options.integer("concurrency").pipe(
  Options.withDefault(5),
  Options.optional,
);

const searchFormat = Options.choice("format", ["json", "text"] as const).pipe(
  Options.withDefault("json" as const),
  Options.optional,
);

const searchPretty = Options.boolean("pretty").pipe(Options.withDefault(false), Options.optional);

const searchStdin = Options.boolean("stdin").pipe(Options.withDefault(false), Options.optional);

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
    stdin: Option.getOrElse(options.stdin, () => false),
    mode: Option.getOrElse(options.mode, () => "one-shot"),
    queries,
    maxResults: Option.getOrElse(options.maxResults, () => 10),
    excerptChars: Option.getOrElse(options.excerptChars, () => 6000),
    concurrency: Option.getOrElse(options.concurrency, () => 5),
    format: Option.getOrElse(options.format, () => "json"),
    pretty: Option.getOrElse(options.pretty, () => false),
  });
});

const extractObjective = Options.text("objective").pipe(Options.optional);

const extractExcerpts = Options.boolean("excerpts").pipe(Options.withDefault(true), Options.optional);

const extractFullContent = Options.boolean("full-content").pipe(Options.withDefault(false), Options.optional);

const extractConcurrency = Options.integer("concurrency").pipe(
  Options.withDefault(5),
  Options.optional,
);

const extractFormat = Options.choice("format", ["json", "text"] as const).pipe(
  Options.withDefault("json" as const),
  Options.optional,
);

const extractPretty = Options.boolean("pretty").pipe(Options.withDefault(false), Options.optional);

const extractStdin = Options.boolean("stdin").pipe(Options.withDefault(false), Options.optional);

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
  const noExcerpts = Option.isSome(options.excerpts) && !options.excerpts.value;
  return runExtractCommand({
    urls,
    stdin: Option.getOrElse(options.stdin, () => false),
    objective: Option.isSome(options.objective) ? Option.some(options.objective.value) : Option.none(),
    excerpts: !noExcerpts,
    fullContent: Option.getOrElse(options.fullContent, () => false),
    concurrency: Option.getOrElse(options.concurrency, () => 5),
    format: Option.getOrElse(options.format, () => "json"),
    pretty: Option.getOrElse(options.pretty, () => false),
  });
});

export const parallel = Command.make("parallel").pipe(
  Command.withSubcommands([config, search, extract]),
);
