// Migration script to convert old schema to new schema
import mongoose from 'mongoose';
import LostItem from './models/LostItem.js';
import FoundItem from './models/FoundItem.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lostfound';

console.log('Starting data migration...\n');

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Migrate Lost Items
    console.log('\n=== Migrating Lost Items ===');
    const lostItems = await LostItem.find({
      $or: [
        { moneyNoteType: { $exists: true, $ne: '' } },
        { moneyNotes: { $exists: true, $ne: null } }
      ]
    });

    console.log(`Found ${lostItems.length} lost items to migrate`);

    for (const item of lostItems) {
      console.log(`\nMigrating Lost Item: ${item._id}`);
      console.log(`Old data: moneyNoteType="${item.moneyNoteType}", moneyNotes=${item.moneyNotes}`);

      // Convert old format to new format
      if (item.moneyNoteType && item.moneyNotes) {
        const denominations = [{
          denomination: item.moneyNoteType,
          count: item.moneyNotes
        }];

        const totalAmount = parseInt(item.moneyNoteType.replace(/[^\d]/g, '')) * item.moneyNotes;

        // Update the document
        await LostItem.findByIdAndUpdate(item._id, {
          $set: {
            moneyDenominations: denominations,
            totalAmount: totalAmount
          },
          $unset: {
            moneyNoteType: 1,
            moneyNotes: 1
          }
        });

        console.log(`  → Converted to: ${denominations[0].denomination} × ${denominations[0].count} = ₹${totalAmount}`);
      } else {
        console.log(`  → No valid money data to migrate`);
      }
    }

    // Migrate Found Items
    console.log('\n=== Migrating Found Items ===');
    const foundItems = await FoundItem.find({
      $or: [
        { noteType: { $exists: true, $ne: '' } },
        { noteCount: { $exists: true, $ne: null } }
      ]
    });

    console.log(`Found ${foundItems.length} found items to migrate`);

    for (const item of foundItems) {
      console.log(`\nMigrating Found Item: ${item._id}`);
      console.log(`Old data: noteType="${item.noteType}", noteCount=${item.noteCount}`);

      // Convert old format to new format
      if (item.noteType && item.noteCount) {
        const denominations = [{
          denomination: item.noteType,
          count: item.noteCount
        }];

        const totalAmount = parseInt(item.noteType.replace(/[^\d]/g, '')) * item.noteCount;

        // Update the document
        await FoundItem.findByIdAndUpdate(item._id, {
          $set: {
            moneyDenominations: denominations,
            totalAmount: totalAmount
          },
          $unset: {
            noteType: 1,
            noteCount: 1
          }
        });

        console.log(`  → Converted to: ${denominations[0].denomination} × ${denominations[0].count} = ₹${totalAmount}`);
      } else {
        console.log(`  → No valid money data to migrate`);
      }
    }

    // Verify migration
    console.log('\n=== Verifying Migration ===');
    
    const remainingOldLostItems = await LostItem.find({
      $or: [
        { moneyNoteType: { $exists: true } },
        { moneyNotes: { $exists: true } }
      ]
    });
    
    const remainingOldFoundItems = await FoundItem.find({
      $or: [
        { noteType: { $exists: true } },
        { noteCount: { $exists: true } }
      ]
    });

    console.log(`Remaining old schema lost items: ${remainingOldLostItems.length}`);
    console.log(`Remaining old schema found items: ${remainingOldFoundItems.length}`);

    if (remainingOldLostItems.length === 0 && remainingOldFoundItems.length === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Some items still have old schema. Manual review may be needed.');
    }

    // Show sample of migrated data
    console.log('\n=== Sample Migrated Data ===');
    const sampleLostItems = await LostItem.find({ moneyDenominations: { $exists: true } }).limit(3);
    const sampleFoundItems = await FoundItem.find({ moneyDenominations: { $exists: true } }).limit(3);

    console.log('\nSample Lost Items:');
    sampleLostItems.forEach(item => {
      console.log(`  ${item.customId}: ${item.moneyDenominations?.map(d => `${d.denomination}×${d.count}`).join(', ')} = ₹${item.totalAmount}`);
    });

    console.log('\nSample Found Items:');
    sampleFoundItems.forEach(item => {
      console.log(`  ${item.customId}: ${item.moneyDenominations?.map(d => `${d.denomination}×${d.count}`).join(', ')} = ₹${item.totalAmount}`);
    });

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the migration
migrateData(); 