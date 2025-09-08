-- Create generated_assets table
CREATE TABLE IF NOT EXISTS generated_assets (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('logo', 'ad-copy', 'social-post', 'content-ideas')),
    generated_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    image_url VARCHAR(500),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_assets_project_id ON generated_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_assets_user_id ON generated_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_assets_asset_type ON generated_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_generated_assets_created_at ON generated_assets(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_assets_updated_at ON generated_assets(updated_at);
CREATE INDEX IF NOT EXISTS idx_generated_assets_is_favorite ON generated_assets(is_favorite);
CREATE INDEX IF NOT EXISTS idx_generated_assets_version ON generated_assets(version);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_generated_assets_user_type ON generated_assets(user_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_generated_assets_project_type ON generated_assets(project_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_generated_assets_user_favorite ON generated_assets(user_id, is_favorite);

-- Create GIN index for JSONB metadata column
CREATE INDEX IF NOT EXISTS idx_generated_assets_metadata ON generated_assets USING GIN (metadata);

-- Create full-text search index for generated content
CREATE INDEX IF NOT EXISTS idx_generated_assets_content_search ON generated_assets USING GIN (to_tsvector('english', generated_content));

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_generated_assets_updated_at 
    BEFORE UPDATE ON generated_assets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
