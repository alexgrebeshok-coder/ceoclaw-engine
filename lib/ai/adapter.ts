import { createGatewayAIAdapter } from "@/lib/ai/gateway-adapter";
import { createMockAIAdapter } from "@/lib/ai/mock-adapter";
import type { AIAdapter, AIAdapterMode } from "@/lib/ai/types";

export function createAIAdapter(mode: AIAdapterMode): AIAdapter {
  if (mode === "gateway") {
    return createGatewayAIAdapter();
  }

  return createMockAIAdapter();
}
