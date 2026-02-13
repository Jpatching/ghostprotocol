use crate::db::models::Subscription;
use crate::db::Database;
use tauri::State;

#[tauri::command]
pub fn get_subscriptions(db: State<'_, Database>) -> Result<Vec<Subscription>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, amount, frequency, merchant, status FROM subscriptions WHERE status = 'active'")
        .map_err(|e| e.to_string())?;

    let subscriptions = stmt
        .query_map([], |row| {
            Ok(Subscription {
                id: row.get(0)?,
                name: row.get(1)?,
                amount: row.get(2)?,
                frequency: row.get(3)?,
                merchant: row.get(4)?,
                status: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(subscriptions)
}

#[tauri::command]
pub fn get_db_status(db: State<'_, Database>) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM subscriptions", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    Ok(format!("Connected ({} subscriptions)", count))
}
