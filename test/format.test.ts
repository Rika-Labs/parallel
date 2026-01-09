import { describe, expect, test } from "bun:test";
import { formatSearchResponse, formatExtractResponse } from "../src/output/format.js";
import type { SearchResponse, ExtractResponse } from "../src/parallel/types.js";

describe("format", () => {
  const mockSearchResponse: SearchResponse = {
    search_id: "test-id",
    results: [
      {
        url: "https://example.com",
        title: "Example",
        excerpts: ["Excerpt 1", "Excerpt 2"],
      },
    ],
    warnings: [{ type: "test-warning", message: "warning message" }],
  };

  const mockExtractResponse: ExtractResponse = {
    extract_id: "test-id",
    results: [
      {
        url: "https://example.com",
        title: "Example",
        publish_date: "2024-01-01",
        excerpts: ["Excerpt 1"],
        full_content: "Full content here",
      },
    ],
    errors: [{ url: "https://error.com", message: "error message" }],
    warnings: [{ type: "test-warning", message: "warning message" }],
  };

  test("formatSearchResponse json", () => {
    const output = formatSearchResponse(mockSearchResponse, "json", false);
    expect(JSON.parse(output)).toEqual(mockSearchResponse);
  });

  test("formatSearchResponse json pretty", () => {
    const output = formatSearchResponse(mockSearchResponse, "json", true);
    expect(output).toContain("  ");
    expect(JSON.parse(output)).toEqual(mockSearchResponse);
  });

  test("formatSearchResponse text", () => {
    const output = formatSearchResponse(mockSearchResponse, "text", false);
    expect(output).toContain("Search ID: test-id");
    expect(output).toContain("URL: https://example.com");
    expect(output).toContain("Excerpt 1");
    expect(output).toContain("Excerpt 2");
    expect(output).toContain("test-warning");
  });

  test("formatSearchResponse text shows full excerpts", () => {
    const longExcerpt = "A".repeat(500);
    const response: SearchResponse = {
      search_id: "test-id",
      results: [{ url: "https://example.com", title: "Example", excerpts: [longExcerpt] }],
    };
    const output = formatSearchResponse(response, "text", false);
    expect(output).toContain(longExcerpt);
  });

  test("formatExtractResponse json", () => {
    const output = formatExtractResponse(mockExtractResponse, "json", false);
    expect(JSON.parse(output)).toEqual(mockExtractResponse);
  });

  test("formatExtractResponse json pretty", () => {
    const output = formatExtractResponse(mockExtractResponse, "json", true);
    expect(output).toContain("  ");
    expect(JSON.parse(output)).toEqual(mockExtractResponse);
  });

  test("formatExtractResponse text", () => {
    const output = formatExtractResponse(mockExtractResponse, "text", false);
    expect(output).toContain("Extract ID: test-id");
    expect(output).toContain("URL: https://example.com");
    expect(output).toContain("Published: 2024-01-01");
    expect(output).toContain("Full content here");
    expect(output).toContain("error.com: error message");
    expect(output).toContain("test-warning");
  });

  test("formatExtractResponse text shows full content", () => {
    const longContent = "B".repeat(1000);
    const response: ExtractResponse = {
      extract_id: "test-id",
      results: [{ url: "https://example.com", title: "Example", full_content: longContent }],
    };
    const output = formatExtractResponse(response, "text", false);
    expect(output).toContain("Full Content:");
    expect(output).toContain(longContent);
  });

  test("formatExtractResponse text shows full excerpts", () => {
    const longExcerpt = "C".repeat(500);
    const response: ExtractResponse = {
      extract_id: "test-id",
      results: [{ url: "https://example.com", title: "Example", excerpts: [longExcerpt] }],
    };
    const output = formatExtractResponse(response, "text", false);
    expect(output).toContain(longExcerpt);
  });
});
