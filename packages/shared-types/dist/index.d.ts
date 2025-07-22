import { z } from "zod";
export declare const MONITOR_STATUS: {
    readonly UP: "UP";
    readonly DOWN: "DOWN";
    readonly PENDING: "PENDING";
};
export declare const INCIDENT_STATUS: {
    readonly OPEN: "OPEN";
    readonly RESOLVED: "RESOLVED";
};
export declare const HTTP_METHOD: {
    readonly GET: "GET";
    readonly POST: "POST";
    readonly PUT: "PUT";
    readonly DELETE: "DELETE";
    readonly HEAD: "HEAD";
    readonly PATCH: "PATCH";
};
export declare const MONITOR_REGION: {
    readonly US_EAST: "us-east-1";
    readonly EU_WEST: "eu-west-1";
    readonly AP_SOUTH: "ap-south-1";
};
export declare const SUBSCRIPTION_LIMITS: {
    readonly BASIC: {
        readonly monitors: 2;
        readonly alertRecipients: 1;
    };
    readonly PREMIUM: {
        readonly monitors: 10;
        readonly alertRecipients: 3;
    };
    readonly ENTERPRISE: {
        readonly monitors: -1;
        readonly alertRecipients: 10;
    };
};
export declare const MonitorStatusSchema: z.ZodEnum<["UP", "DOWN", "PENDING"]>;
export declare const IncidentStatusSchema: z.ZodEnum<["OPEN", "RESOLVED"]>;
export declare const HttpMethodSchema: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"]>;
export declare const MonitorRegionSchema: z.ZodEnum<["us-east-1", "eu-west-1", "ap-south-1"]>;
export declare const CreateMonitorSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    method: z.ZodDefault<z.ZodEnum<["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"]>>;
    expectedStatusCodes: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    timeout: z.ZodDefault<z.ZodNumber>;
    interval: z.ZodDefault<z.ZodNumber>;
    retries: z.ZodDefault<z.ZodNumber>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    body: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH";
    expectedStatusCodes: number[];
    timeout: number;
    interval: number;
    retries: number;
    isActive: boolean;
    headers?: Record<string, string> | undefined;
    body?: string | undefined;
    slug?: string | undefined;
}, {
    name: string;
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH" | undefined;
    expectedStatusCodes?: number[] | undefined;
    timeout?: number | undefined;
    interval?: number | undefined;
    retries?: number | undefined;
    headers?: Record<string, string> | undefined;
    body?: string | undefined;
    slug?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const UpdateMonitorSchema: z.ZodObject<Omit<{
    name: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodDefault<z.ZodEnum<["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"]>>>;
    expectedStatusCodes: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>>;
    timeout: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    interval: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    retries: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    headers: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
    body: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "slug">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    url?: string | undefined;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH" | undefined;
    expectedStatusCodes?: number[] | undefined;
    timeout?: number | undefined;
    interval?: number | undefined;
    retries?: number | undefined;
    headers?: Record<string, string> | undefined;
    body?: string | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    url?: string | undefined;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH" | undefined;
    expectedStatusCodes?: number[] | undefined;
    timeout?: number | undefined;
    interval?: number | undefined;
    retries?: number | undefined;
    headers?: Record<string, string> | undefined;
    body?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const MonitorSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"]>;
    expectedStatusCodes: z.ZodArray<z.ZodNumber, "many">;
    timeout: z.ZodNumber;
    interval: z.ZodNumber;
    retries: z.ZodNumber;
    headers: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>;
    body: z.ZodNullable<z.ZodString>;
    slug: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    currentStatus: z.ZodEnum<["UP", "DOWN", "PENDING"]>;
    lastCheckedAt: z.ZodNullable<z.ZodDate>;
    lastIncidentAt: z.ZodNullable<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH";
    expectedStatusCodes: number[];
    timeout: number;
    interval: number;
    retries: number;
    headers: Record<string, string> | null;
    body: string | null;
    slug: string | null;
    isActive: boolean;
    id: string;
    userId: string;
    currentStatus: "UP" | "DOWN" | "PENDING";
    lastCheckedAt: Date | null;
    lastIncidentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}, {
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH";
    expectedStatusCodes: number[];
    timeout: number;
    interval: number;
    retries: number;
    headers: Record<string, string> | null;
    body: string | null;
    slug: string | null;
    isActive: boolean;
    id: string;
    userId: string;
    currentStatus: "UP" | "DOWN" | "PENDING";
    lastCheckedAt: Date | null;
    lastIncidentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const MonitorResultSchema: z.ZodObject<{
    id: z.ZodString;
    monitorId: z.ZodString;
    region: z.ZodEnum<["us-east-1", "eu-west-1", "ap-south-1"]>;
    status: z.ZodEnum<["UP", "DOWN", "PENDING"]>;
    responseTime: z.ZodNullable<z.ZodNumber>;
    statusCode: z.ZodNullable<z.ZodNumber>;
    errorMessage: z.ZodNullable<z.ZodString>;
    checkedAt: z.ZodDate;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "UP" | "DOWN" | "PENDING";
    id: string;
    createdAt: Date;
    monitorId: string;
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
    responseTime: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    checkedAt: Date;
}, {
    status: "UP" | "DOWN" | "PENDING";
    id: string;
    createdAt: Date;
    monitorId: string;
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
    responseTime: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    checkedAt: Date;
}>;
export declare const CreateMonitorResultSchema: z.ZodObject<{
    monitorId: z.ZodString;
    region: z.ZodEnum<["us-east-1", "eu-west-1", "ap-south-1"]>;
    status: z.ZodEnum<["UP", "DOWN", "PENDING"]>;
    responseTime: z.ZodNullable<z.ZodNumber>;
    statusCode: z.ZodNullable<z.ZodNumber>;
    errorMessage: z.ZodNullable<z.ZodString>;
    checkedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "UP" | "DOWN" | "PENDING";
    monitorId: string;
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
    responseTime: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    checkedAt: Date;
}, {
    status: "UP" | "DOWN" | "PENDING";
    monitorId: string;
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
    responseTime: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    checkedAt?: Date | undefined;
}>;
export declare const IncidentSchema: z.ZodObject<{
    id: z.ZodString;
    monitorId: z.ZodString;
    status: z.ZodEnum<["OPEN", "RESOLVED"]>;
    startedAt: z.ZodDate;
    resolvedAt: z.ZodNullable<z.ZodDate>;
    duration: z.ZodNullable<z.ZodNumber>;
    errorMessage: z.ZodNullable<z.ZodString>;
    lastNotifiedAt: z.ZodNullable<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "OPEN" | "RESOLVED";
    duration: number | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    monitorId: string;
    errorMessage: string | null;
    startedAt: Date;
    resolvedAt: Date | null;
    lastNotifiedAt: Date | null;
}, {
    status: "OPEN" | "RESOLVED";
    duration: number | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    monitorId: string;
    errorMessage: string | null;
    startedAt: Date;
    resolvedAt: Date | null;
    lastNotifiedAt: Date | null;
}>;
export declare const CreateIncidentSchema: z.ZodObject<{
    monitorId: z.ZodString;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    monitorId: string;
    errorMessage?: string | undefined;
}, {
    monitorId: string;
    errorMessage?: string | undefined;
}>;
export declare const AlertRecipientSchema: z.ZodObject<{
    id: z.ZodString;
    monitorId: z.ZodString;
    email: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    email: string;
    isActive: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    monitorId: string;
}, {
    email: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    monitorId: string;
    isActive?: boolean | undefined;
}>;
export declare const CreateAlertRecipientSchema: z.ZodObject<{
    monitorId: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    monitorId: string;
}, {
    email: string;
    monitorId: string;
}>;
export declare const MonitorStatsSchema: z.ZodObject<{
    monitorId: z.ZodString;
    uptime: z.ZodNumber;
    averageResponseTime: z.ZodNullable<z.ZodNumber>;
    totalChecks: z.ZodNumber;
    successfulChecks: z.ZodNumber;
    failedChecks: z.ZodNumber;
    lastIncident: z.ZodNullable<z.ZodDate>;
    incidentCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    monitorId: string;
    uptime: number;
    averageResponseTime: number | null;
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    lastIncident: Date | null;
    incidentCount: number;
}, {
    monitorId: string;
    uptime: number;
    averageResponseTime: number | null;
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    lastIncident: Date | null;
    incidentCount: number;
}>;
export declare const DashboardStatsSchema: z.ZodObject<{
    totalMonitors: z.ZodNumber;
    activeMonitors: z.ZodNumber;
    inactiveMonitors: z.ZodNumber;
    totalIncidents: z.ZodNumber;
    openIncidents: z.ZodNumber;
    averageUptime: z.ZodNumber;
    monitorsUp: z.ZodNumber;
    monitorsDown: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalMonitors: number;
    activeMonitors: number;
    inactiveMonitors: number;
    totalIncidents: number;
    openIncidents: number;
    averageUptime: number;
    monitorsUp: number;
    monitorsDown: number;
}, {
    totalMonitors: number;
    activeMonitors: number;
    inactiveMonitors: number;
    totalIncidents: number;
    openIncidents: number;
    averageUptime: number;
    monitorsUp: number;
    monitorsDown: number;
}>;
export declare const ApiResponseSchema: <T>(dataSchema: z.ZodType<T>) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodType<T, z.ZodTypeDef, T>>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodType<T, z.ZodTypeDef, T>>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodType<T, z.ZodTypeDef, T>>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}>, any>[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodType<T, z.ZodTypeDef, T>>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodType<T, z.ZodTypeDef, T>>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}>[k_1]; } : never>;
export declare const PaginatedResponseSchema: <T>(itemSchema: z.ZodType<T>) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodObject<{
        items: z.ZodArray<z.ZodType<T, z.ZodTypeDef, T>, "many">;
        pagination: z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        }, {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        items: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }, {
        items: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
    message?: string | undefined;
    error?: string | undefined;
}, {
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
    message?: string | undefined;
    error?: string | undefined;
}>;
export declare const MonitorJobSchema: z.ZodObject<{
    monitorId: z.ZodString;
    url: z.ZodString;
    method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"]>;
    expectedStatusCodes: z.ZodArray<z.ZodNumber, "many">;
    timeout: z.ZodNumber;
    retries: z.ZodNumber;
    headers: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>;
    body: z.ZodNullable<z.ZodString>;
    region: z.ZodEnum<["us-east-1", "eu-west-1", "ap-south-1"]>;
}, "strip", z.ZodTypeAny, {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH";
    expectedStatusCodes: number[];
    timeout: number;
    retries: number;
    headers: Record<string, string> | null;
    body: string | null;
    monitorId: string;
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
}, {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH";
    expectedStatusCodes: number[];
    timeout: number;
    retries: number;
    headers: Record<string, string> | null;
    body: string | null;
    monitorId: string;
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
}>;
export declare const MonitorJobResultSchema: z.ZodObject<{
    monitorId: z.ZodString;
    region: z.ZodEnum<["us-east-1", "eu-west-1", "ap-south-1"]>;
    status: z.ZodEnum<["UP", "DOWN", "PENDING"]>;
    responseTime: z.ZodNullable<z.ZodNumber>;
    statusCode: z.ZodNullable<z.ZodNumber>;
    errorMessage: z.ZodNullable<z.ZodString>;
    checkedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "UP" | "DOWN" | "PENDING";
    monitorId: string;
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
    responseTime: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    checkedAt: string;
}, {
    status: "UP" | "DOWN" | "PENDING";
    monitorId: string;
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
    responseTime: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    checkedAt: string;
}>;
export declare const WebhookMonitorResultSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        monitorId: z.ZodString;
        region: z.ZodEnum<["us-east-1", "eu-west-1", "ap-south-1"]>;
        status: z.ZodEnum<["UP", "DOWN", "PENDING"]>;
        responseTime: z.ZodNullable<z.ZodNumber>;
        statusCode: z.ZodNullable<z.ZodNumber>;
        errorMessage: z.ZodNullable<z.ZodString>;
        checkedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "UP" | "DOWN" | "PENDING";
        monitorId: string;
        region: "us-east-1" | "eu-west-1" | "ap-south-1";
        responseTime: number | null;
        statusCode: number | null;
        errorMessage: string | null;
        checkedAt: string;
    }, {
        status: "UP" | "DOWN" | "PENDING";
        monitorId: string;
        region: "us-east-1" | "eu-west-1" | "ap-south-1";
        responseTime: number | null;
        statusCode: number | null;
        errorMessage: string | null;
        checkedAt: string;
    }>, "many">;
    lambdaRequestId: z.ZodString;
    region: z.ZodEnum<["us-east-1", "eu-west-1", "ap-south-1"]>;
}, "strip", z.ZodTypeAny, {
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
    results: {
        status: "UP" | "DOWN" | "PENDING";
        monitorId: string;
        region: "us-east-1" | "eu-west-1" | "ap-south-1";
        responseTime: number | null;
        statusCode: number | null;
        errorMessage: string | null;
        checkedAt: string;
    }[];
    lambdaRequestId: string;
}, {
    region: "us-east-1" | "eu-west-1" | "ap-south-1";
    results: {
        status: "UP" | "DOWN" | "PENDING";
        monitorId: string;
        region: "us-east-1" | "eu-west-1" | "ap-south-1";
        responseTime: number | null;
        statusCode: number | null;
        errorMessage: string | null;
        checkedAt: string;
    }[];
    lambdaRequestId: string;
}>;
export type MonitorStatus = z.infer<typeof MonitorStatusSchema>;
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;
export type HttpMethod = z.infer<typeof HttpMethodSchema>;
export type MonitorRegion = z.infer<typeof MonitorRegionSchema>;
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
export type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema<T>>>;
export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<T>>>;
export declare function createApiResponse<T>(success: boolean, data?: T, message?: string, error?: string): {
    success: boolean;
    data: T | undefined;
    message: string | undefined;
    error: string | undefined;
};
export declare function createSuccessResponse<T>(data: T, message?: string): {
    success: boolean;
    data: T | undefined;
    message: string | undefined;
    error: string | undefined;
};
export declare function createErrorResponse<T>(error: string, message?: string): {
    success: boolean;
    data: undefined;
    message: string | undefined;
    error: string | undefined;
};
export declare function isMonitorUp(status: MonitorStatus): boolean;
export declare function isIncidentOpen(status: IncidentStatus): boolean;
export declare function getSubscriptionLimits(plan: string): {
    readonly monitors: 2;
    readonly alertRecipients: 1;
} | {
    readonly monitors: 10;
    readonly alertRecipients: 3;
} | {
    readonly monitors: -1;
    readonly alertRecipients: 10;
};
//# sourceMappingURL=index.d.ts.map