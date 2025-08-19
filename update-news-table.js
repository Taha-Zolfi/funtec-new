import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function updateNewsTable() {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        // Add new columns one by one
        const alterCommands = [
            "ALTER TABLE news ADD COLUMN excerpt TEXT;",
            "ALTER TABLE news ADD COLUMN description TEXT;",
            "ALTER TABLE news ADD COLUMN author TEXT;",
            "ALTER TABLE news ADD COLUMN category TEXT;"
        ];

        console.log('Adding new columns to news table...');
        for (const command of alterCommands) {
            try {
                await db.exec(command);
                console.log('Successfully executed:', command);
            } catch (err) {
                // If column already exists, just continue
                if (!err.message.includes('duplicate column')) {
                    console.error('Error executing:', command, err);
                }
            }
        }

        console.log('\nVerifying news table schema:');
        const schema = await db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='news';");
        console.log(schema);

        console.log('\nCurrent news content:');
        const news = await db.all('SELECT * FROM news;');
        console.log(JSON.stringify(news, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

updateNewsTable();
