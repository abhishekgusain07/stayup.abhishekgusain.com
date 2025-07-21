import { pgTable, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

// ========================================
// USER TABLES (From frontend)
// ========================================

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

// ========================================
// MONITORING TABLES (Following uptimeMonitor structure)
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
  isDeleted: boolean("is_deleted").notNull().default(false), // Following uptimeMonitor pattern
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

export const monitorAlertRecipients = pgTable("monitor_alert_recipients", {
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