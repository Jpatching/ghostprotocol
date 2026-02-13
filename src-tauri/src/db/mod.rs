pub mod models;
pub mod schema;

use rusqlite::Connection;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_data_dir: &std::path::Path) -> Result<Self, Box<dyn std::error::Error>> {
        std::fs::create_dir_all(app_data_dir)?;
        let db_path = app_data_dir.join("ghost_protocol.db");
        let conn = Connection::open(&db_path)?;

        // Enable WAL mode for better concurrent read performance
        conn.pragma_update(None, "journal_mode", "WAL")?;

        // Initialize tables
        schema::initialize_database(&conn)?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}
