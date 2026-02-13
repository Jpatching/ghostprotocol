use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subscription {
    pub id: i64,
    pub name: String,
    pub amount: f64,
    pub frequency: String,
    pub merchant: String,
    pub status: String,
    pub cancelled_at: Option<String>,
    pub cancel_tx: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CancelResult {
    pub id: i64,
    pub email_subject: String,
    pub email_body: String,
}
