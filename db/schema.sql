
-- GlobalPath Database Schema
-- PostgreSQL 16+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================
-- USERS & AUTH
-- =====================
CREATE TYPE user_role AS ENUM ('student', 'mentor', 'employer', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL CHECK (length(password_hash) >= 60),
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    verification_status verification_status DEFAULT 'pending',
    avatar_url TEXT,
    country_of_origin VARCHAR(100),
    country_of_residence VARCHAR(100),
    bio TEXT,
    trust_score INT DEFAULT 0,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_country ON users(country_of_residence);

-- Mentor extended profile
CREATE TABLE mentor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    expertise_areas TEXT[],
    years_abroad INT,
    languages_spoken TEXT[],
    universities_attended TEXT[],
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    available_for_mentoring BOOLEAN DEFAULT TRUE
);

-- Employer extended profile
CREATE TABLE employer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_website TEXT,
    company_size VARCHAR(50),
    industry VARCHAR(100),
    sponsors_visas BOOLEAN DEFAULT FALSE,
    visa_sponsorship_countries TEXT[]
);

-- =====================
-- OPPORTUNITY LISTINGS
-- =====================
CREATE TYPE opportunity_type AS ENUM ('scholarship', 'work_study', 'exchange', 'internship', 'job');

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    type opportunity_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    country VARCHAR(100) NOT NULL,
    institution VARCHAR(255),
    field_of_study VARCHAR(255),
    funding_amount NUMERIC(12, 2),
    currency VARCHAR(10),
    eligibility TEXT,
    application_url TEXT,
    deadline DATE,
    sponsors_visa BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_country ON opportunities(country);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_opportunities_search ON opportunities USING gin(title gin_trgm_ops);

-- =====================
-- HOUSING MARKETPLACE
-- =====================
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'rented', 'archived');

CREATE TABLE housing_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    rent_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    rent_period VARCHAR(20) DEFAULT 'month',
    bedrooms INT,
    bathrooms INT,
    furnished BOOLEAN DEFAULT FALSE,
    near_university VARCHAR(255),
    photos TEXT[],
    virtual_tour_url TEXT,
    status listing_status DEFAULT 'pending_review',
    rating NUMERIC(3, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_housing_city ON housing_listings(city, country);
CREATE INDEX idx_housing_status ON housing_listings(status);

CREATE TABLE roommate_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    budget_min NUMERIC(10, 2),
    budget_max NUMERIC(10, 2),
    preferred_city VARCHAR(100),
    lifestyle TEXT[],
    smoking BOOLEAN DEFAULT FALSE,
    pets BOOLEAN DEFAULT FALSE,
    looking_for_roommate BOOLEAN DEFAULT TRUE
);

-- =====================
-- FORUMS & Q&A
-- =====================
CREATE TABLE forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    post_count INT DEFAULT 0
);

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES forum_categories(id),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    tags TEXT[],
    upvotes INT DEFAULT 0,
    answer_count INT DEFAULT 0,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    is_accepted_answer BOOLEAN DEFAULT FALSE,
    is_verified_mentor_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PRIVATE MESSAGING
-- =====================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_a UUID REFERENCES users(id) ON DELETE CASCADE,
    participant_b UUID REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_a, participant_b)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- =====================
-- AI ASSISTANT
-- =====================
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    origin_country VARCHAR(100),
    destination_country VARCHAR(100),
    visa_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    sources JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE visa_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    origin_country VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    visa_type VARCHAR(100) NOT NULL,
    items JSONB NOT NULL,
    completed_items TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- MODERATION & REPORTS
-- =====================
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id),
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status report_status DEFAULT 'pending',
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scam_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    scam_type VARCHAR(100),
    affected_countries TEXT[],
    upvotes INT DEFAULT 0,
    verified_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- SEED DATA
-- =====================
INSERT INTO forum_categories (name, slug, description, icon) VALUES
    ('Visa & Immigration', 'visa-immigration', 'Questions about visas, permits, and immigration', 'passport'),
    ('Scholarships', 'scholarships', 'Funding opportunities and applications', 'award'),
    ('Housing', 'housing', 'Finding accommodation abroad', 'home'),
    ('Career & Jobs', 'careers', 'Internships, jobs, and work permits', 'briefcase'),
    ('Cultural Integration', 'culture', 'Adapting to life in a new country', 'globe'),
    ('Banking & Finance', 'finance', 'Setting up accounts, transfers, taxes', 'dollar');
