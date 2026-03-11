import assert from "node:assert/strict";

import { executeCommand } from "../command-handler";

const stubProject = {
  id: "project-1",
  name: "ЧЭМК",
  progress: 55,
  status: "active",
  budget: { planned: 1000, actual: 250 },
  dates: { start: "2026-03-01", end: "2026-03-30" },
};

const stubClient = {
  async findProjectByName(name: string) {
    if (name.toLowerCase() === "чэмк") return stubProject;
    return null;
  },
  async listProjects() {
    return [stubProject];
  },
  async createTask(input: { title: string; projectId: string }) {
    return { id: "task-1", ...input };
  },
  async listTasks() {
    return [
      { id: "t1", status: "done" },
      { id: "t2", status: "todo" },
    ];
  },
};

async function run() {
  const listProjects = await executeCommand("Покажи список проектов", stubClient);
  assert.equal(listProjects.success, true);
  assert.match(listProjects.message, /ЧЭМК/u);

  const createTask = await executeCommand(
    "Добавь задачу в ЧЭМК — согласовать СП",
    stubClient
  );
  assert.equal(createTask.success, true);
  assert.match(createTask.message, /согласовать сп/u);

  const showStatus = await executeCommand("Статус ЧЭМК", stubClient);
  assert.equal(showStatus.success, true);
  assert.match(showStatus.message, /Прогресс: 55%/u);
  assert.match(showStatus.message, /Задачи: 1\/2/u);

  const unknown = await executeCommand("Какая погода", stubClient);
  assert.equal(unknown.success, false);
  assert.match(unknown.message, /Не понял команду/u);

  console.log("PASS command-handler.unit");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
