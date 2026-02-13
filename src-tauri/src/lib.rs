mod commands;
mod db;

use db::Database;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");

            let database =
                Database::new(&app_data_dir).expect("failed to initialize database");

            // Seed demo data on first run
            {
                let conn = database.conn.lock().unwrap();
                db::schema::seed_demo_data(&conn).expect("failed to seed demo data");
            }

            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::subscriptions::get_subscriptions,
            commands::subscriptions::get_db_status,
            commands::subscriptions::cancel_subscription,
            commands::subscriptions::confirm_cancellation,
            commands::subscriptions::get_savings_summary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
