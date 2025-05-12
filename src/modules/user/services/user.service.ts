import { query } from '../../../config/database';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';
import bcrypt from 'bcrypt';
import { UserRole } from '../../../shared/enums';
import Env from '../../../shared/utils/env';

/**
 * User service
 */
export class UserService {
  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    const result = await query(
      'SELECT id, name, email, role, created_at as "createdAt", updated_at as "updatedAt" FROM users'
    );
    return result.rows;
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, name, email, role, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
      [id]
    );
    return result.rowCount ? result.rows[0] : null;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT id, name, email, password, role, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1',
      [email]
    );
    return result.rowCount ? result.rows[0] : null;
  }

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password, role = UserRole.USER } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = Env.get<number>('SALT_ROUNDS');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at as "createdAt", updated_at as "updatedAt"',
      [name, email, hashedPassword, role]
    );

    return result.rows[0];
  }

  /**
   * Update a user
   */
  async update(id: string, updateData: Partial<CreateUserDto>): Promise<User | null> {
    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return null;
    }

    // Prepare update fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.name) {
      updates.push(`name = $${paramCount}`);
      values.push(updateData.name);
      paramCount++;
    }

    if (updateData.email) {
      updates.push(`email = $${paramCount}`);
      values.push(updateData.email);
      paramCount++;
    }

    if (updateData.password) {
      const saltRounds = Env.get<number>('SALT_ROUNDS');
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (updateData.role) {
      updates.push(`role = $${paramCount}`);
      values.push(updateData.role);
      paramCount++;
    }

    if (updates.length === 0) {
      return existingUser;
    }

    updates.push(`updated_at = NOW()`);

    // Add id to values array
    values.push(id);

    const result = await query(
      `UPDATE users SET ${updates.join(
        ', '
      )} WHERE id = $${paramCount} RETURNING id, name, email, role, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );

    return result.rows[0];
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return false;
    }

    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return !!result.rowCount && result.rowCount > 0;
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
} 
