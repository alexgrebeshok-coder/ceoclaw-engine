#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

TEST_FILES=()
while IFS= read -r test_file; do
  TEST_FILES+=("$test_file")
done < <(find "lib/__tests__" -name "*.unit.test.ts" -type f | sort)

if [ "${#TEST_FILES[@]}" -eq 0 ]; then
  echo "No unit tests found"
  exit 1
fi

for test_file in "${TEST_FILES[@]}"; do
  echo "RUN  ${test_file}"
  npx tsx "${test_file}"
done

echo "OK   unit tests passed"
