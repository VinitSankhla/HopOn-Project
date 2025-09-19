-- HopOn Database Setup Script
-- Run this script in PostgreSQL to set up the database

-- Create database (run this as superuser)
-- CREATE DATABASE hopon_db;

-- Connect to the database
\c hopon_db;

-- Create the application user (optional, for production)
-- CREATE USER hopon_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE hopon_db TO hopon_user;

-- Enable UUID extension (if needed in future)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Tables will be automatically created by TypeORM when the application starts
-- due to synchronize: true in development mode

-- Verify database setup
SELECT current_database(), current_user, version();