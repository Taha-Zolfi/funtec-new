// مسیر: src/lib/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;
let initializing = null;

async function setupDatabase(database) {
  // این تابع کاملاً صحیح است و نیازی به تغییر ندارد
  console.log('Setting up database schema and indexes...');
  await database.exec(`
    CREATE TABLE IF NOT EXISTS products ( id INTEGER PRIMARY KEY AUTOINCREMENT, background_video TEXT, images TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
    CREATE TABLE IF NOT EXISTS product_translations ( id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, locale TEXT NOT NULL, name TEXT NOT NULL, short_description TEXT, full_description TEXT, features TEXT, specifications TEXT, FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE, UNIQUE(product_id, locale) );
    CREATE TABLE IF NOT EXISTS news ( id INTEGER PRIMARY KEY AUTOINCREMENT, is_featured BOOLEAN DEFAULT 0, views INTEGER DEFAULT 0, image TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
    CREATE TABLE IF NOT EXISTS news_translations ( id INTEGER PRIMARY KEY AUTOINCREMENT, news_id INTEGER NOT NULL, locale TEXT NOT NULL, title TEXT NOT NULL, content TEXT, excerpt TEXT, FOREIGN KEY(news_id) REFERENCES news(id) ON DELETE CASCADE, UNIQUE(news_id, locale) );
    CREATE TABLE IF NOT EXISTS services ( id INTEGER PRIMARY KEY AUTOINCREMENT, images TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
  CREATE TABLE IF NOT EXISTS allowed_logins ( id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
  CREATE TABLE IF NOT EXISTS login_codes ( id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, code TEXT NOT NULL, expires_at DATETIME NOT NULL );
  CREATE TABLE IF NOT EXISTS allowed_phone_services ( id INTEGER PRIMARY KEY AUTOINCREMENT, allowed_login_id INTEGER NOT NULL, service_id INTEGER NOT NULL, FOREIGN KEY(allowed_login_id) REFERENCES allowed_logins(id) ON DELETE CASCADE, FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE );
    CREATE TABLE IF NOT EXISTS service_translations ( id INTEGER PRIMARY KEY AUTOINCREMENT, service_id INTEGER NOT NULL, locale TEXT NOT NULL, name TEXT NOT NULL, description TEXT, features TEXT, benefits TEXT, FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE, UNIQUE(service_id, locale) );
    CREATE TABLE IF NOT EXISTS comments ( id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, name TEXT NOT NULL, comment TEXT NOT NULL, rating INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE );
    CREATE TABLE IF NOT EXISTS cabins ( id INTEGER PRIMARY KEY AUTOINCREMENT, cabin_number INTEGER NOT NULL UNIQUE, image_url TEXT NOT NULL DEFAULT '/placeholder.webp', target_link TEXT NOT NULL DEFAULT '/' );
    CREATE TABLE IF NOT EXISTS timeline_items ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, image_url TEXT, target_link TEXT, sort_order INTEGER DEFAULT 0 );
  `);
  await database.exec(`INSERT OR IGNORE INTO cabins (cabin_number) VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10);`);
  console.log('Tables are ready.');
  console.log('Applying necessary indexes...');
  await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_product_translations_locale ON product_translations(locale);
    CREATE INDEX IF NOT EXISTS idx_news_translations_locale ON news_translations(locale);
    CREATE INDEX IF NOT EXISTS idx_service_translations_locale ON service_translations(locale);
    CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
    CREATE INDEX IF NOT EXISTS idx_news_translations_news_id ON news_translations(news_id);
    CREATE INDEX IF NOT EXISTS idx_service_translations_service_id ON service_translations(service_id);
  CREATE INDEX IF NOT EXISTS idx_allowed_phone_services_allowed_id ON allowed_phone_services(allowed_login_id);
  `);
  console.log('SUCCESS: Database setup and indexing is complete.');
}


async function initializeDb() {
  if (db) return db;
  if (initializing) return await initializing;

  initializing = (async () => {
    try {
      const dbPath = path.join(process.cwd(), 'database', 'database.sqlite');
      console.log(`Attempting to open database at absolute path: ${dbPath}`);

      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
        // [FIX] باز کردن دیتابیس در حالت فقط-خواندنی برای محیط اجرا
        flags: sqlite3.OPEN_READONLY
      });
      
      // در حالت فقط-خواندنی، این تنظیمات را نیاز نداریم چون چیزی نمی‌نویسیم
      // await db.exec('PRAGMA foreign_keys = ON;');
      // await db.exec('PRAGMA journal_mode = WAL;');
      // await db.exec('PRAGMA busy_timeout = 5000;');
      
      // در محیط فقط-خواندنی، نیازی به اجرای مایگریشن نیست چون دیتابیس از قبل ساخته شده
      // await setupDatabase(db); 
      
      console.log('Database connection is ready in READONLY mode.');
      initializing = null;
      return db;
    } catch (error) {
      console.error('FATAL: Database initialization error:', error);
      
      // اگر باز کردن در حالت Read-Only هم شکست خورد، یعنی فایل وجود ندارد
      // این بخش برای بیلد محلی لازم است تا دیتابیس ساخته شود
      if (error.code === 'SQLITE_CANTOPEN') {
        console.log('Database not found. Trying to create it for build process...');
        try {
          const dbPath = path.join(process.cwd(), 'database', 'database.sqlite');
          const writeableDb = await open({
            filename: dbPath,
            driver: sqlite3.Database // حالت پیش‌فرض (خواندن و نوشتن)
          });
          await writeableDb.exec('PRAGMA foreign_keys = ON;');
          await writeableDb.exec('PRAGMA journal_mode = WAL;');
          await writeableDb.exec('PRAGMA busy_timeout = 5000;');
          await setupDatabase(writeableDb);
          await writeableDb.close();
          console.log('Database created successfully. Please commit the new database file and redeploy.');
          // این خطا را پرتاب می‌کنیم تا بیلد متوقف شود و شما فایل جدید را کامیت کنید
          throw new Error('Database was created. Commit the database/database.sqlite file.');
        } catch (creationError) {
          console.error('FATAL: Failed to create database after read-only failed:', creationError);
          db = null;
          initializing = null;
          throw creationError;
        }
      }
      
      db = null;
      initializing = null;
      throw error;
    }
  })();
  
  return await initializing;
}

export async function getDb() {
  if (!db) return await initializeDb();
  return db;
}

// Writable connection for API routes that need INSERT/UPDATE/DELETE
export async function getWritableDb() {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'database.sqlite');
    const writable = await open({ filename: dbPath, driver: sqlite3.Database });
    await writable.exec('PRAGMA foreign_keys = ON;');
    await writable.exec('PRAGMA journal_mode = WAL;');
    await writable.exec('PRAGMA busy_timeout = 5000;');
    // Ensure base schema exists (idempotent)
    await setupDatabase(writable);
    // Ensure service_requests table exists with expected columns
    await writable.exec(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE SET NULL
      );
    `);
    return writable;
  } catch (e) {
    console.error('Failed to open writable DB:', e);
    throw e;
  }
}