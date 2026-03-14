"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Mic, Paperclip, SendHorizonal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useAIWorkspace } from "@/contexts/ai-context";
import { useLocale } from "@/contexts/locale-context";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const composerHelpId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { activeContext, isSubmitting, submitPrompt } = useAIWorkspace();
  const { t } = useLocale();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [message]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const nextMessage = message;
    setMessage("");
    await submitPrompt(nextMessage);
  };

  return (
    <div className="border-t border-[color:var(--line-strong)] bg-[color:var(--surface-panel)] px-4 py-4 sm:px-6">
      <div className="mx-auto flex min-w-0 w-full max-w-5xl items-end gap-3">
        <div className="relative">
          <Button
            aria-label={t("chat.input.attach")}
            onClick={() =>
              toast.info("📎 Attachments coming soon", {
                description: "File upload will be available in the next release. For now, paste text directly.",
              })
            }
            size="icon"
            type="button"
            variant="secondary"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
            SOON
          </span>
        </div>

        <div className="min-w-0 flex-1 rounded-[14px] border border-[var(--line-strong)] bg-[color:var(--surface-panel-strong)] px-3 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
          <Textarea
            aria-describedby={composerHelpId}
            aria-label={t("chat.input.send")}
            className="min-h-[44px] max-h-[220px] resize-none border-none bg-transparent px-2 py-1 shadow-none focus:border-none focus:ring-0"
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setMessage("");
                return;
              }

              if (
                (event.metaKey || event.ctrlKey) &&
                (event.key === "Enter" || event.code === "Enter")
              ) {
                event.preventDefault();
                void handleSubmit();
                return;
              }

              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder={t("chat.input.placeholder", { context: activeContext.title })}
            ref={textareaRef}
            rows={1}
            value={message}
          />
          <p className="px-2 pt-2 text-[11px] text-[var(--ink-muted)]" id={composerHelpId}>
            {t("chat.input.shortcuts")}
          </p>
        </div>

        <div className="relative">
          <Button
            aria-label={t("chat.input.voice")}
            onClick={() =>
              toast.info("🎤 Voice input coming soon", {
                description: "Voice recording will be available in the next release. For now, type your message.",
              })
            }
            size="icon"
            type="button"
            variant="secondary"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
            SOON
          </span>
        </div>

        <Button
          aria-label={t("chat.input.send")}
          disabled={isSubmitting || !message.trim()}
          onClick={() => void handleSubmit()}
          size="icon"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
