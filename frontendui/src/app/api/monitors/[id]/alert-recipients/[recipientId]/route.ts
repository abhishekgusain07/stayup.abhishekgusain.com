import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { monitors, alertRecipients } from "@/db/schema";
import { createSuccessResponse, createErrorResponse } from "@/types/shared";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

type RouteParams = {
  params: Promise<{ id: string; recipientId: string }>;
};

// DELETE /api/monitors/[id]/alert-recipients/[recipientId] - Remove alert recipient
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, recipientId } = await params;
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

    // Verify the alert recipient exists and belongs to this monitor
    const recipient = await db
      .select()
      .from(alertRecipients)
      .where(
        and(
          eq(alertRecipients.id, recipientId),
          eq(alertRecipients.monitorId, id)
        )
      );

    if (recipient.length === 0) {
      return NextResponse.json(
        createErrorResponse("Alert recipient not found"),
        { status: 404 }
      );
    }

    // Delete the alert recipient
    await db
      .delete(alertRecipients)
      .where(eq(alertRecipients.id, recipientId));

    return NextResponse.json(
      createSuccessResponse(
        null,
        "Alert recipient removed successfully"
      )
    );
  } catch (error) {
    console.error("Error deleting alert recipient:", error);
    return NextResponse.json(
      createErrorResponse("Failed to remove alert recipient"),
      { status: 500 }
    );
  }
}

// PATCH /api/monitors/[id]/alert-recipients/[recipientId] - Toggle alert recipient status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, recipientId } = await params;
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

    // Verify the alert recipient exists and belongs to this monitor
    const recipient = await db
      .select()
      .from(alertRecipients)
      .where(
        and(
          eq(alertRecipients.id, recipientId),
          eq(alertRecipients.monitorId, id)
        )
      );

    if (recipient.length === 0) {
      return NextResponse.json(
        createErrorResponse("Alert recipient not found"),
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "toggle") {
      const newStatus = !recipient[0].isActive;
      
      const updatedRecipient = await db
        .update(alertRecipients)
        .set({
          isActive: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(alertRecipients.id, recipientId))
        .returning();

      return NextResponse.json(
        createSuccessResponse(
          updatedRecipient[0],
          `Alert recipient ${newStatus ? "activated" : "deactivated"} successfully`
        )
      );
    }

    return NextResponse.json(
      createErrorResponse("Invalid action"),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error toggling alert recipient:", error);
    return NextResponse.json(
      createErrorResponse("Failed to toggle alert recipient status"),
      { status: 500 }
    );
  }
}