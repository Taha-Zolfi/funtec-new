import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;
let initializing = null; // promise to serialize initialization

async function createInitialSchema(database) {
  await database.exec(`
    BEGIN TRANSACTION;
    
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      background_video TEXT,
      features TEXT,
      images TEXT,
      specifications TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      name TEXT NOT NULL,
      comment TEXT NOT NULL,
      rating INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      features TEXT,
      benefits TEXT,
      images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      excerpt TEXT,
      description TEXT,
      author TEXT,
      category TEXT,
      is_featured BOOLEAN DEFAULT 0,
      views INTEGER DEFAULT 0,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR REPLACE INTO schema_version (version) VALUES (1);
    
    COMMIT;
  `);
}

async function initializeDb() {
  if (db) return db;

  if (initializing) {
    // Wait for in-flight initialization
    return await initializing;
  }

  initializing = (async () => {
    try {
      // Open database connection
      db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
      });

      // Reduce lock contention and allow concurrent readers
      try {
        await db.exec('PRAGMA journal_mode = WAL;');
        await db.exec('PRAGMA busy_timeout = 5000;');
      } catch (pragErr) {
        console.warn('Failed to set PRAGMA settings:', pragErr);
      }

      console.log('Creating initial schema...');
      await createInitialSchema(db);

      // Check for required columns and add missing ones safely
      const tableInfo = await db.all('PRAGMA table_info(products)');
      const cols = tableInfo.map(c => c.name);

      if (!cols.includes('background_video')) {
        console.log('Adding background_video column to products table');
        await db.exec('ALTER TABLE products ADD COLUMN background_video TEXT');
      }

      if (!cols.includes('specifications')) {
        console.log('Adding specifications column to products table');
        await db.exec('ALTER TABLE products ADD COLUMN specifications TEXT');
      }

      if (!cols.includes('short_description')) {
        console.log('Adding short_description column to products table');
        await db.exec('ALTER TABLE products ADD COLUMN short_description TEXT');
      }

      if (!cols.includes('full_description')) {
        console.log('Adding full_description column to products table');
        await db.exec('ALTER TABLE products ADD COLUMN full_description TEXT');
      }

      console.log('Database initialization completed');
      initializing = null;
      return db;
    } catch (error) {
      console.error('Database initialization error:', error);
      db = null;
      initializing = null;
      throw error;
    }
  })();

  return await initializing;
}

export async function getDb() {
  if (!db) {
    return await initializeDb();
  }
  return db;
}
