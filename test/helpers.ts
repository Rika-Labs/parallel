import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const TEST_CONFIG_DIR = path.join(os.tmpdir(), "parallel-test-config-" + process.pid);

export function getTestConfigDir(): string {
  return TEST_CONFIG_DIR;
}

export async function setupTestEnv(): Promise<void> {
  process.env.PARALLEL_TEST_CONFIG_DIR = TEST_CONFIG_DIR;
  await fs.mkdir(TEST_CONFIG_DIR, { recursive: true });
}

export async function cleanupTestEnv(): Promise<void> {
  delete process.env.PARALLEL_TEST_CONFIG_DIR;
  try {
    await fs.rm(TEST_CONFIG_DIR, { recursive: true, force: true });
  } catch {}
}
