import { Effect } from "effect";
import { CliError, ConfigError } from "../errors.js";
import { getConfigPath, loadConfigFile, removeConfigFile, resolveApiKey, saveConfigFile } from "../config/config.js";

export type ConfigCommandAction = "set-key" | "get-key" | "unset-key" | "path";

export interface ConfigCommand {
  _tag: "Config";
  action: ConfigCommandAction;
  key?: string;
}

export function runConfigCommand(cmd: ConfigCommand): Effect.Effect<void, CliError | ConfigError> {
  return Effect.gen(function* () {
    if (cmd.action === "path") {
      process.stdout.write(`${getConfigPath()}\n`);
      return;
    }
    if (cmd.action === "set-key") {
      const file = yield* saveConfigFile({ apiKey: cmd.key });
      process.stdout.write(`${file}\n`);
      return;
    }
    if (cmd.action === "unset-key") {
      const file = yield* removeConfigFile;
      process.stdout.write(`${file}\n`);
      return;
    }
    if (cmd.action === "get-key") {
      const config = yield* Effect.catchAll(loadConfigFile, () => Effect.succeed({}));
      const key = resolveApiKey(config);
      if (!key) throw new CliError("No API key set. Use PARALLEL_API_KEY or parallel config set-key <key>");
      process.stdout.write(`${key}\n`);
      return;
    }
  });
}

