import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class Project {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.industry = data.industry;
    this.brand_colors = data.brand_colors;
    this.brand_fonts = data.brand_fonts;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new project
  static async create({ user_id, name, industry, brand_colors = [], brand_fonts = [], description = '' }) {
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO projects (id, user_id, name, industry, brand_colors, brand_fonts, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        id, 
        user_id, 
        name, 
        industry, 
        JSON.stringify(brand_colors), 
        JSON.stringify(brand_fonts), 
        description
      ]
    );
    
    const project = new Project(result.rows[0]);
    project.brand_colors = JSON.parse(project.brand_colors || '[]');
    project.brand_fonts = JSON.parse(project.brand_fonts || '[]');
    
    return project;
  }

  // Find project by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    const project = new Project(result.rows[0]);
    project.brand_colors = JSON.parse(project.brand_colors || '[]');
    project.brand_fonts = JSON.parse(project.brand_fonts || '[]');
    
    return project;
  }

  // Find projects by user ID
  static async findByUserId(user_id, limit = 50, offset = 0) {
    const result = await query(
      `SELECT p.*, COUNT(ga.id) as asset_count
       FROM projects p
       LEFT JOIN generated_assets ga ON p.id = ga.project_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    
    return result.rows.map(row => {
      const project = new Project(row);
      project.brand_colors = JSON.parse(project.brand_colors || '[]');
      project.brand_fonts = JSON.parse(project.brand_fonts || '[]');
      project.asset_count = parseInt(row.asset_count);
      return project;
    });
  }

  // Update project
  async update(data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (key !== 'id' && data[key] !== undefined) {
        if (key === 'brand_colors' || key === 'brand_fonts') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(data[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    fields.push(`updated_at = NOW()`);
    values.push(this.id);

    const result = await query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
      this.brand_colors = JSON.parse(this.brand_colors || '[]');
      this.brand_fonts = JSON.parse(this.brand_fonts || '[]');
    }

    return this;
  }

  // Delete project and all associated assets
  async delete() {
    // First delete all associated assets
    await query(
      'DELETE FROM generated_assets WHERE project_id = $1',
      [this.id]
    );

    // Then delete the project
    await query(
      'DELETE FROM projects WHERE id = $1',
      [this.id]
    );

    return true;
  }

  // Get project with assets
  async getWithAssets() {
    const assetsResult = await query(
      `SELECT * FROM generated_assets 
       WHERE project_id = $1 
       ORDER BY created_at DESC`,
      [this.id]
    );

    return {
      ...this.toJSON(),
      assets: assetsResult.rows.map(asset => ({
        ...asset,
        metadata: JSON.parse(asset.metadata || '{}')
      }))
    };
  }

  // Get project statistics
  async getStats() {
    const result = await query(
      `SELECT 
         COUNT(*) as total_assets,
         COUNT(CASE WHEN asset_type = 'logo' THEN 1 END) as logo_count,
         COUNT(CASE WHEN asset_type = 'ad-copy' THEN 1 END) as ad_copy_count,
         COUNT(CASE WHEN asset_type = 'social-post' THEN 1 END) as social_post_count,
         COUNT(CASE WHEN asset_type = 'content-ideas' THEN 1 END) as content_ideas_count,
         MIN(created_at) as first_asset_created,
         MAX(created_at) as last_asset_created
       FROM generated_assets 
       WHERE project_id = $1`,
      [this.id]
    );

    return {
      ...result.rows[0],
      total_assets: parseInt(result.rows[0].total_assets),
      logo_count: parseInt(result.rows[0].logo_count),
      ad_copy_count: parseInt(result.rows[0].ad_copy_count),
      social_post_count: parseInt(result.rows[0].social_post_count),
      content_ideas_count: parseInt(result.rows[0].content_ideas_count)
    };
  }

  // Check if user owns this project
  belongsToUser(user_id) {
    return this.user_id === user_id;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      name: this.name,
      industry: this.industry,
      brand_colors: this.brand_colors,
      brand_fonts: this.brand_fonts,
      description: this.description,
      created_at: this.created_at,
      updated_at: this.updated_at,
      asset_count: this.asset_count || 0
    };
  }

  // Get all projects (admin function)
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT p.*, u.email as user_email, COUNT(ga.id) as asset_count
       FROM projects p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN generated_assets ga ON p.id = ga.project_id
       GROUP BY p.id, u.email
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows.map(row => {
      const project = new Project(row);
      project.brand_colors = JSON.parse(project.brand_colors || '[]');
      project.brand_fonts = JSON.parse(project.brand_fonts || '[]');
      project.asset_count = parseInt(row.asset_count);
      project.user_email = row.user_email;
      return project;
    });
  }

  // Get project count
  static async count() {
    const result = await query('SELECT COUNT(*) as count FROM projects');
    return parseInt(result.rows[0].count);
  }

  // Search projects by name or industry
  static async search(user_id, searchTerm, limit = 20) {
    const result = await query(
      `SELECT p.*, COUNT(ga.id) as asset_count
       FROM projects p
       LEFT JOIN generated_assets ga ON p.id = ga.project_id
       WHERE p.user_id = $1 AND (
         p.name ILIKE $2 OR 
         p.industry ILIKE $2 OR 
         p.description ILIKE $2
       )
       GROUP BY p.id
       ORDER BY p.updated_at DESC
       LIMIT $3`,
      [user_id, `%${searchTerm}%`, limit]
    );
    
    return result.rows.map(row => {
      const project = new Project(row);
      project.brand_colors = JSON.parse(project.brand_colors || '[]');
      project.brand_fonts = JSON.parse(project.brand_fonts || '[]');
      project.asset_count = parseInt(row.asset_count);
      return project;
    });
  }
}
