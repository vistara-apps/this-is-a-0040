import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.subscription_tier = data.subscription_tier || 'free';
    this.generations_used = data.generations_used || 0;
    this.generations_limit = data.generations_limit || 3;
    this.stripe_customer_id = data.stripe_customer_id;
    this.stripe_subscription_id = data.stripe_subscription_id;
    this.email_verified = data.email_verified || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create({ email, password }) {
    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO users (id, email, password_hash, subscription_tier, generations_used, generations_limit, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, email, password_hash, 'free', 0, 3]
    );
    
    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by Stripe customer ID
  static async findByStripeCustomerId(stripeCustomerId) {
    const result = await query(
      'SELECT * FROM users WHERE stripe_customer_id = $1',
      [stripeCustomerId]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Verify password
  async verifyPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  // Update user
  async update(data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (key !== 'id' && data[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    fields.push(`updated_at = NOW()`);
    values.push(this.id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }

    return this;
  }

  // Update subscription
  async updateSubscription(tier, stripeCustomerId = null, stripeSubscriptionId = null) {
    const generationsLimit = tier === 'free' ? 3 : Infinity;
    
    await this.update({
      subscription_tier: tier,
      generations_limit: generationsLimit,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId
    });

    return this;
  }

  // Increment generations used
  async incrementGenerations() {
    await this.update({
      generations_used: this.generations_used + 1
    });

    return this;
  }

  // Reset monthly generations (for free tier)
  async resetGenerations() {
    await this.update({
      generations_used: 0
    });

    return this;
  }

  // Check if user can generate more assets
  canGenerate() {
    if (this.subscription_tier !== 'free') return true;
    return this.generations_used < this.generations_limit;
  }

  // Get user's remaining generations
  getRemainingGenerations() {
    if (this.subscription_tier !== 'free') return Infinity;
    return Math.max(0, this.generations_limit - this.generations_used);
  }

  // Convert to JSON (excluding sensitive data)
  toJSON() {
    const { password_hash, ...userData } = this;
    return {
      ...userData,
      remaining_generations: this.getRemainingGenerations(),
      can_generate: this.canGenerate()
    };
  }

  // Get all users (admin function)
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    return result.rows.map(row => new User(row));
  }

  // Get user count
  static async count() {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }

  // Delete user (soft delete by updating email)
  async delete() {
    const deletedEmail = `deleted_${Date.now()}_${this.email}`;
    await this.update({
      email: deletedEmail,
      password_hash: null,
      stripe_customer_id: null,
      stripe_subscription_id: null
    });

    return this;
  }
}
