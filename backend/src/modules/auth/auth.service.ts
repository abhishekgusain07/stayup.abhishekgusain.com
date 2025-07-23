import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { user, session } from '../../database/schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
  ) {}

  async validateUserById(userId: string) {
    try {
      const users = await this.db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      return users[0] || null;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async validateUserByEmail(email: string) {
    try {
      const users = await this.db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      return users[0] || null;
    } catch (error) {
      console.error('Error validating user by email:', error);
      return null;
    }
  }

  async validateUserBySessionToken(sessionToken: string) {
    try {
      console.log('Validating session token:', sessionToken);
      
      // First find the session
      const sessions = await this.db
        .select()
        .from(session)
        .where(eq(session.token, sessionToken))
        .limit(1);

      console.log('Found sessions:', sessions);
      
      const userSession = sessions[0];
      if (!userSession) {
        console.log('No session found for token');
        return null;
      }

      // Check if session is expired
      if (userSession.expiresAt < new Date()) {
        console.log('Session expired:', userSession.expiresAt, 'vs', new Date());
        return null;
      }

      // Get the user associated with this session
      const users = await this.db
        .select()
        .from(user)
        .where(eq(user.id, userSession.userId))
        .limit(1);

      console.log('Found user:', users[0] ? 'Yes' : 'No');
      return users[0] || null;
    } catch (error) {
      console.error('Error validating user by session token:', error);
      return null;
    }
  }
}