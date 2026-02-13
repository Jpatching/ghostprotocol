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
            status TEXT NOT NULL DEFAULT 'active'
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
