use crate::db::Database;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKeyEntry {
    pub service: String,
    pub has_key: bool,
    pub created_at: Option<String>,
}

#[tauri::command]
pub fn get_api_keys(db: State<'_, Database>) -> Result<Vec<ApiKeyEntry>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let services = vec!["claude", "plaid", "solana_rpc"];
    let mut entries = Vec::new();

    for service in services {
        let result: Option<String> = conn
            .query_row(
                "SELECT created_at FROM api_keys WHERE service = ?1",
                [service],
                |row| row.get(0),
            )
            .ok();

        entries.push(ApiKeyEntry {
            service: service.to_string(),
            has_key: result.is_some(),
            created_at: result,
        });
    }

    Ok(entries)
}

#[tauri::command]
pub fn save_api_key(
    db: State<'_, Database>,
    service: String,
    key: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO api_keys (service, encrypted_key, created_at) VALUES (?1, ?2, datetime('now'))",
        rusqlite::params![service, key],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_api_key(db: State<'_, Database>, service: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM api_keys WHERE service = ?1", [&service])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActivityEntry {
    pub id: i64,
    pub action: String,
    pub detail: String,
    pub timestamp: String,
}

#[tauri::command]
pub fn get_activity_log(db: State<'_, Database>) -> Result<Vec<ActivityEntry>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Build activity from subscriptions data
    let mut activities: Vec<ActivityEntry> = Vec::new();
    let mut id_counter = 1i64;

    // Add detection event
    let sub_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM subscriptions", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    if sub_count > 0 {
        let total: f64 = conn
            .query_row(
                "SELECT COALESCE(SUM(amount), 0) FROM subscriptions",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        activities.push(ActivityEntry {
            id: id_counter,
            action: "scan_complete".to_string(),
            detail: format!(
                "Detected {} subscriptions totaling ${:.2}/month",
                sub_count, total
            ),
            timestamp: "On first launch".to_string(),
        });
        id_counter += 1;
    }

    // Add cancellation events
    let mut stmt = conn
        .prepare("SELECT name, amount, cancelled_at, cancel_tx FROM subscriptions WHERE status = 'cancelled' ORDER BY cancelled_at DESC")
        .map_err(|e| e.to_string())?;

    let cancelled: Vec<(String, f64, Option<String>, Option<String>)> = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, f64>(1)?,
                row.get::<_, Option<String>>(2)?,
                row.get::<_, Option<String>>(3)?,
            ))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    for (name, amount, cancelled_at, cancel_tx) in cancelled {
        let tx_info = if cancel_tx.is_some() {
            " (on-chain proof recorded)"
        } else {
            ""
        };
        activities.push(ActivityEntry {
            id: id_counter,
            action: "subscription_cancelled".to_string(),
            detail: format!(
                "Cancelled {} — saving ${:.2}/month{}",
                name, amount, tx_info
            ),
            timestamp: cancelled_at.unwrap_or_else(|| "Unknown".to_string()),
        });
        id_counter += 1;
    }

    Ok(activities)
}
