import { z } from "zod";

// ========================================
// ENUMS & CONSTANTS
// ========================================

export const MONITOR_STATUS = {
  UP: "UP",
  DOWN: "DOWN",
  PENDING: "PENDING",
} as const;

export const INCIDENT_STATUS = {
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
} as const;

export const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  HEAD: "HEAD",
  PATCH: "PATCH",
} as const;

export const MONITOR_REGION = {
  US_EAST: "us-east-1",
  EU_WEST: "eu-west-1",
  AP_SOUTH: "ap-south-1",
} as const;

export const SUBSCRIPTION_LIMITS = {
  BASIC: { monitors: 2, alertRecipients: 1 },
  PREMIUM: { monitors: 10, alertRecipients: 3 },
  ENTERPRISE: { monitors: -1, alertRecipients: 10 }, // -1 = unlimited
} as const;

// ========================================
// TYPE DEFINITIONS
// ========================================

export type MonitorStatus = keyof typeof MONITOR_STATUS;
export type IncidentStatus = keyof typeof INCIDENT_STATUS;
export type HttpMethod = keyof typeof HTTP_METHOD;
export type MonitorRegion = typeof MONITOR_REGION[keyof typeof MONITOR_REGION];

// ========================================
// ZOD SCHEMAS (Define first, infer types from them)
// ========================================

// Base schemas
export const MonitorStatusSchema = z.enum(["UP", "DOWN", "PENDING"]);
export const IncidentStatusSchema = z.enum(["OPEN", "RESOLVED"]);
export const HttpMethodSchema = z.enum(["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"]);
export const MonitorRegionSchema = z.enum(["us-east-1", "eu-west-1", "ap-south-1"]);

