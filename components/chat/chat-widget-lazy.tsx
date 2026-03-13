"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Loading fallback - just the button
function ChatWidgetLoading() {
  return (
    <Button
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      size="icon"
      disabled
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}

// Dynamic import of the chat widget
const ChatWidget = React.lazy(() =>
  import("./chat-widget").then((mod) => ({
    default: mod.ChatWidget,
  }))
);

/**
 * Lazy-loaded ChatWidget with Suspense
 * Reduces initial bundle by deferring chat code
 */
export function ChatWidgetLazy() {
  return (
    <Suspense fallback={<ChatWidgetLoading />}>
      <ChatWidget />
    </Suspense>
  );
}
