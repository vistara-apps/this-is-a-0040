import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from '../config/database.js';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Migration files in order
const migrations = [
  '001_create_users.sql',
  '002_create_projects.sql',
  '003_create_generated_assets.sql'
];

async function runMigration(filename) {
  try {
    const migrationPath = join(__dirname, '../migrations', filename);
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    logger.info(`Running migration: ${filename}`);
    await query(migrationSQL);
    logger.info(`✅ Migration completed: ${filename}`);
    
    return true;
  } catch (error) {
    logger.error(`❌ Migration failed: ${filename}`, error);
    throw error;
  }
}

async function setupDatabase() {
  try {
    logger.info('🚀 Starting database setup...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    // Create migrations tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Get already executed migrations
    const executedMigrations = await query('SELECT filename FROM migrations');
    const executedFilenames = executedMigrations.rows.map(row => row.filename);
    
    // Run pending migrations
    for (const migration of migrations) {
      if (!executedFilenames.includes(migration)) {
        await runMigration(migration);
        
        // Record migration as executed
        await query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [migration]
        );
      } else {
        logger.info(`⏭️  Skipping already executed migration: ${migration}`);
      }
    }
    
    // Verify tables were created
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    logger.info('📊 Database tables:');
    tables.rows.forEach(row => {
      logger.info(`  - ${row.table_name}`);
    });
    
    logger.info('✅ Database setup completed successfully!');
    
  } catch (error) {
    logger.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Create sample data for development
async function createSampleData() {
  try {
    logger.info('🌱 Creating sample data...');
    
    // Check if sample data already exists
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      logger.info('⏭️  Sample data already exists, skipping...');
      return;
    }
    
    // Create sample user
    const sampleUserId = 'sample-user-id-123';
    await query(`
      INSERT INTO users (id, email, password_hash, subscription_tier, generations_used, generations_limit)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      sampleUserId,
      'demo@digininja.pro',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // password: 'demo123'
      'pro',
      5,
      999999
    ]);
    
    // Create sample project
    const sampleProjectId = 'sample-project-id-123';
    await query(`
      INSERT INTO projects (id, user_id, name, industry, brand_colors, brand_fonts, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      sampleProjectId,
      sampleUserId,
      'DigiNinja Demo Project',
      'Technology',
      JSON.stringify(['#3B82F6', '#8B5CF6']),
      JSON.stringify(['Inter', 'Roboto']),
      'A sample project to demonstrate DigiNinja Pro capabilities'
    ]);
    
    // Create sample assets
    const sampleAssets = [
      {
        id: 'sample-logo-1',
        asset_type: 'logo',
        generated_content: 'Modern tech logo with blue gradient and clean typography',
        metadata: { style: 'modern', colors: ['#3B82F6', '#8B5CF6'], format: 'svg' }
      },
      {
        id: 'sample-ad-copy-1',
        asset_type: 'ad-copy',
        generated_content: 'Transform your business with AI-powered solutions. Get started today and see results in minutes, not months.',
        metadata: { platform: 'facebook', tone: 'professional', length: 'short' }
      },
      {
        id: 'sample-social-post-1',
        asset_type: 'social-post',
        generated_content: '🚀 Exciting news! We\'re launching our new AI-powered platform. Join thousands of entrepreneurs who are already transforming their businesses. #AI #Innovation #Business',
        metadata: { platform: 'twitter', hashtags: ['AI', 'Innovation', 'Business'], tone: 'excited' }
      },
      {
        id: 'sample-content-ideas-1',
        asset_type: 'content-ideas',
        generated_content: '1. "5 Ways AI is Revolutionizing Small Business"\n2. "The Future of Entrepreneurship: AI Tools Every Founder Needs"\n3. "From Idea to Launch: How AI Accelerates Startup Success"\n4. "Case Study: How We Increased Conversion Rates by 300% with AI"\n5. "The Ultimate Guide to AI-Powered Marketing for Beginners"',
        metadata: { category: 'blog-posts', industry: 'technology', count: 5 }
      }
    ];
    
    for (const asset of sampleAssets) {
      await query(`
        INSERT INTO generated_assets (id, project_id, user_id, asset_type, generated_content, metadata, version)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        asset.id,
        sampleProjectId,
        sampleUserId,
        asset.asset_type,
        asset.generated_content,
        JSON.stringify(asset.metadata),
        1
      ]);
    }
    
    logger.info('✅ Sample data created successfully!');
    logger.info('📧 Demo user: demo@digininja.pro (password: demo123)');
    
  } catch (error) {
    logger.error('❌ Sample data creation failed:', error);
  }
}

// Main execution
async function main() {
  await setupDatabase();
  
  // Create sample data in development
  if (process.env.NODE_ENV === 'development') {
    await createSampleData();
  }
  
  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { setupDatabase, createSampleData };
