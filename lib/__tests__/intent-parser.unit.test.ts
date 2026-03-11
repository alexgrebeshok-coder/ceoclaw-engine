import assert from "node:assert/strict";

import { parseCommand } from "../intent-parser";

const createTask = parseCommand("Добавь задачу в ЧЭМК — согласовать СП");
assert.equal(createTask.intent, "createTask");
assert.equal(createTask.entities.project, "чэмк");
assert.equal(createTask.entities.task, "согласовать сп");

const listProjects = parseCommand("Покажи список проектов");
assert.equal(listProjects.intent, "listProjects");

const showStatus = parseCommand("Статус ЧЭМК");
assert.equal(showStatus.intent, "showStatus");
assert.equal(showStatus.entities.project, "чэмк");

const conversationalStatus = parseCommand("Как дела ЧЭМК");
assert.equal(conversationalStatus.intent, "showStatus");
assert.equal(conversationalStatus.entities.project, "чэмк");

console.log("PASS intent-parser.unit");
