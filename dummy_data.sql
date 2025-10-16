-- RechargeWin Database Dummy Data
-- Run this SQL script after creating the database to populate with sample data
-- WARNING: This will clear existing data and insert fresh dummy data

USE rechargewin;

-- Clear existing data (in reverse dependency order)
-- Note: If using MySQL Workbench with safe mode, you may need to disable it
-- or run: SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Winners;
TRUNCATE TABLE Lotteries;
TRUNCATE TABLE Recharges;
TRUNCATE TABLE UserCoupons;
TRUNCATE TABLE Coupons;
TRUNCATE TABLE Users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Admin User
INSERT INTO Users (id, phone_number, password, wallet_balance, referral_code, role, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655440001', '9999999999', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Le0Kd1Y3jZQY8bC4W', 1000.00, 'ADMIN001', 'admin', NOW(), NOW());

-- Insert Regular Users (use different phone numbers to avoid conflicts)
INSERT INTO Users (id, phone_number, password, wallet_balance, referral_code, referred_by_id, role, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655440002', '9876543210', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Le0Kd1Y3jZQY8bC4W', 150.00, 'REF001', NULL, 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '9876543211', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Le0Kd1Y3jZQY8bC4W', 200.00, 'REF002', '550e8400-e29b-41d4-a716-446655440002', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', '9876543212', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Le0Kd1Y3jZQY8bC4W', 75.00, 'REF003', NULL, 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', '9876543213', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Le0Kd1Y3jZQY8bC4W', 300.00, 'REF004', '550e8400-e29b-41d4-a716-446655440003', 'user', NOW(), NOW());

-- Insert Coupons
INSERT INTO Coupons (id, code, description, discount_value, is_active, expires_at, created_by_admin_id, createdAt, updatedAt) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'WELCOME50', 'Welcome bonus for new users', 50.00, 1, '2024-12-31 23:59:59', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'FIRST100', 'First recharge bonus', 100.00, 1, '2024-12-31 23:59:59', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'LOYALTY75', 'Loyalty reward', 75.00, 1, '2024-12-31 23:59:59', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'EXPIRED20', 'Expired coupon', 20.00, 0, '2023-12-31 23:59:59', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- Insert UserCoupons
INSERT INTO UserCoupons (id, user_id, coupon_id, is_used, createdAt, updatedAt) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 0, NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 1, NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 0, NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 0, NOW(), NOW());

-- Insert Recharges
INSERT INTO Recharges (id, user_id, recharge_phone_number, operator, amount, simulated_order_id, status, createdAt, updatedAt) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '9876543210', 'Airtel', 100.00, 'ORD-2024-001', 'success', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '9876543211', 'Jio', 200.00, 'ORD-2024-002', 'success', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '9876543212', 'Vi', 150.00, 'ORD-2024-003', 'failed', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '9876543213', 'Airtel', 50.00, 'ORD-2024-004', 'success', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '9876543210', 'Jio', 300.00, 'ORD-2024-005', 'pending', NOW(), NOW());

-- Insert Lotteries (each lottery must have a unique recharge_id)
INSERT INTO Lotteries (id, user_id, recharge_id, lottery_number, status, expires_at, createdAt, updatedAt) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'ABC123DEF', 'active', DATE_ADD(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002', 'XYZ456GHI', 'active', DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440004', 'JKL789MNO', 'active', DATE_ADD(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 'PQR012STU', 'expired', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002', 'VWX345YZA', 'won', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Insert Winners
INSERT INTO Winners (id, user_id, lottery_id, prize_description, poster_image_url, is_approved, approved_by_admin_id, declared_at, createdAt, updatedAt) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440005', 'iPhone 15 Pro Max 256GB', '/uploads/winner-iphone15.jpg', 1, '550e8400-e29b-41d4-a716-446655440001', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 'Samsung Galaxy S24 Ultra', '/uploads/winner-s24.jpg', 1, '550e8400-e29b-41d4-a716-446655440001', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440003', 'MacBook Pro M3 14-inch', NULL, 0, NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- Create uploads directory (you may need to create this manually)
-- mkdir uploads