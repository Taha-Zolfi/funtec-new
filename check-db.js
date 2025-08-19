import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function checkDatabase() {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        console.log('Checking news table schema:');
        const schema = await db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='news';");
        console.log(schema);

        console.log('\nChecking news table content:');
        const news = await db.all('SELECT * FROM news;');
        console.log(JSON.stringify(news, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
