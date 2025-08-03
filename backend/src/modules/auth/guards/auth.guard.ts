import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const sessionToken = this.extractSessionTokenFromCookies(request);

    console.log("Raw cookies:", request.headers.cookie);
    console.log("Extracted session token:", sessionToken);

    if (!sessionToken) {
      throw new UnauthorizedException("Access token is required");
    }

    try {
      const user =
        await this.authService.validateUserBySessionToken(sessionToken);

      if (!user) {
        throw new UnauthorizedException("Invalid session");
      }

      // Attach user to request
      request.user = {
        userId: user.id,
        email: user.email,
        subscription: user.subscription || "BASIC",
        ...user,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired session");
    }
  }

  private extractSessionTokenFromCookies(request: any): string | undefined {
    const cookies = request.headers.cookie;
    if (!cookies) return undefined;

    const match = cookies.match(/better-auth\.session_token=([^;]+)/);
    if (!match) return undefined;

    const fullToken = decodeURIComponent(match[1]);
    // Better-auth stores only the first part (before the dot) in the database
    const sessionId = fullToken.split(".")[0];

    console.log("Full token from cookie:", fullToken);
    console.log("Session ID (first part):", sessionId);

    return sessionId;
  }
}
