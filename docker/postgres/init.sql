-- PrepPilot PostgreSQL initialization script
-- Runs on first container startup

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Ensure database exists (created by POSTGRES_DB env var)
-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE preppilot TO postgres;

-- Create read-only role for analytics (optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'preppilot_readonly') THEN
        CREATE ROLE preppilot_readonly WITH LOGIN PASSWORD 'readonly_pass';
    END IF;
END
$$;

-- Performance indexes (applied after Alembic migrations in production)
-- These are idempotent helpers for common query patterns

COMMENT ON DATABASE preppilot IS 'PrepPilot AI Interview Simulator';
