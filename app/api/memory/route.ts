/**
 * Memory API - CRUD operations for long-term memory
 */

import { NextRequest, NextResponse } from "next/server";
import {
  memoryManager,
  contextBuilder,
  type MemoryEntry,
} from "@/lib/memory/memory-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/memory - List memories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const type = (searchParams.get("type") ?? undefined) as MemoryEntry["type"] | undefined;
    const category = (searchParams.get("category") ?? undefined) as MemoryEntry["category"] | undefined;
    const query = searchParams.get("q");
    const stats = searchParams.get("stats");

    // Return stats
    if (stats === "true") {
      const statsData = memoryManager.getStats();
      return NextResponse.json(statsData);
    }

    // Search
    if (query) {
      const results = memoryManager.search(query);
      return NextResponse.json({ results });
    }

    // Get by key
    if (key) {
      const entry = memoryManager.get(key);
      if (!entry) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(entry);
    }

    // List all (with filters)
    const entries = memoryManager.getAll({ type, category });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[Memory API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST /api/memory - Create memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const entry = memoryManager.add({
      type: body.type || "long_term",
      category: body.category || "fact",
      key: body.key,
      value: body.value,
      validFrom: body.validFrom || new Date().toISOString(),
      validUntil: body.validUntil || null,
      confidence: body.confidence || 100,
      source: body.source || "user",
      tags: body.tags || [],
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("[Memory API] Error creating:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PUT /api/memory - Update memory
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updated = memoryManager.update(id, updates);
    
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Memory API] Error updating:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE /api/memory - Delete memory
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const deleted = memoryManager.delete(id);
    
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Memory API] Error deleting:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
