import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { monitors, alertRecipients, user } from "@/db/schema";
import { 
  CreateAlertRecipientSchema, 
  createSuccessResponse, 
  createErrorResponse,
  getSubscriptionLimits 
} from "@/types/shared";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/monitors/[id]/alert-recipients - List alert recipients for a monitor
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

    // Get alert recipients for this monitor
    const recipients = await db
      .select()
      .from(alertRecipients)
      .where(eq(alertRecipients.monitorId, id));

    return NextResponse.json(
      createSuccessResponse(recipients)
    );
  } catch (error) {
    console.error("Error fetching alert recipients:", error);
    return NextResponse.json(
      createErrorResponse("Failed to fetch alert recipients"),
      { status: 500 }
    );
  }
}

// POST /api/monitors/[id]/alert-recipients - Add alert recipient to a monitor
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const validationResult = CreateAlertRecipientSchema.safeParse({
      ...body,
      monitorId: id,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        createErrorResponse(
          "Validation failed",
          validationResult.error.issues.map(i => i.message).join(", ")
        ),
        { status: 400 }
      );
    }

    const recipientData = validationResult.data;

    // Check subscription limits
    const userId = session.user.id;
    const userSubscription = await db.select({subscription: user.subscription})
    .from(user)
    .where(eq(user.id, userId));
    const subType = userSubscription[0].subscription;
    const limits = getSubscriptionLimits("BASIC");

    // Count current alert recipients for this monitor
    const currentRecipients = await db
      .select({ count: alertRecipients.id })
      .from(alertRecipients)
      .where(
        and(
          eq(alertRecipients.monitorId, id),
          eq(alertRecipients.isActive, true)
        )
      );

    if (currentRecipients.length >= limits.alertRecipients) {
      return NextResponse.json(
        createErrorResponse(
          "Alert recipient limit reached",
          `Your ${userSubscription} plan allows ${limits.alertRecipients} alert recipients per monitor. Upgrade to add more.`
        ),
        { status: 403 }
      );
    }

    // Check if email already exists for this monitor
    const existingRecipient = await db
      .select()
      .from(alertRecipients)
      .where(
        and(
          eq(alertRecipients.monitorId, id),
          eq(alertRecipients.email, recipientData.email)
        )
      );

    if (existingRecipient.length > 0) {
      return NextResponse.json(
        createErrorResponse(
          "Email already exists",
          "This email is already configured for alerts on this monitor"
        ),
        { status: 409 }
      );
    }

    // Create the alert recipient
    const newRecipient = await db
      .insert(alertRecipients)
      .values({
        id: nanoid(),
        monitorId: id,
        email: recipientData.email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      createSuccessResponse(
        newRecipient[0],
        "Alert recipient added successfully"
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating alert recipient:", error);
    return NextResponse.json(
      createErrorResponse("Failed to create alert recipient"),
      { status: 500 }
    );
  }
}