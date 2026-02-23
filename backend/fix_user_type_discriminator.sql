-- Fix the discriminator value in users table
-- Convert 'Prestataire' to 'PRESTATAIRE' to match JPA mapping
UPDATE users 
SET user_type = 'PRESTATAIRE'
WHERE user_type = 'Prestataire';

-- Verify the fix
SELECT user_type, COUNT(*) as count
FROM users 
GROUP BY user_type;

-- Check if there are any other discriminator values that need to be fixed
SELECT DISTINCT user_type
FROM users;
