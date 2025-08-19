import { getDb } from './src/lib/db.js';

async function updateProduct() {
  const db = await getDb();
  try {
    // Check if columns exist
    const columns = await db.all('PRAGMA table_info(products)');
    const hasShortDesc = columns.some(col => col.name === 'short_description');
    const hasFullDesc = columns.some(col => col.name === 'full_description');
    
    if (!hasShortDesc) {
      await db.exec('ALTER TABLE products ADD COLUMN short_description TEXT');
    }
    if (!hasFullDesc) {
      await db.exec('ALTER TABLE products ADD COLUMN full_description TEXT');
    }
    console.log('Successfully added new description columns');
  } catch (error) {
    console.error('Error updating products table:', error);
  }
}

updateProduct();
