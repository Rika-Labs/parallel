export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // New feature (minor release)
        "fix",      // Bug fix (patch release)
        "docs",     // Documentation only
        "style",    // Code style (formatting, etc)
        "refactor", // Code refactor (no feature/fix)
        "perf",     // Performance improvement
        "test",     // Adding/updating tests
        "build",    // Build system or dependencies
        "ci",       // CI configuration
        "chore",    // Maintenance tasks
        "revert",   // Revert a commit
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "header-max-length": [2, "always", 100],
  },
};
