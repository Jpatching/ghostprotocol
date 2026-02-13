use crate::db::models::{CancelResult, Subscription};
use crate::db::Database;
use tauri::State;

#[tauri::command]
pub fn get_subscriptions(db: State<'_, Database>) -> Result<Vec<Subscription>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, amount, frequency, merchant, status, cancelled_at, cancel_tx FROM subscriptions ORDER BY status ASC, id ASC")
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
                cancelled_at: row.get(6)?,
                cancel_tx: row.get(7)?,
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

    Ok(format!(
        "Connected ({} active, {} cancelled)",
        active, cancelled
    ))
}

#[tauri::command]
pub fn cancel_subscription(db: State<'_, Database>, id: i64) -> Result<CancelResult, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get the subscription details
    let sub: Subscription = conn
        .query_row(
            "SELECT id, name, amount, frequency, merchant, status, cancelled_at, cancel_tx FROM subscriptions WHERE id = ?1",
            [id],
            |row| {
                Ok(Subscription {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    amount: row.get(2)?,
                    frequency: row.get(3)?,
                    merchant: row.get(4)?,
                    status: row.get(5)?,
                    cancelled_at: row.get(6)?,
                    cancel_tx: row.get(7)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    if sub.status == "cancelled" {
        return Err("Subscription already cancelled".to_string());
    }

    // Generate cancellation email
    let email_subject = format!("Cancellation Request - {} Subscription", sub.name);
    let email_body = format!(
        "Dear {} Customer Support,\n\n\
         I am writing to request the immediate cancellation of my {} subscription \
         (${:.2}/{}).\n\n\
         Please confirm the cancellation and ensure no further charges are made to my account. \
         Per FTC guidelines, I expect this cancellation to be processed within 24 hours.\n\n\
         If there are any remaining balance or prorated refund amounts, please apply them \
         to my original payment method.\n\n\
         Please send written confirmation of this cancellation to this email address.\n\n\
         Thank you for your prompt attention to this matter.\n\n\
         Best regards,\n\
         Ghost Protocol User",
        sub.merchant, sub.name, sub.amount, sub.frequency
    );

    Ok(CancelResult {
        id: sub.id,
        email_subject,
        email_body,
    })
}

#[tauri::command]
pub fn confirm_cancellation(
    db: State<'_, Database>,
    id: i64,
    tx_signature: Option<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE subscriptions SET status = 'cancelled', cancelled_at = datetime('now'), cancel_tx = ?1 WHERE id = ?2",
        rusqlite::params![tx_signature, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_savings_summary(db: State<'_, Database>) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let total_saved: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE status = 'cancelled'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    let total_active: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE status = 'active'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "monthly_saved": total_saved,
        "annual_saved": total_saved * 12.0,
        "monthly_active": total_active,
        "annual_active": total_active * 12.0,
    })
    .to_string())
}
