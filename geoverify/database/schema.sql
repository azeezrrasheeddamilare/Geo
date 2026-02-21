-- GeoVerify Nigeria Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    username VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    total_claims INTEGER DEFAULT 0,
    fraud_score DECIMAL(3,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10,8) NOT NULL,
    location_lng DECIMAL(11,8) NOT NULL,
    radius_meters INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    max_claims INTEGER DEFAULT 1,
    nft_image_url TEXT,
    nft_metadata JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    category VARCHAR(50) -- 'conference', 'tourist', 'religious', 'business'
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_lat DECIMAL(10,8),
    verified_lng DECIMAL(11,8),
    verification_distance DECIMAL(10,2),
    nft_mint_address VARCHAR(44),
    nft_metadata JSONB,
    fraud_score DECIMAL(3,2) DEFAULT 0,
    is_valid BOOLEAN DEFAULT TRUE,
    ip_address INET,
    device_info JSONB,
    UNIQUE(user_id, event_id)
);

-- Location history for fraud detection
CREATE TABLE IF NOT EXISTS location_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accuracy DECIMAL(10,2),
    source VARCHAR(20) -- 'gps', 'wifi', 'cell'
);

-- Fraud alerts
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    claim_id UUID REFERENCES claims(id),
    alert_type VARCHAR(50), -- 'speed', 'duplicate', 'impossible'
    severity VARCHAR(20), -- 'low', 'medium', 'high'
    description TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_claims_user ON claims(user_id);
CREATE INDEX idx_claims_event ON claims(event_id);
CREATE INDEX idx_claims_claimed_at ON claims(claimed_at);
CREATE INDEX idx_location_history_user_time ON location_history(user_id, timestamp);
CREATE INDEX idx_events_active ON events(is_active, start_time, end_time);
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Views for analytics
CREATE VIEW event_stats AS
SELECT 
    e.id,
    e.name,
    COUNT(DISTINCT c.user_id) as unique_attendees,
    COUNT(c.id) as total_claims,
    AVG(c.fraud_score) as avg_fraud_score,
    MIN(c.claimed_at) as first_claim,
    MAX(c.claimed_at) as last_claim
FROM events e
LEFT JOIN claims c ON e.id = c.event_id
GROUP BY e.id, e.name;

-- Function to update user claim count
CREATE OR REPLACE FUNCTION update_user_claim_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET total_claims = total_claims + 1,
        last_active = NEW.claimed_at
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating claim count
CREATE TRIGGER after_claim_insert
    AFTER INSERT ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_user_claim_count();

-- Sample data for testing
INSERT INTO users (wallet_address, username) VALUES 
    ('GeoVerify_User_123', 'test_user_1'),
    ('GeoVerify_User_456', 'test_user_2');

INSERT INTO events (name, location_lat, location_lng, radius_meters, start_time, end_time, category) VALUES 
    ('Lagos Tech Summit 2024', 6.5244, 3.3792, 100, '2024-06-01 09:00:00', '2024-06-03 18:00:00', 'conference'),
    ('Olumo Rock Tour', 7.0156, 3.3019, 150, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'tourist'),
    ('Afro Nation Lagos', 6.4244, 3.4192, 200, '2024-12-15 12:00:00', '2024-12-17 23:00:00', 'conference');

-- Create admin user
INSERT INTO users (wallet_address, username, is_verified) VALUES 
    ('Admin_Wallet_Address', 'admin', TRUE);
