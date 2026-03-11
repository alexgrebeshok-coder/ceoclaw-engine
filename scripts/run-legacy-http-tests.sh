#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Legacy HTTP tests require a running app on http://localhost:3000"
echo "These scripts are smoke/integration checks, not hermetic unit tests."

TEST_FILES=(
  "lib/__tests__/analytics.test.ts"
  "lib/__tests__/analytics-ui.test.ts"
  "lib/__tests__/calendar.test.ts"
  "lib/__tests__/calendar-ui.test.ts"
  "lib/__tests__/gantt.test.ts"
  "lib/__tests__/kanban-api.test.ts"
  "lib/__tests__/kanban-ui.test.ts"
  "lib/__tests__/notifications.test.ts"
  "lib/__tests__/notify.test.ts"
  "lib/__tests__/predictions.test.ts"
  "lib/__tests__/task-dependencies.test.ts"
  "lib/__tests__/telegram-webhook.test.ts"
  "lib/__tests__/time-reports.test.ts"
  "lib/__tests__/time-tracking.test.ts"
  "lib/__tests__/ui-polish.test.ts"
)

for test_file in "${TEST_FILES[@]}"; do
  echo "RUN  ${test_file}"
  npx tsx "${test_file}"
done

echo "DONE legacy HTTP tests"
