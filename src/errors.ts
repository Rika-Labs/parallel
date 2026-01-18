export class CliError extends Error {
  readonly _tag = "CliError";
}

export class ConfigError extends Error {
  readonly _tag = "ConfigError";
}

export class ApiError extends Error {
  readonly _tag = "ApiError";
  constructor(
    message: string,
    readonly status: number | undefined,
    readonly body: unknown,
  ) {
    super(message);
  }
}

export class TimeoutError extends Error {
  readonly _tag = "TimeoutError";
}
