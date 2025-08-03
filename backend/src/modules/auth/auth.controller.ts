import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiProduces,
} from "@nestjs/swagger";

import { AuthGuard } from "./guards/auth.guard";
import { AuthService } from "./auth.service";

@ApiTags("Authentication")
@Controller("auth")
@ApiProduces("application/json")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Get current user profile",
    description: `
Retrieves the authenticated user's profile information including subscription details,
usage statistics, and account settings.

**Authentication**: Requires valid session cookie or Bearer token.

**Response includes**:
- User identification (ID, email, name)
- Subscription plan and limits
- Account creation date
- Monitor usage statistics
- Feature access permissions

This endpoint is commonly used by frontend applications to:
- Display user information in the dashboard
- Check subscription limits before creating monitors
- Validate authentication status
    `,
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            userId: { type: "string", example: "user_123abc" },
            email: { type: "string", example: "user@example.com" },
            name: { type: "string", example: "John Doe" },
            subscription: {
              type: "string",
              enum: ["BASIC", "PRO", "ENTERPRISE"],
              example: "PRO",
            },
            monitorLimit: { type: "number", example: 50 },
            monitorsUsed: { type: "number", example: 12 },
            createdAt: { type: "string", format: "date-time" },
            features: {
              type: "object",
              properties: {
                customDomains: { type: "boolean", example: true },
                webhookIntegrations: { type: "boolean", example: true },
                slaReporting: { type: "boolean", example: false },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Authentication required - Invalid or missing session/token",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: { type: "string", example: "Authentication required" },
        statusCode: { type: "number", example: 401 },
      },
    },
  })
  async getProfile(@Request() req) {
    return {
      success: true,
      data: req.user,
    };
  }

  @Get("verify")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Verify authentication token",
    description: `
Validates the current authentication token or session without returning user data.
Useful for checking if a user is still authenticated before making API calls.

**Use Cases**:
- Frontend apps checking auth status on page load
- API clients validating tokens before requests
- Session timeout detection
- Authentication middleware testing

**Authentication Methods**:
- **Session Cookie**: Better Auth session cookie (preferred)
- **Bearer Token**: JWT token in Authorization header

Returns success if authentication is valid, 401 if invalid or expired.
    `,
  })
  @ApiResponse({
    status: 200,
    description: "Authentication token is valid",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Token is valid" },
        authenticated: { type: "boolean", example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Invalid or expired token",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: { type: "string", example: "Invalid or expired token" },
        statusCode: { type: "number", example: 401 },
      },
    },
  })
  async verifyToken() {
    return {
      success: true,
      message: "Token is valid",
      authenticated: true,
    };
  }
}
