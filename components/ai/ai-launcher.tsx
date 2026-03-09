"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";

export function AILauncher() {
  const { t } = useLocale();

  return (
    <Link className={cn(buttonVariants({ variant: "default" }))} href="/chat">
      <MessageSquareText className="h-4 w-4" />
      {t("topbar.aiWorkspace")}
    </Link>
  );
}
