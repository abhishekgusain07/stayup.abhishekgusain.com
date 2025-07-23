import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { monitors, user } from "@/db/schema";
import { 
  CreateMonitorSchema, 
  createSuccessResponse, 
  createErrorResponse,
  getSubscriptionLimits,
  type Monitor 
} from "@/types/shared";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/monitors - List user's monitors with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        createErrorResponse("Authentication required"),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    // Get monitors for the user
    const userMonitors = await db
      .select()
      .from(monitors)
      .where(eq(monitors.userId, session.user.id))
      .orderBy(desc(monitors.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: monitors.id })
      .from(monitors)
      .where(eq(monitors.userId, session.user.id));

    const total = totalResult.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      createSuccessResponse({
        items: userMonitors,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching monitors:", error);
    return NextResponse.json(
      createErrorResponse("Failed to fetch monitors"),
      { status: 500 }
    );
  }
}

// POST /api/monitors - Create a new monitor
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        createErrorResponse("Authentication required"),
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = CreateMonitorSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createErrorResponse(
          "Validation failed",
          validationResult.error.issues.map(i => i.message).join(", ")
        ),
        { status: 400 }
      );
    }

    const monitorData = validationResult.data;

    // Check subscription limits
    const userId = session.user.id;
    const userSubscriptionResult = await db
      .select({ subscription: user.subscription })
      .from(user)
      .where(eq(user.id, userId));

    const userSubscription = userSubscriptionResult?.[0]?.subscription || "BASIC";
    const limits = getSubscriptionLimits(userSubscription);

    // Count current monitors
    const currentMonitors = await db
      .select({ count: monitors.id })
      .from(monitors)
      .where(
        and(
          eq(monitors.userId, session.user.id),
          eq(monitors.isActive, true)
        )
      );

    if (limits.monitors !== -1 && currentMonitors.length >= limits.monitors) {
      return NextResponse.json(
        createErrorResponse(
          "Monitor limit reached",
          `Your ${userSubscription} plan allows ${limits.monitors} monitors. Upgrade to add more.`
        ),
        { status: 403 }
      );
    }

    // Generate unique slug if not provided
    let slug = monitorData.slug;
    if (!slug) {
      slug = nanoid(10);
      // Ensure slug is unique
      const existing = await db
        .select({ slug: monitors.slug })
        .from(monitors)
        .where(eq(monitors.slug, slug));

      if (existing.length > 0) {
        slug = `${slug}-${nanoid(4)}`;
      }
    } else {
      // Check if provided slug is available
      const existing = await db
        .select({ slug: monitors.slug })
        .from(monitors)
        .where(eq(monitors.slug, slug));

      if (existing.length > 0) {
        return NextResponse.json(
          createErrorResponse(
            "Slug already exists",
            "Please choose a different slug for your status page"
          ),
          { status: 409 }
        );
      }
    }

    // Create the monitor
    const newMonitor = await db
      .insert(monitors)
      .values({
        id: nanoid(),
        userId: session.user.id,
        name: monitorData.name,
        url: monitorData.url,
        method: monitorData.method,
        expectedStatusCodes: JSON.stringify(monitorData.expectedStatusCodes),
        timeout: monitorData.timeout,
        interval: monitorData.interval,
        retries: monitorData.retries,
        headers: monitorData.headers ? JSON.stringify(monitorData.headers) : null,
        body: monitorData.body || null,
        slug,
        isActive: monitorData.isActive,
        currentStatus: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // TODO: Add monitor creation log entry
    // TODO: Trigger initial monitoring job

    return NextResponse.json(
      createSuccessResponse(
        newMonitor[0],
        "Monitor created successfully"
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating monitor:", error);
    return NextResponse.json(
      createErrorResponse("Failed to create monitor"),
      { status: 500 }
    );
  }
}