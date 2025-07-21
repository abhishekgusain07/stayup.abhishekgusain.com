import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { user } from '../../database/schema';

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
}