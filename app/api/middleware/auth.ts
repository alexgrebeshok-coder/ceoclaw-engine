import { NextRequest, NextResponse } from "next/server";

import { readServerAccessProfile } from "@/lib/auth/server-auth";
import {
  canAccessWorkspace,
  hasPermission,
  resolveAccessibleWorkspace,
  type PlatformPermission,
  type PlatformWorkspaceId,
} from "@/lib/policy/access";
import { jsonError } from "@/lib/server/api-utils";

const DEFAULT_API_KEY = process.env.DASHBOARD_API_KEY || "dev-key-12345";

export interface AuthorizedRequestContext {
  accessProfile: ReturnType<typeof readServerAccessProfile>;
  workspace: ReturnType<typeof resolveAccessibleWorkspace>;
}

interface AuthorizeRequestOptions {
  apiKey?: string | null;
  permission?: PlatformPermission;
  requireApiKey?: boolean;
  workspaceId?: PlatformWorkspaceId;
}

export function authorizeRequest(
  request: NextRequest,
  options: AuthorizeRequestOptions = {}
): AuthorizedRequestContext | NextResponse {
  const accessProfile = readServerAccessProfile(request);

  if (options.requireApiKey) {
    const expectedApiKey = options.apiKey ?? DEFAULT_API_KEY;
    const authorization = request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return jsonError(401, "UNAUTHORIZED", "Bearer token is required.");
    }

    const token = authorization.replace("Bearer ", "");
    if (token !== expectedApiKey) {
      return jsonError(403, "INVALID_API_KEY", "Provided bearer token is invalid.");
    }
  }

  if (options.workspaceId && !canAccessWorkspace(accessProfile.role, options.workspaceId)) {
    return jsonError(
      403,
      "WORKSPACE_FORBIDDEN",
      `Role ${accessProfile.role} cannot access workspace ${options.workspaceId}.`
    );
  }

  if (options.permission && !hasPermission(accessProfile.role, options.permission)) {
    return jsonError(
      403,
      "PERMISSION_DENIED",
      `Role ${accessProfile.role} does not have permission ${options.permission}.`
    );
  }

  const workspace = resolveAccessibleWorkspace(
    accessProfile.role,
    options.workspaceId ?? accessProfile.workspaceId
  );

  return {
    accessProfile: { ...accessProfile, workspaceId: workspace.id },
    workspace,
  };
}

export function withAuth(
  req: NextRequest,
  _res: NextResponse,
  next: () => void
) {
  const result = authorizeRequest(req, { requireApiKey: true });
  if (result instanceof NextResponse) {
    return result;
  }

  next();
}
