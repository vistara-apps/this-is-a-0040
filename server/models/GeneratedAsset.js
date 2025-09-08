import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class GeneratedAsset {
  constructor(data) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.user_id = data.user_id;
    this.asset_type = data.asset_type;
    this.generated_content = data.generated_content;
    this.metadata = data.metadata;
    this.version = data.version || 1;
    this.image_url = data.image_url;
    this.is_favorite = data.is_favorite || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new generated asset
  static async create({ 
    project_id, 
    user_id, 
    asset_type, 
    generated_content, 
    metadata = {}, 
    image_url = null 
  }) {
    const id = uuidv4();
    
    // Get the next version number for this asset type in this project
    const versionResult = await query(
      'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM generated_assets WHERE project_id = $1 AND asset_type = $2',
      [project_id, asset_type]
    );
    const version = versionResult.rows[0].next_version;
    
    const result = await query(
      `INSERT INTO generated_assets (
        id, project_id, user_id, asset_type, generated_content, 
        metadata, version, image_url, created_at, updated_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        id, 
        project_id, 
        user_id, 
        asset_type, 
        generated_content, 
        JSON.stringify(metadata), 
        version,
        image_url
      ]
    );
    
    const asset = new GeneratedAsset(result.rows[0]);
    asset.metadata = JSON.parse(asset.metadata || '{}');
    
    return asset;
  }

  // Find asset by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM generated_assets WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    const asset = new GeneratedAsset(result.rows[0]);
    asset.metadata = JSON.parse(asset.metadata || '{}');
    
    return asset;
  }

  // Find assets by project ID
  static async findByProjectId(project_id, limit = 50, offset = 0) {
    const result = await query(
      `SELECT * FROM generated_assets 
       WHERE project_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [project_id, limit, offset]
    );
    
    return result.rows.map(row => {
      const asset = new GeneratedAsset(row);
      asset.metadata = JSON.parse(asset.metadata || '{}');
      return asset;
    });
  }

  // Find assets by user ID
  static async findByUserId(user_id, limit = 50, offset = 0) {
    const result = await query(
      `SELECT ga.*, p.name as project_name 
       FROM generated_assets ga
       JOIN projects p ON ga.project_id = p.id
       WHERE ga.user_id = $1 
       ORDER BY ga.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    
    return result.rows.map(row => {
      const asset = new GeneratedAsset(row);
      asset.metadata = JSON.parse(asset.metadata || '{}');
      asset.project_name = row.project_name;
      return asset;
    });
  }

  // Find assets by type
  static async findByType(user_id, asset_type, limit = 20, offset = 0) {
    const result = await query(
      `SELECT ga.*, p.name as project_name 
       FROM generated_assets ga
       JOIN projects p ON ga.project_id = p.id
       WHERE ga.user_id = $1 AND ga.asset_type = $2
       ORDER BY ga.created_at DESC 
       LIMIT $3 OFFSET $4`,
      [user_id, asset_type, limit, offset]
    );
    
    return result.rows.map(row => {
      const asset = new GeneratedAsset(row);
      asset.metadata = JSON.parse(asset.metadata || '{}');
      asset.project_name = row.project_name;
      return asset;
    });
  }

  // Update asset
  async update(data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (key !== 'id' && data[key] !== undefined) {
        if (key === 'metadata') {
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
      `UPDATE generated_assets SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
      this.metadata = JSON.parse(this.metadata || '{}');
    }

    return this;
  }

  // Toggle favorite status
  async toggleFavorite() {
    await this.update({ is_favorite: !this.is_favorite });
    return this;
  }

  // Delete asset
  async delete() {
    await query(
      'DELETE FROM generated_assets WHERE id = $1',
      [this.id]
    );

    return true;
  }

  // Check if user owns this asset
  belongsToUser(user_id) {
    return this.user_id === user_id;
  }

  // Get asset with project info
  async getWithProject() {
    const result = await query(
      `SELECT ga.*, p.name as project_name, p.industry as project_industry
       FROM generated_assets ga
       JOIN projects p ON ga.project_id = p.id
       WHERE ga.id = $1`,
      [this.id]
    );

    if (result.rows.length === 0) return null;

    const asset = new GeneratedAsset(result.rows[0]);
    asset.metadata = JSON.parse(asset.metadata || '{}');
    asset.project_name = result.rows[0].project_name;
    asset.project_industry = result.rows[0].project_industry;

    return asset;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      project_id: this.project_id,
      user_id: this.user_id,
      asset_type: this.asset_type,
      generated_content: this.generated_content,
      metadata: this.metadata,
      version: this.version,
      image_url: this.image_url,
      is_favorite: this.is_favorite,
      created_at: this.created_at,
      updated_at: this.updated_at,
      project_name: this.project_name,
      project_industry: this.project_industry
    };
  }

  // Get user's favorite assets
  static async findFavorites(user_id, limit = 20, offset = 0) {
    const result = await query(
      `SELECT ga.*, p.name as project_name 
       FROM generated_assets ga
       JOIN projects p ON ga.project_id = p.id
       WHERE ga.user_id = $1 AND ga.is_favorite = true
       ORDER BY ga.updated_at DESC 
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    
    return result.rows.map(row => {
      const asset = new GeneratedAsset(row);
      asset.metadata = JSON.parse(asset.metadata || '{}');
      asset.project_name = row.project_name;
      return asset;
    });
  }

  // Get asset statistics for a user
  static async getUserStats(user_id) {
    const result = await query(
      `SELECT 
         COUNT(*) as total_assets,
         COUNT(CASE WHEN asset_type = 'logo' THEN 1 END) as logo_count,
         COUNT(CASE WHEN asset_type = 'ad-copy' THEN 1 END) as ad_copy_count,
         COUNT(CASE WHEN asset_type = 'social-post' THEN 1 END) as social_post_count,
         COUNT(CASE WHEN asset_type = 'content-ideas' THEN 1 END) as content_ideas_count,
         COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorite_count,
         MIN(created_at) as first_asset_created,
         MAX(created_at) as last_asset_created
       FROM generated_assets 
       WHERE user_id = $1`,
      [user_id]
    );

    return {
      ...result.rows[0],
      total_assets: parseInt(result.rows[0].total_assets),
      logo_count: parseInt(result.rows[0].logo_count),
      ad_copy_count: parseInt(result.rows[0].ad_copy_count),
      social_post_count: parseInt(result.rows[0].social_post_count),
      content_ideas_count: parseInt(result.rows[0].content_ideas_count),
      favorite_count: parseInt(result.rows[0].favorite_count)
    };
  }

  // Search assets by content
  static async search(user_id, searchTerm, limit = 20) {
    const result = await query(
      `SELECT ga.*, p.name as project_name 
       FROM generated_assets ga
       JOIN projects p ON ga.project_id = p.id
       WHERE ga.user_id = $1 AND ga.generated_content ILIKE $2
       ORDER BY ga.created_at DESC 
       LIMIT $3`,
      [user_id, `%${searchTerm}%`, limit]
    );
    
    return result.rows.map(row => {
      const asset = new GeneratedAsset(row);
      asset.metadata = JSON.parse(asset.metadata || '{}');
      asset.project_name = row.project_name;
      return asset;
    });
  }

  // Get all assets (admin function)
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT ga.*, p.name as project_name, u.email as user_email
       FROM generated_assets ga
       JOIN projects p ON ga.project_id = p.id
       JOIN users u ON ga.user_id = u.id
       ORDER BY ga.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows.map(row => {
      const asset = new GeneratedAsset(row);
      asset.metadata = JSON.parse(asset.metadata || '{}');
      asset.project_name = row.project_name;
      asset.user_email = row.user_email;
      return asset;
    });
  }

  // Get asset count
  static async count() {
    const result = await query('SELECT COUNT(*) as count FROM generated_assets');
    return parseInt(result.rows[0].count);
  }
}
