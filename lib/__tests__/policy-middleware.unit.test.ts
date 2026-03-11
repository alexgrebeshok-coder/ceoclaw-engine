import assert from "node:assert/strict";

import { NextRequest } from "next/server";

import { authorizeRequest } from "@/app/api/middleware/auth";

function createRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

function testPermissionDenial() {
  const request = createRequest("http://localhost/api/briefs/portfolio", {
    headers: {
      "x-ceoclaw-role": "MEMBER",
    },
  });

  const result = authorizeRequest(request, {
    permission: "VIEW_EXECUTIVE_BRIEFS",
    workspaceId: "executive",
  });

  assert.equal(result instanceof Response, true);
  if (result instanceof Response) {
    assert.equal(result.status, 403);
  }
}

function testWorkspaceAndProfileResolution() {
  const request = createRequest("http://localhost/api/work-reports?workspaceId=delivery", {
    headers: {
      "x-ceoclaw-role": "OPS",
      "x-ceoclaw-user-id": "ops-1",
      "x-ceoclaw-user-name": "Ops Reviewer",
    },
  });

  const result = authorizeRequest(request, {
    permission: "REVIEW_WORK_REPORTS",
    workspaceId: "delivery",
  });

  assert.equal(result instanceof Response, false);
  if (!(result instanceof Response)) {
    assert.equal(result.accessProfile.userId, "ops-1");
    assert.equal(result.accessProfile.role, "OPS");
    assert.equal(result.workspace.id, "delivery");
  }
}

function testApiKeyRequirement() {
  const request = createRequest("http://localhost/api/notifications/check-due-dates", {
    method: "POST",
    headers: {
      authorization: "Bearer cron-token",
      "x-ceoclaw-role": "PM",
    },
  });

  const result = authorizeRequest(request, {
    apiKey: "cron-token",
    permission: "RUN_DUE_DATE_SCAN",
    requireApiKey: true,
    workspaceId: "executive",
  });

  assert.equal(result instanceof Response, false);
}

function main() {
  testPermissionDenial();
  testWorkspaceAndProfileResolution();
  testApiKeyRequirement();
  console.log("PASS policy-middleware.unit");
}

main();
