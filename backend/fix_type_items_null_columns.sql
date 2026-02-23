-- Fix for type_items table: Set default values for NULL min_items and max_items columns
-- This script must be run BEFORE Hibernate tries to add NOT NULL constraints

-- First, set default value (0) for any NULL max_items values
UPDATE type_items SET max_items = 0 WHERE max_items IS NULL;

-- Set default value (0) for any NULL min_items values  
UPDATE type_items SET min_items = 0 WHERE min_items IS NULL;

-- Verify the update
SELECT id, numero, min_items, max_items FROM type_items WHERE min_items IS NULL OR max_items IS NULL;

-- Show current state
SELECT COUNT(*) as total_rows, 
       COUNT(min_items) as min_items_set, 
       COUNT(max_items) as max_items_set 
FROM type_items;

