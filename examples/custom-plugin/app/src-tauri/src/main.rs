// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Runtime;
use tauri_specta::{collect_events, Event};

#[derive(Clone, serde::Serialize, specta::Type, Event)]
struct RandomLetter(String);

fn builder<R: Runtime>() -> tauri_specta::Builder<R> {
    tauri_specta::Builder::new()
        .events(collect_events![RandomLetter])
}

fn main() {
    let builder = builder();

    tauri::Builder::default()
        .invoke_handler(builder.invoke_handler())
        .plugin(tauri_plugin_specta_example::init())
        .setup(move |app| {
            builder.mount_events(app);

            let handle = app.handle().clone();
            std::thread::spawn(move || loop {
                RandomLetter(rand::random::<char>().to_string()).emit(&handle).unwrap();
                std::thread::sleep(std::time::Duration::from_secs(1));
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}



#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn export_types() {
        builder::<tauri::Wry>()
            .export(
                specta_typescript::Typescript::default()
                    .formatter(specta_typescript::formatter::prettier),
                "../src/bindings.ts",
            )
            .expect("failed to export specta types");
    }
}
