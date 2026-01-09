#!/usr/bin/env bun
import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { parallel } from "./cli/commands.js";

const cli = Command.run(parallel, {
  name: "parallel",
  version: "0.1.0",
});

const program = cli(process.argv).pipe(Effect.provide(BunContext.layer));

BunRuntime.runMain(program);
