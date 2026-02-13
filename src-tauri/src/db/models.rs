use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subscription {
    pub id: i64,
    pub name: String,
    pub amount: f64,
    pub frequency: String,
    pub merchant: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: i64,
    pub task_type: String,
    pub status: String,
    pub input_data: Option<String>,
    pub output_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiKey {
    pub service: String,
    pub encrypted_key: String,
    pub created_at: String,
}
