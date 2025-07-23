import { pgTable, text, integer, timestamp, boolean, real, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";

export const subscriptionPlanEnum = pgEnum('subscription_plan', ['BASIC', 'PREMIUM', 'ENTERPRISE']);

export const SUBSCRIPTION_PLANS = {
  BASIC: 'BASIC', 
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE'
} as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

export const isValidPlan = (plan: string): plan is SubscriptionPlan => {
  return Object.values(SUBSCRIPTION_PLANS).includes(plan as SubscriptionPlan);
};

export const getPlanPriority = (plan: SubscriptionPlan): number => {
  switch (plan) {
    case SUBSCRIPTION_PLANS.BASIC:
      return 1;
    case SUBSCRIPTION_PLANS.PREMIUM:
      return 2;
    case SUBSCRIPTION_PLANS.ENTERPRISE:
      return 3;
    default:
      return 0;
  }
};
			
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	subscription: text("subscription"),
	updatedAt: timestamp('updated_at').notNull(),
	onboardingCompleted: boolean('onboarding_completed').notNull().default(false)
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});




export const subscriptions = pgTable("subscriptions", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	subscriptionId: text("subscription_id"),
	stripeUserId: text("stripe_user_id"),
	status: text("status"),
	startDate: text("start_date"),
	endDate: text("end_date"),
	planId: text("plan_id"),
	defaultPaymentMethodId: text("default_payment_method_id"),
	email: text("email"),
	userId: text("user_id"),
  });
  
  export const subscriptionPlans = pgTable("subscriptions_plans", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	planId: text("plan_id"),
	name: text("name"),
	description: text("description"),
	amount: text("amount"),
	currency: text("currency"),
	interval: text("interval"),
  });
  
  export const invoices = pgTable("invoices", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	invoiceId: text("invoice_id"),
	subscriptionId: text("subscription_id"),
	amountPaid: text("amount_paid"),
	amountDue: text("amount_due"),
	currency: text("currency"),
	status: text("status"),
	email: text("email"),
	userId: text("user_id"),
  });


export const feedback = pgTable("feedback", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	userId: text("user_id"),
	feedbackContent: text("feedback_content"),
	stars: integer().notNull()
});

// ========================================
// MONITORING TABLES
// ========================================

export const monitors = pgTable("monitors", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text("name").notNull(),
	url: text("url").notNull(),
	method: text("method").notNull().default("GET"),
	expectedStatusCodes: jsonb("expected_status_codes").notNull().default([200, 201, 202, 204]),
	timeout: integer("timeout").notNull().default(30), // seconds
	interval: integer("interval").notNull().default(5), // minutes
	retries: integer("retries").notNull().default(2),
	headers: jsonb("headers"),
	body: text("body"),
	slug: text("slug").unique(),
	isActive: boolean("is_active").notNull().default(true),
	currentStatus: text("current_status").notNull().default("PENDING"),
	lastCheckedAt: timestamp("last_checked_at"),
	lastIncidentAt: timestamp("last_incident_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const monitorResults = pgTable("monitor_results", {
	id: text("id").primaryKey(),
	monitorId: text("monitor_id").notNull().references(() => monitors.id, { onDelete: 'cascade' }),
	region: text("region").notNull(),
	status: text("status").notNull(),
	responseTime: integer("response_time"), // milliseconds
	statusCode: integer("status_code"),
	errorMessage: text("error_message"),
	checkedAt: timestamp("checked_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow()
});

export const incidents = pgTable("incidents", {
	id: text("id").primaryKey(),
	monitorId: text("monitor_id").notNull().references(() => monitors.id, { onDelete: 'cascade' }),
	status: text("status").notNull().default("OPEN"),
	startedAt: timestamp("started_at").notNull().defaultNow(),
	resolvedAt: timestamp("resolved_at"),
	duration: integer("duration"), // seconds
	errorMessage: text("error_message"),
	lastNotifiedAt: timestamp("last_notified_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const alertRecipients = pgTable("alert_recipients", {
	id: text("id").primaryKey(),
	monitorId: text("monitor_id").notNull().references(() => monitors.id, { onDelete: 'cascade' }),
	email: text("email").notNull(),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const monitorLogs = pgTable("monitor_logs", {
	id: text("id").primaryKey(),
	monitorId: text("monitor_id").notNull().references(() => monitors.id, { onDelete: 'cascade' }),
	action: text("action").notNull(), // "created", "updated", "checked", "incident_created", "incident_resolved"
	details: jsonb("details"),
	createdAt: timestamp("created_at").notNull().defaultNow()
});