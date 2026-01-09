import type { ExtractResponse, SearchResponse } from "../parallel/types.js";

export function formatSearchResponse(response: SearchResponse, format: "json" | "text", pretty: boolean): string {
  if (format === "json") {
    return JSON.stringify(response, null, pretty ? 2 : 0);
  }

  const lines: string[] = [];
  lines.push(`Search ID: ${response.search_id}`);
  lines.push(`Results: ${response.results.length}`);
  lines.push("");

  for (const result of response.results) {
    lines.push(`Title: ${result.title}`);
    lines.push(`URL: ${result.url}`);
    if (result.excerpts.length > 0) {
      lines.push(`Excerpts:`);
      for (const excerpt of result.excerpts) {
        lines.push(`  ${excerpt.substring(0, 200)}...`);
      }
    }
    lines.push("");
  }

  if (response.warnings && response.warnings.length > 0) {
    lines.push("Warnings:");
    for (const warning of response.warnings) {
      lines.push(`  ${warning.type}: ${warning.message}`);
    }
  }

  return lines.join("\n");
}

export function formatExtractResponse(response: ExtractResponse, format: "json" | "text", pretty: boolean): string {
  if (format === "json") {
    return JSON.stringify(response, null, pretty ? 2 : 0);
  }

  const lines: string[] = [];
  lines.push(`Extract ID: ${response.extract_id}`);
  lines.push(`Results: ${response.results.length}`);
  lines.push("");

  for (const result of response.results) {
    lines.push(`Title: ${result.title}`);
    lines.push(`URL: ${result.url}`);
    if (result.publish_date) {
      lines.push(`Published: ${result.publish_date}`);
    }
    if (result.excerpts && result.excerpts.length > 0) {
      lines.push(`Excerpts:`);
      for (const excerpt of result.excerpts) {
        lines.push(`  ${excerpt.substring(0, 200)}...`);
      }
    }
    if (result.full_content) {
      lines.push(`Full Content: ${result.full_content.length} characters`);
    }
    lines.push("");
  }

  if (response.errors && response.errors.length > 0) {
    lines.push("Errors:");
    for (const error of response.errors) {
      lines.push(`  ${error.url}: ${error.message}`);
    }
  }

  if (response.warnings && response.warnings.length > 0) {
    lines.push("Warnings:");
    for (const warning of response.warnings) {
      lines.push(`  ${warning.type}: ${warning.message}`);
    }
  }

  return lines.join("\n");
}
