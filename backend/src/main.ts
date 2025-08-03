import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  //   Global validation pipe with Zod transforms
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get("FRONTEND_URL") || "http://localhost:3000",
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix("api");

  // Swagger API documentation
  if (configService.get("NODE_ENV") !== "production") {
    const config = new DocumentBuilder()
      .setTitle("StayUp Monitoring API")
      .setDescription(
        `
# StayUp Uptime Monitoring System API

A comprehensive uptime monitoring and alerting system that tracks website availability, 
performance metrics, and sends notifications when issues are detected.

## Features
- 🔍 **Monitor Management**: Create, update, and manage website/API monitors
- 📊 **Real-time Status**: Get current status and historical data for all monitors  
- 🚨 **Incident Tracking**: Automatic incident creation and resolution
- 📧 **Alert Recipients**: Manage email notifications for monitor failures
- 🔗 **Webhooks**: Integration endpoints for external systems
- 🌐 **Public Status Pages**: Share monitor status with your users

## Authentication
Most endpoints require authentication using Better Auth session cookies or Bearer tokens.
Use the login endpoint to authenticate and receive session cookies.

## Rate Limiting  
API endpoints are rate-limited to prevent abuse:
- General endpoints: 100 requests per minute
- Monitor creation: 10 requests per minute

## Error Handling
All responses follow a consistent format:
\`\`\`json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
\`\`\`

For errors:
\`\`\`json
{
  "success": false,
  "error": "Error description",
  "statusCode": 400
}
\`\`\`
      `,
      )
      .setVersion("1.0.0")
      .setContact(
        "StayUp Support",
        "https://stayup.abhishekgusain.com",
        "support@abhishekgusain.com",
      )
      .setLicense("MIT", "https://opensource.org/licenses/MIT")
      .addServer("http://localhost:4000/api", "Development Server")
      .addServer(
        "https://api.stayup.abhishekgusain.com/api",
        "Production Server",
      )
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "JWT-auth",
      )
      .addCookieAuth("session", {
        type: "apiKey",
        in: "cookie",
        name: "session",
        description: "Session cookie from Better Auth",
      })
      .addTag("Authentication", "Login, logout, and session management")
      .addTag("Monitors", "Monitor creation, updates, and status management")
      .addTag("Dashboard", "Overview statistics and summaries")
      .addTag("Incidents", "Incident tracking and management")
      .addTag("Alert Recipients", "Email notification management")
      .addTag("Webhooks", "External system integrations")
      .addTag("Public Status", "Public status pages and website information")
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    });

    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
      customSiteTitle: "StayUp API Documentation",
      customfavIcon: "/favicon.ico",
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .info .title { color: #3b82f6 }
      `,
    });
  }

  const port = configService.get("PORT") || 4000;
  await app.listen(port);

  console.log(`🚀 StayUp Backend running on: http://localhost:${port}`);
  console.log(`📖 API Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
