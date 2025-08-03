#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 
 * Script to sync shared types from master file to all applications
 * This maintains consistency across frontend, backend, and lambda apps
 */

const MASTER_TYPES_FILE = path.join(__dirname, '../shared/types.ts');
const TARGET_LOCATIONS = [
  path.join(__dirname, '../frontendui/src/types/shared.ts'),
  path.join(__dirname, '../backend/src/types/shared.ts'),
  path.join(__dirname, '../lambda/src/types/shared.ts')
];

function syncTypes() {
  console.log('🔄 Syncing shared types...');
  
  // Check if master file exists
  if (!fs.existsSync(MASTER_TYPES_FILE)) {
    console.error('❌ Master types file not found:', MASTER_TYPES_FILE);
    process.exit(1);
  }

  // Read master types file
  const masterContent = fs.readFileSync(MASTER_TYPES_FILE, 'utf8');
  
  // Copy to all target locations
  let syncCount = 0;
  for (const target of TARGET_LOCATIONS) {
    try {
      // Ensure target directory exists
      const targetDir = path.dirname(target);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(target, masterContent);
      console.log('✅ Synced to:', target);
      syncCount++;
    } catch (error) {
      console.error('❌ Failed to sync to:', target, error.message);
    }
  }
  
  console.log(`🎉 Successfully synced types to ${syncCount}/${TARGET_LOCATIONS.length} locations`);
}

if (require.main === module) {
  syncTypes();
}

module.exports = { syncTypes };