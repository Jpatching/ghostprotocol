use rusqlite::Connection;

pub fn initialize_database(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            frequency TEXT NOT NULL DEFAULT 'monthly',
            merchant TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'active',
            cancelled_at TEXT,
            cancel_tx TEXT
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            input_data TEXT,
            output_data TEXT
        );

        CREATE TABLE IF NOT EXISTS api_keys (
            service TEXT PRIMARY KEY,
            encrypted_key TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        ",
    )?;
    Ok(())
}

pub fn seed_demo_data(conn: &Connection) -> Result<(), rusqlite::Error> {
    let count: i64 =
        conn.query_row("SELECT COUNT(*) FROM subscriptions", [], |row| row.get(0))?;

    if count == 0 {
        // Insert all candidates into a temp table, then pick 6-8 randomly
        conn.execute_batch(
            "
            CREATE TEMP TABLE seed_pool (name TEXT, amount REAL, frequency TEXT, merchant TEXT);
            INSERT INTO seed_pool VALUES
                ('Netflix Premium', 22.99, 'monthly', 'Netflix Inc.'),
                ('Spotify Family', 16.99, 'monthly', 'Spotify AB'),
                ('Adobe Creative Cloud', 54.99, 'monthly', 'Adobe Systems'),
                ('ChatGPT Plus', 20.00, 'monthly', 'OpenAI'),
                ('Gym Membership', 49.99, 'monthly', 'Planet Fitness'),
                ('iCloud+ 200GB', 2.99, 'monthly', 'Apple Inc.'),
                ('YouTube Premium', 13.99, 'monthly', 'Google LLC'),
                ('AWS Developer Tools', 29.00, 'monthly', 'Amazon Web Services'),
                ('Notion Plus', 10.00, 'monthly', 'Notion Labs'),
                ('Slack Pro', 8.75, 'monthly', 'Salesforce'),
                ('Hulu (No Ads)', 17.99, 'monthly', 'Hulu LLC'),
                ('NYT Digital', 4.25, 'monthly', 'The New York Times');

            INSERT INTO subscriptions (name, amount, frequency, merchant, status)
                SELECT name, amount, frequency, merchant, 'active'
                FROM seed_pool ORDER BY RANDOM() LIMIT (ABS(RANDOM()) % 3 + 6);

            DROP TABLE seed_pool;
            ",
        )?;
    }

    Ok(())
}
