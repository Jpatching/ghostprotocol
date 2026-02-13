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
        conn.execute_batch(
            "
            INSERT INTO subscriptions (name, amount, frequency, merchant, status) VALUES
                ('Netflix Premium', 22.99, 'monthly', 'Netflix Inc.', 'active'),
                ('Spotify Family', 16.99, 'monthly', 'Spotify AB', 'active'),
                ('Adobe Creative Cloud', 54.99, 'monthly', 'Adobe Systems', 'active'),
                ('ChatGPT Plus', 20.00, 'monthly', 'OpenAI', 'active'),
                ('Gym Membership', 49.99, 'monthly', 'Planet Fitness', 'active'),
                ('iCloud+ 200GB', 2.99, 'monthly', 'Apple Inc.', 'active'),
                ('YouTube Premium', 13.99, 'monthly', 'Google LLC', 'active');
            ",
        )?;
    }

    Ok(())
}
