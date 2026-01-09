---
name: parallel
description: Search the web and extract content from URLs using semantic search. Use when the user needs to research topics, find information online, get current news, or extract content from web pages.
---

# Parallel CLI

Semantic web search and content extraction tool.

## When to Use

- User asks to research or look up information
- User needs current/recent information
- User wants to extract content from a URL
- User asks "what is", "find", "search for", "look up"

## Commands

### Search

```bash
# Basic search
parallel search --query "your question" --format text --pretty

# Complex research (agentic mode)
parallel search --query "compare X vs Y" --mode agentic --format text --pretty

# Multiple queries
parallel search --query "topic 1" --query "topic 2" --format text
```

### Extract

```bash
# Extract from URL
parallel extract --url https://example.com --format text --pretty

# With specific objective
parallel extract --url https://example.com --objective "find pricing info" --format text
```

## Options

- `--format text` - Human readable output (recommended for agents)
- `--format json` - Structured output
- `--pretty` - Pretty print
- `--mode agentic` - Multi-step reasoning for complex queries
- `--max-results N` - Number of results (default: 10)
- `--objective "..."` - Specific extraction goal

## Examples

```bash
# Research a topic
parallel search --query "Effect TS error handling patterns" --format text --pretty

# Get latest news
parallel search --query "latest NBA news January 2026" --mode agentic --format text

# Extract documentation
parallel extract --url https://docs.example.com/api --objective "find authentication methods" --format text
```

## Tips

- Use `--format text` for readable output
- Use `--mode agentic` for complex, multi-faceted questions
- Use `--objective` with extract to focus on specific content
- Combine with other tools to process results
