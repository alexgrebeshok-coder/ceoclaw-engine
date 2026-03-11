import assert from "node:assert/strict";

import { isForecastOverdue } from "@/lib/analytics/predictions";

function testCompletedProjectIsNotOverdue() {
  assert.equal(
    isForecastOverdue(
      "2026-03-11T00:00:00.000Z",
      "2026-01-01T00:00:00.000Z",
      100
    ),
    false
  );
}

function testDelayedForecastIsOverdue() {
  assert.equal(
    isForecastOverdue(
      "2026-04-15T00:00:00.000Z",
      "2026-04-01T00:00:00.000Z",
      62
    ),
    true
  );
}

function main() {
  testCompletedProjectIsNotOverdue();
  testDelayedForecastIsOverdue();
  console.log("PASS predictions-helpers.unit");
}

main();
