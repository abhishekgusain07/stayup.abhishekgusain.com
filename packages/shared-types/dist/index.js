import { z } from "zod";
// ========================================
// ENUMS & CONSTANTS
// ========================================
export const MONITOR_STATUS = {
    UP: "UP",
    DOWN: "DOWN",
    PENDING: "PENDING",
};
export const INCIDENT_STATUS = {
    OPEN: "OPEN",
    RESOLVED: "RESOLVED",
};
export const HTTP_METHOD = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    HEAD: "HEAD",
    PATCH: "PATCH",
};
export const MONITOR_REGION = {
    US_EAST: "us-east-1",
    EU_WEST: "eu-west-1",
    AP_SOUTH: "ap-south-1",
};
export const SUBSCRIPTION_LIMITS = {
    BASIC: { monitors: 2, alertRecipients: 1 },
    PREMIUM: { monitors: 10, alertRecipients: 3 },
    ENTERPRISE: { monitors: -1, alertRecipients: 10 }, // -1 = unlimited
};
// ========================================
// ZOD SCHEMAS
// ========================================
export const MonitorStatusSchema = z.enum([
    MONITOR_STATUS.UP,
    MONITOR_STATUS.DOWN,
    MONITOR_STATUS.PENDING,
]);
export const IncidentStatusSchema = z.enum([
    INCIDENT_STATUS.OPEN,
    INCIDENT_STATUS.RESOLVED,
]);
export const HttpMethodSchema = z.enum([
    HTTP_METHOD.GET,
    HTTP_METHOD.POST,
    HTTP_METHOD.PUT,
    HTTP_METHOD.DELETE,
    HTTP_METHOD.HEAD,
    HTTP_METHOD.PATCH,
]);
export const MonitorRegionSchema = z.enum([
    MONITOR_REGION.US_EAST,
    MONITOR_REGION.EU_WEST,
    MONITOR_REGION.AP_SOUTH,
]);
// ========================================
// MONITOR SCHEMAS
// ========================================
export const CreateMonitorSchema = z.object({
    name: z.string().min(1, "Monitor name is required").max(100, "Name too long"),
    url: z.string().url("Valid URL is required"),
    method: HttpMethodSchema.default(HTTP_METHOD.GET),
    expectedStatusCodes: z
        .array(z.number().int().min(100).max(599))
        .default([200, 201, 202, 204]),
    timeout: z.number().int().min(5).max(60).default(30), // seconds
    interval: z.number().int().min(1).max(60).default(5), // minutes
    retries: z.number().int().min(0).max(5).default(2),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
    slug: z.string().optional(),
    isActive: z.boolean().default(true),
});
export const UpdateMonitorSchema = CreateMonitorSchema.partial().omit({
    slug: true,
});
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
// ========================================
// MONITOR RESULT SCHEMAS
// ========================================
export const MonitorResultSchema = z.object({
    id: z.string(),
    monitorId: z.string(),
    region: MonitorRegionSchema,
    status: MonitorStatusSchema,
    responseTime: z.number().nullable(), // milliseconds
    statusCode: z.number().nullable(),
    errorMessage: z.string().nullable(),
    checkedAt: z.date(),
    createdAt: z.date(),
});
export const CreateMonitorResultSchema = z.object({
    monitorId: z.string(),
    region: MonitorRegionSchema,
    status: MonitorStatusSchema,
    responseTime: z.number().nullable(),
    statusCode: z.number().nullable(),
    errorMessage: z.string().nullable(),
    checkedAt: z.date().default(() => new Date()),
});
// ========================================
// INCIDENT SCHEMAS
// ========================================
export const IncidentSchema = z.object({
    id: z.string(),
    monitorId: z.string(),
    status: IncidentStatusSchema,
    startedAt: z.date(),
    resolvedAt: z.date().nullable(),
    duration: z.number().nullable(), // seconds
    errorMessage: z.string().nullable(),
    lastNotifiedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const CreateIncidentSchema = z.object({
    monitorId: z.string(),
    errorMessage: z.string().optional(),
});
// ========================================
// ALERT RECIPIENT SCHEMAS
// ========================================
export const AlertRecipientSchema = z.object({
    id: z.string(),
    monitorId: z.string(),
    email: z.string().email("Valid email required"),
    isActive: z.boolean().default(true),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const CreateAlertRecipientSchema = z.object({
    monitorId: z.string(),
    email: z.string().email("Valid email required"),
});
// ========================================
// DASHBOARD & ANALYTICS SCHEMAS
// ========================================
export const MonitorStatsSchema = z.object({
    monitorId: z.string(),
    uptime: z.number().min(0).max(100), // percentage
    averageResponseTime: z.number().nullable(), // milliseconds
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
// ========================================
// API RESPONSE SCHEMAS
// ========================================
export const ApiResponseSchema = (dataSchema) => z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.string().optional(),
});
export const PaginatedResponseSchema = (itemSchema) => z.object({
    success: z.boolean(),
    data: z.object({
        items: z.array(itemSchema),
        pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
        }),
    }),
    message: z.string().optional(),
    error: z.string().optional(),
});
// ========================================
// LAMBDA WORKER SCHEMAS
// ========================================
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
// ========================================
// WEBHOOK SCHEMAS
// ========================================
export const WebhookMonitorResultSchema = z.object({
    results: z.array(MonitorJobResultSchema),
    lambdaRequestId: z.string(),
    region: MonitorRegionSchema,
});
// ========================================
// UTILITY FUNCTIONS
// ========================================
export function createApiResponse(success, data, message, error) {
    return {
        success,
        data,
        message,
        error,
    };
}
export function createSuccessResponse(data, message) {
    return createApiResponse(true, data, message);
}
export function createErrorResponse(error, message) {
    return createApiResponse(false, undefined, message, error);
}
export function isMonitorUp(status) {
    return status === MONITOR_STATUS.UP;
}
export function isIncidentOpen(status) {
    return status === INCIDENT_STATUS.OPEN;
}
export function getSubscriptionLimits(plan) {
    const planUpper = plan.toUpperCase();
    return SUBSCRIPTION_LIMITS[planUpper] || SUBSCRIPTION_LIMITS.BASIC;
}
//# sourceMappingURL=index.js.map