// Create Monitor Schema
export const CreateMonitorSchema = z.object({
  name: z.string().min(1, "Monitor name is required").max(100, "Name too long"),
  url: z.string().url("Valid URL is required"),
  method: HttpMethodSchema.default("GET"),
  expectedStatusCodes: z.array(z.number().int().min(100).max(599)).default([200, 201, 202, 204]),
  timeout: z.number().int().min(5).max(60).default(30),
  interval: z.number().int().min(1).max(60).default(5),
  retries: z.number().int().min(0).max(5).default(2),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  slug: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Update Monitor Schema - Simplified without defaults on optional fields
export const UpdateMonitorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  method: HttpMethodSchema.optional(),
  expectedStatusCodes: z.array(z.number().int().min(100).max(599)).optional(),
  timeout: z.number().int().min(5).max(60).optional(),
  interval: z.number().int().min(1).max(60).optional(),
  retries: z.number().int().min(0).max(5).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Monitor Schema (for database entity)
export const MonitorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  url: z.string(),
  method: HttpMethodSchema,
  expectedStatusCodes: z.array(z.number()),
  timeout: z.number(),
  interval: z.number(),
  retries: z.number(),
  headers: z.record(z.string(), z.string()).nullable(),
  body: z.string().nullable(),
  slug: z.string().nullable(),
  isActive: z.boolean(),
  currentStatus: MonitorStatusSchema,
  lastCheckedAt: z.date().nullable(),
  lastIncidentAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Other schemas...
export const CreateMonitorResultSchema = z.object({
  monitorId: z.string(),
  region: MonitorRegionSchema,
  status: MonitorStatusSchema,
  responseTime: z.number().nullable(),
  statusCode: z.number().nullable(),
  errorMessage: z.string().nullable(),
  checkedAt: z.date(),
});

export const MonitorResultSchema = z.object({
  id: z.string(),
  monitorId: z.string(),
  region: MonitorRegionSchema,
  status: MonitorStatusSchema,
  responseTime: z.number().nullable(),
  statusCode: z.number().nullable(),
  errorMessage: z.string().nullable(),
  checkedAt: z.date(),
  createdAt: z.date(),
});

export const CreateIncidentSchema = z.object({
  monitorId: z.string(),
  errorMessage: z.string().optional(),
});

export const IncidentSchema = z.object({
  id: z.string(),
  monitorId: z.string(),
  status: IncidentStatusSchema,
  startedAt: z.date(),
  resolvedAt: z.date().nullable(),
  duration: z.number().nullable(),
  errorMessage: z.string().nullable(),
  lastNotifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateAlertRecipientSchema = z.object({
  monitorId: z.string(),
  email: z.string().email("Valid email required"),
});

export const AlertRecipientSchema = z.object({
  id: z.string(),
  monitorId: z.string(),
  email: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Stats schemas
export const MonitorStatsSchema = z.object({
  monitorId: z.string(),
  uptime: z.number(),
  averageResponseTime: z.number().nullable(),
  totalChecks: z.number(),
  successfulChecks: z.number(),
  failedChecks: z.number(),
  lastIncident: z.date().nullable(),
  incidentCount: z.number(),
});

export const DashboardStatsSchema = z.object({
  totalMonitors: z.number(),
  activeMonitors: z.number(),
  inactiveMonitors: z.number(),
  totalIncidents: z.number(),
  openIncidents: z.number(),
  averageUptime: z.number(),
  monitorsUp: z.number(),
  monitorsDown: z.number(),
});

// Job schemas
export const MonitorJobSchema = z.object({
  monitorId: z.string(),
  url: z.string(),
  method: HttpMethodSchema,
  expectedStatusCodes: z.array(z.number()),
  timeout: z.number(),
  retries: z.number(),
  headers: z.record(z.string(), z.string()).nullable(),
  body: z.string().nullable(),
  region: MonitorRegionSchema,
});

export const MonitorJobResultSchema = z.object({
  monitorId: z.string(),
  region: MonitorRegionSchema,
  status: MonitorStatusSchema,
  responseTime: z.number().nullable(),
  statusCode: z.number().nullable(),
  errorMessage: z.string().nullable(),
  checkedAt: z.string(), // ISO string for JSON serialization
});

export const WebhookMonitorResultSchema = z.object({
  results: z.array(MonitorJobResultSchema),
  lambdaRequestId: z.string(),
  region: MonitorRegionSchema,
});

// ========================================
// INFERRED TYPES (Derive from schemas)
// ========================================

export type CreateMonitor = z.infer<typeof CreateMonitorSchema>;
export type UpdateMonitor = z.infer<typeof UpdateMonitorSchema>;
export type Monitor = z.infer<typeof MonitorSchema>;
export type MonitorResult = z.infer<typeof MonitorResultSchema>;
export type CreateMonitorResult = z.infer<typeof CreateMonitorResultSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
export type CreateIncident = z.infer<typeof CreateIncidentSchema>;
export type AlertRecipient = z.infer<typeof AlertRecipientSchema>;
export type CreateAlertRecipient = z.infer<typeof CreateAlertRecipientSchema>;
export type MonitorStats = z.infer<typeof MonitorStatsSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type MonitorJob = z.infer<typeof MonitorJobSchema>;
export type MonitorJobResult = z.infer<typeof MonitorJobResultSchema>;
export type WebhookMonitorResult = z.infer<typeof WebhookMonitorResultSchema>;

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
  error?: string;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    error,
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return createApiResponse(true, data, message);
}

export function createErrorResponse(
  error: string,
  message?: string
): ApiResponse<never> {
  return createApiResponse<never>(false, undefined as never, message, error);
}

export function isMonitorUp(status: MonitorStatus): boolean {
  return status === MONITOR_STATUS.UP;
}

export function isIncidentOpen(status: IncidentStatus): boolean {
  return status === INCIDENT_STATUS.OPEN;
}

export function getSubscriptionLimits(plan: string) {
  const planUpper = plan.toUpperCase() as keyof typeof SUBSCRIPTION_LIMITS;
  return SUBSCRIPTION_LIMITS[planUpper] || SUBSCRIPTION_LIMITS.BASIC;
}

// ========================================
// VALIDATION HELPERS
// ========================================

/**
 * Parse and validate create monitor data
 */
export function parseCreateMonitor(data: unknown): CreateMonitor {
  return CreateMonitorSchema.parse(data);
}

/**
 * Parse and validate update monitor data
 */
export function parseUpdateMonitor(data: unknown): UpdateMonitor {
  return UpdateMonitorSchema.parse(data);
}

/**
 * Safe parse with error handling
 */
export function safeParseCreateMonitor(data: unknown): 
  { success: true; data: CreateMonitor } | 
  { success: false; error: z.ZodError } {
  const result = CreateMonitorSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Safe parse with error handling
 */
export function safeParseUpdateMonitor(data: unknown): 
  { success: true; data: UpdateMonitor } | 
  { success: false; error: z.ZodError } {
  const result = UpdateMonitorSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// ========================================
// DEFAULT VALUES FOR FORMS
// ========================================

export const DEFAULT_CREATE_MONITOR: CreateMonitor = {
  name: '',
  url: '',
  method: 'GET',
  expectedStatusCodes: [200, 201, 202, 204],
  timeout: 30,
  interval: 5,
  retries: 2,
  isActive: true,
};

export const DEFAULT_UPDATE_MONITOR: Partial<UpdateMonitor> = {
  method: 'GET',
  expectedStatusCodes: [200],
  timeout: 30,
  interval: 5,
  retries: 2,
  isActive: true,
};