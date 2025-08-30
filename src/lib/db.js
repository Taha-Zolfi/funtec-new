// --- START OF FILE src/lib/db.js ---

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      short_description TEXT,
      full_description TEXT 
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
      images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      excerpt TEXT,
      is_featured BOOLEAN DEFAULT 0,
      views INTEGER DEFAULT 0,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cabins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cabin_number INTEGER NOT NULL UNIQUE,
      image_url TEXT NOT NULL DEFAULT '/placeholder.webp',
      target_link TEXT NOT NULL DEFAULT '/'
    );

    CREATE TABLE IF NOT EXISTS timeline_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      target_link TEXT,
      sort_order INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO cabins (cabin_number) VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10);
    
    INSERT OR REPLACE INTO schema_version (version) VALUES (1);
    
    COMMIT;
  `);
}

async function initializeDb() {
  if (db) return db;
  if (initializing) return await initializing;

  initializing = (async () => {
    try {
      db = await open({
        filename: './database/database.sqlite',
        driver: sqlite3.Database
      });
      await db.exec('PRAGMA journal_mode = WAL;');
      await db.exec('PRAGMA busy_timeout = 5000;');
      console.log('Creating/updating initial schema...');
      await createInitialSchema(db);
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