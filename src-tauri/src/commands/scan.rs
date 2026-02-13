use crate::db::Database;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanResult {
    pub subscriptions_found: i64,
    pub total_monthly: f64,
    pub total_annual: f64,
}

/// Simulate a transaction scan - in production this would use Plaid API + Claude AI
#[tauri::command]
pub fn scan_transactions(db: State<'_, Database>) -> Result<ScanResult, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Check if we already have subscriptions
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM subscriptions", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    if count == 0 {
        // Simulate AI detection - in production, Claude API analyzes Plaid transactions
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
        )
        .map_err(|e| e.to_string())?;
    }

    let total: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE status = 'active'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let active_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM subscriptions WHERE status = 'active'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(ScanResult {
        subscriptions_found: active_count,
        total_monthly: total,
        total_annual: total * 12.0,
    })
}

/// Get detailed stats for the header
#[tauri::command]
pub fn get_stats(db: State<'_, Database>) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let active: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM subscriptions WHERE status = 'active'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let cancelled: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM subscriptions WHERE status = 'cancelled'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let active_total: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE status = 'active'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let saved_total: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE status = 'cancelled'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let tx_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM subscriptions WHERE cancel_tx IS NOT NULL",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "active_count": active,
        "cancelled_count": cancelled,
        "active_monthly": active_total,
        "saved_monthly": saved_total,
        "saved_annual": saved_total * 12.0,
        "solana_tx_count": tx_count,
    })
    .to_string())
}
