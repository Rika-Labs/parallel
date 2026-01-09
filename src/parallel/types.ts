export interface SearchRequest {
  mode?: "one-shot" | "agentic";
  objective?: string;
  search_queries?: string[];
  max_results?: number;
  excerpts?: {
    max_chars_per_result?: number;
  };
}

export interface SearchResponse {
  search_id: string;
  results: Array<{
    url: string;
    title: string;
    excerpts: string[];
  }>;
  warnings?: Array<{
    type: string;
    message: string;
  }>;
  usage?: Array<{
    name: string;
    count: number;
  }>;
}

export interface ExtractRequest {
  urls: string[];
  objective?: string;
  excerpts?: boolean;
  full_content?: boolean;
}

export interface ExtractResponse {
  extract_id: string;
  results: Array<{
    url: string;
    title: string;
    publish_date?: string;
    excerpts?: string[];
    full_content?: string;
  }>;
  errors?: Array<{
    url: string;
    message: string;
  }>;
  warnings?: Array<{
    type: string;
    message: string;
  }>;
  usage?: Array<{
    name: string;
    count: number;
  }>;
}
