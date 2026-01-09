import os from "node:os";
import path from "node:path";

export function configFilePath(appName: string): string {
  const testConfigDir = process.env.PARALLEL_TEST_CONFIG_DIR;
  if (testConfigDir && testConfigDir.trim().length > 0) {
    return path.join(testConfigDir, "config.json");
  }
  const home = os.homedir();
  if (process.platform === "darwin") {
    return path.join(home, "Library", "Application Support", appName, "config.json");
  }
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg && xdg.trim().length > 0) return path.join(xdg, appName, "config.json");
  return path.join(home, ".config", appName, "config.json");
}

