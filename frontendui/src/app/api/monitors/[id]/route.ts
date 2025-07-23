import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { monitors, alertRecipients, incidents, monitorResults } from "@/db/schema";
import { 
  UpdateMonitorSchema, 
  createSuccessResponse, 
  createErrorResponse 
} from "@/types/shared";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/monitors/[id] - Get a specific monitor
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        createErrorResponse("Authentication required"),
        { status: 401 }
      );
    }

    const monitor = await db
      .select()
      .from(monitors)
      .where(
        and(
          eq(monitors.id, id),
          eq(monitors.userId, session.user.id)
        )
      );

    if (monitor.length === 0) {
      return NextResponse.json(
        createErrorResponse("Monitor not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createSuccessResponse(monitor[0])
    );
  } catch (error) {
    console.error("Error fetching monitor:", error);
    return NextResponse.json(
      createErrorResponse("Failed to fetch monitor"),
      { status: 500 }
    );
  }
}

// PUT /api/monitors/[id] - Update a monitor
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        createErrorResponse("Authentication required"),
        { status: 401 }
      );
    }

    // Verify the monitor belongs to the user
    const existingMonitor = await db
      .select()
      .from(monitors)
      .where(
        and(
          eq(monitors.id, id),
          eq(monitors.userId, session.user.id)
        )
      );

    if (existingMonitor.length === 0) {
      return NextResponse.json(
        createErrorResponse("Monitor not found"),
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = UpdateMonitorSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createErrorResponse(
          "Validation failed",
          validationResult.error.issues.map(i => i.message).join(", ")
        ),
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Build update object
    const updateFields: any = {
      updatedAt: new Date(),
    };

    // Only update provided fields
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.url !== undefined) updateFields.url = updateData.url;
    if (updateData.method !== undefined) updateFields.method = updateData.method;
    if (updateData.expectedStatusCodes !== undefined) {
      updateFields.expectedStatusCodes = JSON.stringify(updateData.expectedStatusCodes);
    }
    if (updateData.timeout !== undefined) updateFields.timeout = updateData.timeout;
    if (updateData.interval !== undefined) updateFields.interval = updateData.interval;
    if (updateData.retries !== undefined) updateFields.retries = updateData.retries;
    if (updateData.headers !== undefined) {
      updateFields.headers = updateData.headers ? JSON.stringify(updateData.headers) : null;
    }
    if (updateData.body !== undefined) updateFields.body = updateData.body || null;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;

    // Update the monitor
    const updatedMonitor = await db
      .update(monitors)
      .set(updateFields)
      .where(eq(monitors.id, id))
      .returning();

    // TODO: Add monitor update log entry
    // TODO: If monitoring settings changed, update scheduling

    return NextResponse.json(
      createSuccessResponse(
        updatedMonitor[0],
        "Monitor updated successfully"
      )
    );
  } catch (error) {
    console.error("Error updating monitor:", error);
    return NextResponse.json(
      createErrorResponse("Failed to update monitor"),
      { status: 500 }
    );
  }
}

// DELETE /api/monitors/[id] - Delete a monitor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        createErrorResponse("Authentication required"),
        { status: 401 }
      );
    }

    // Verify the monitor belongs to the user
    const existingMonitor = await db
      .select()
      .from(monitors)
      .where(
        and(
          eq(monitors.id, id),
          eq(monitors.userId, session.user.id)
        )
      );

    if (existingMonitor.length === 0) {
      return NextResponse.json(
        createErrorResponse("Monitor not found"),
        { status: 404 }
      );
    }

    // Soft delete approach - deactivate the monitor
    // This preserves historical data and incidents
    const updatedMonitor = await db
      .update(monitors)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(monitors.id, id))
      .returning();

    // TODO: Add monitor deletion log entry
    // TODO: Cancel any scheduled monitoring jobs
    // TODO: Resolve any open incidents for this monitor

    return NextResponse.json(
      createSuccessResponse(
        updatedMonitor[0],
        "Monitor deleted successfully"
      )
    );
  } catch (error) {
    console.error("Error deleting monitor:", error);
    return NextResponse.json(
      createErrorResponse("Failed to delete monitor"),
      { status: 500 }
    );
  }
}

// PATCH /api/monitors/[id] - Toggle monitor status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        createErrorResponse("Authentication required"),
        { status: 401 }
      );
    }

    // Verify the monitor belongs to the user
    const existingMonitor = await db
      .select()
      .from(monitors)
      .where(
        and(
          eq(monitors.id, id),
          eq(monitors.userId, session.user.id)
        )
      );

    if (existingMonitor.length === 0) {
      return NextResponse.json(
        createErrorResponse("Monitor not found"),
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "toggle") {
      const newStatus = !existingMonitor[0].isActive;
      
      const updatedMonitor = await db
        .update(monitors)
        .set({
          isActive: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(monitors.id, id))
        .returning();

      return NextResponse.json(
        createSuccessResponse(
          updatedMonitor[0],
          `Monitor ${newStatus ? "activated" : "deactivated"} successfully`
        )
      );
    }

    return NextResponse.json(
      createErrorResponse("Invalid action"),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error toggling monitor:", error);
    return NextResponse.json(
      createErrorResponse("Failed to toggle monitor status"),
      { status: 500 }
    );
  }
}