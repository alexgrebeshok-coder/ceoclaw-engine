import { TelegramBriefPolicyPanel } from "@/components/briefs/telegram-brief-policy-panel";
import { TelegramBriefDeliveryPanel } from "@/components/briefs/telegram-brief-delivery-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioBrief, ProjectBrief } from "@/lib/briefs/types";

export function BriefRequestForm({
  portfolioBrief,
  projectBrief,
  projectOptions,
}: {
  portfolioBrief: PortfolioBrief;
  projectBrief: ProjectBrief | null;
  projectOptions: Array<{ id: string; name: string }>;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Delivery preview</CardTitle>
        <CardDescription>
          Форматы вывода, которые уже генерирует brief engine: dashboard highlights, Telegram digest и email body.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--panel-soft)] p-4">
          <div className="text-sm font-medium text-[var(--ink)]">Portfolio dashboard card</div>
          <div className="mt-2 text-sm text-[var(--ink-soft)]">
            {portfolioBrief.formats.dashboardCard.summary}
          </div>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--ink-muted)]">
            {portfolioBrief.formats.dashboardCard.highlights.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--panel-soft)] p-4">
          <div className="text-sm font-medium text-[var(--ink)]">Portfolio telegram digest</div>
          <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[var(--ink-soft)]">
            {portfolioBrief.formats.telegramDigest}
          </pre>
          <TelegramBriefDeliveryPanel projectOptions={projectOptions} />
          <TelegramBriefPolicyPanel projectOptions={projectOptions} />
        </div>

        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--panel-soft)] p-4">
          <div className="text-sm font-medium text-[var(--ink)]">Project email preview</div>
          {projectBrief ? (
            <>
              <div className="mt-2 text-sm text-[var(--ink-soft)]">
                {projectBrief.formats.emailDigest.subject}
              </div>
              <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[var(--ink-muted)]">
                {projectBrief.formats.emailDigest.body}
              </pre>
            </>
          ) : (
            <div className="mt-2 text-sm text-[var(--ink-soft)]">
              Пока нет проекта, для которого можно собрать project brief.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
