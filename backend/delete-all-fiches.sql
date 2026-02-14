-- Script to delete all fiches prestation from the database
-- Warning: This will delete all fiches from the fiches_prestation table
-- This is a destructive operation and cannot be undone

-- Disable foreign key constraints to avoid errors (optional but recommended for delete operations)
SET REFERENTIAL_INTEGRITY FALSE;

-- Delete all fiches prestation
DELETE FROM fiches_prestation;

-- Reset the auto-increment counter (H2 specific)
ALTER TABLE fiches_prestation ALTER COLUMN id RESTART WITH 1;

-- Enable foreign key constraints again
SET REFERENTIAL_INTEGRITY TRUE;

-- Verify the deletion
SELECT COUNT(*) as remaining_fiches FROM fiches_prestation;

-- Output success message
SELECT '✅ All fiches prestation have been deleted' as message;
