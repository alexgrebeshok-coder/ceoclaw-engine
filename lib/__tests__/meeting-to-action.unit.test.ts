import assert from "node:assert/strict";

import { getAgentById } from "@/lib/ai/agents";
import type { AIContextSnapshot, AIRunInput, AIRunRecord } from "@/lib/ai/types";
import {
  buildMeetingRunBlueprints,
  createMeetingToActionPacket,
} from "@/lib/meetings/meeting-to-action";

const context: AIContextSnapshot = {
  locale: "ru",
  interfaceLocale: "ru",
  generatedAt: "2026-03-11T00:00:00.000Z",
  activeContext: {
    type: "project",
    pathname: "/projects/p6",
    title: "Реконструкция офисного здания",
    subtitle: "Meeting-to-action intake",
    projectId: "p6",
  },
  projects: [
    {
      id: "p6",
      name: "Реконструкция офисного здания",
      description: "Капремонт и модернизация инженерных систем.",
      status: "at-risk",
      progress: 22,
      direction: "construction",
      budget: { planned: 12000000, actual: 4200000, currency: "RUB" },
      dates: { start: "2025-09-01", end: "2026-08-31" },
      nextMilestone: { name: "Замена оконных блоков", date: "2026-04-10" },
      team: ["Мария К.", "Анна Л."],
      risks: 7,
      location: "Новосибирск",
      priority: "critical",
      health: 42,
      objectives: [],
      materials: 35,
      laborProductivity: 58,
      safety: { ltifr: 0.5, trir: 1.8 },
      history: [],
    },
  ],
  tasks: [],
  team: [],
  risks: [],
  notifications: [],
  project: {
    id: "p6",
    name: "Реконструкция офисного здания",
    description: "Капремонт и модернизация инженерных систем.",
    status: "at-risk",
    progress: 22,
    direction: "construction",
    budget: { planned: 12000000, actual: 4200000, currency: "RUB" },
    dates: { start: "2025-09-01", end: "2026-08-31" },
    nextMilestone: { name: "Замена оконных блоков", date: "2026-04-10" },
    team: ["Мария К.", "Анна Л."],
    risks: 7,
    location: "Новосибирск",
    priority: "critical",
    health: 42,
    objectives: [],
    materials: 35,
    laborProductivity: 58,
    safety: { ltifr: 0.5, trir: 1.8 },
    history: [],
  },
  projectTasks: [],
};

function testBlueprintsStayPurposeScoped() {
  const blueprints = buildMeetingRunBlueprints(context, {
    projectId: "p6",
    title: "Weekly sync",
    notes:
      "Поставщик сдвигает поставку на 5 дней. Нужно обновить график и проверить резерв бюджета.",
    participants: ["PM", "снабжение"],
    locale: "ru",
  });

  assert.equal(blueprints.length, 3);
  assert.equal(blueprints[0]?.purpose, "tasks");
  assert.equal(blueprints[0]?.input.agent.id, "execution-planner");
  assert.match(blueprints[0]?.input.prompt ?? "", /Create concrete follow-up tasks/);
  assert.equal(blueprints[1]?.purpose, "risks");
  assert.equal(blueprints[1]?.input.agent.id, "risk-researcher");
  assert.match(blueprints[1]?.input.prompt ?? "", /Identify project risks and blockers/);
  assert.equal(blueprints[2]?.purpose, "status");
  assert.equal(blueprints[2]?.input.agent.id, "meeting-notes");
  assert.match(blueprints[2]?.input.prompt ?? "", /Draft a concise status report/);
}

async function testPacketCreatesThreeRuns() {
  const capturedInputs: AIRunInput[] = [];

  const packet = await createMeetingToActionPacket(
    {
      projectId: "p6",
      title: "Weekly sync",
      notes:
        "Поставщик сдвигает поставку на 5 дней. Нужно обновить график и проверить резерв бюджета.",
      participants: ["PM", "снабжение"],
      locale: "ru",
      interfaceLocale: "ru",
    },
    {
      now: () => new Date("2026-03-11T08:00:00.000Z"),
      packetIdFactory: () => "meeting-packet-test",
      loadContext: async () => context,
      createRun: async (input) => {
        capturedInputs.push(input);
        const agent = getAgentById(input.agent.id);
        const now = "2026-03-11T08:00:00.000Z";

        return {
          id: `run-${capturedInputs.length}`,
          agentId: input.agent.id,
          title: agent?.id ?? input.agent.id,
          prompt: input.prompt,
          status: "queued",
          createdAt: now,
          updatedAt: now,
          context: input.context.activeContext,
        } satisfies AIRunRecord;
      },
    }
  );

  assert.equal(packet.packetId, "meeting-packet-test");
  assert.equal(packet.projectId, "p6");
  assert.equal(packet.runs.length, 3);
  assert.deepEqual(
    packet.runs.map((entry) => entry.purpose),
    ["tasks", "risks", "status"]
  );
  assert.equal(capturedInputs.length, 3);
  assert.equal(packet.noteStats.lines, 1);
}

async function main() {
  testBlueprintsStayPurposeScoped();
  await testPacketCreatesThreeRuns();
  console.log("PASS meeting-to-action.unit");
}

void main();
