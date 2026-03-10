import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tasks/[id]/reschedule — Auto-reschedule dependent tasks
 * 
 * Called when a task's due date changes
 * Recursively updates all dependent tasks based on dependency type
 */

interface RescheduleResult {
  taskId: string;
  taskTitle: string;
  oldDueDate: Date;
  newDueDate: Date;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newDueDate } = body;

    if (!newDueDate) {
      return NextResponse.json(
        { error: "newDueDate is required" },
        { status: 400 }
      );
    }

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, title: true, dueDate: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Find all tasks that depend on this task
    const dependents = await prisma.taskDependency.findMany({
      where: { dependsOnTaskId: id },
      include: {
        task: {
          select: { id: true, title: true, dueDate: true },
        },
      },
    });

    const results: RescheduleResult[] = [];
    const newDate = new Date(newDueDate);

    // Reschedule each dependent task
    for (const dep of dependents) {
      const dependentTask = dep.task;
      const oldDueDate = dependentTask.dueDate;

      // Calculate new due date based on dependency type
      let updatedDueDate: Date;

      switch (dep.type) {
        case "FINISH_TO_START":
          // Dependent task starts after this task finishes
          // Set due date to at least the new finish date
          if (oldDueDate < newDate) {
            updatedDueDate = newDate;
          } else {
            continue; // No update needed
          }
          break;

        case "START_TO_START":
          // Both tasks should start around the same time
          updatedDueDate = newDate;
          break;

        default:
          continue; // Skip unsupported types
      }

      // Update task
      await prisma.task.update({
        where: { id: dependentTask.id },
        data: { dueDate: updatedDueDate },
      });

      results.push({
        taskId: dependentTask.id,
        taskTitle: dependentTask.title,
        oldDueDate,
        newDueDate: updatedDueDate,
      });

      // Recursively reschedule tasks that depend on this one
      const recursiveResults = await rescheduleRecursive(
        dependentTask.id,
        updatedDueDate
      );
      results.push(...recursiveResults);
    }

    return NextResponse.json({
      rescheduledCount: results.length,
      tasks: results,
    });
  } catch (error) {
    console.error("[Reschedule API] Error:", error);
    return NextResponse.json(
      { error: "Failed to reschedule tasks" },
      { status: 500 }
    );
  }
}

/**
 * Recursively reschedule dependent tasks
 */
async function rescheduleRecursive(
  taskId: string,
  newDueDate: Date
): Promise<RescheduleResult[]> {
  const results: RescheduleResult[] = [];

  const dependents = await prisma.taskDependency.findMany({
    where: { dependsOnTaskId: taskId },
    include: {
      task: {
        select: { id: true, title: true, dueDate: true },
      },
    },
  });

  for (const dep of dependents) {
    const dependentTask = dep.task;
    const oldDueDate = dependentTask.dueDate;

    if (dep.type === "FINISH_TO_START" && oldDueDate < newDueDate) {
      await prisma.task.update({
        where: { id: dependentTask.id },
        data: { dueDate: newDueDate },
      });

      results.push({
        taskId: dependentTask.id,
        taskTitle: dependentTask.title,
        oldDueDate,
        newDueDate,
      });

      // Continue recursion
      const recursiveResults = await rescheduleRecursive(
        dependentTask.id,
        newDueDate
      );
      results.push(...recursiveResults);
    }
  }

  return results;
}
