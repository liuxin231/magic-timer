// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};
use tauri::{LogicalPosition, LogicalSize, Manager, Size, State, Window, Wry};
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu};

#[derive(Debug, Clone)]
enum TimerStatus {
    Waiting,
    Started,
    Suspend,
    Warning,
}

#[derive(Debug, Clone)]
pub struct Rgba {
    r: f32,
    g: f32,
    b: f32,
    a: f32,
}

#[derive(Debug, Clone)]
struct TimerState {
    timer_status: TimerStatus,
    timing: i64,
    warning_timing: i64,
    background_rgba: Rgba,
}

impl TimerState {
    pub fn default() -> Self {
        Self {
            timer_status: TimerStatus::Waiting,
            timing: 0,
            warning_timing: 10,
            background_rgba: Rgba {
            r: 255.,
            g: 255.,
            b: 255.,
            a: 1.,
        } }
    }
}
fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let tray_menu = SystemTrayMenu::new()
        .add_item(close)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                let item_handle = app.tray_handle().get_item(&id);
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "close" => {
                        let window = app.get_window("main").unwrap();
                        if let Ok(true) = window.is_visible() {
                            window.hide().unwrap();
                            item_handle.set_title("Show").unwrap();
                        } else if let Ok(false) = window.is_visible() {
                            window.show().unwrap();
                            item_handle.set_title("Close").unwrap();
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .setup(|app| {

            let timer_state = Arc::new(Mutex::new(TimerState::default()));
            app.manage(timer_state.clone());
            let main_window = app.get_window("main").unwrap();
            // 窗口大小
            main_window.set_size(Size::from(LogicalSize{ width: 300, height: 50 })).unwrap();
            // 是否展示装饰栏
            main_window.set_decorations(false).unwrap();
            // 是否打开开发工具
            // main_window.open_devtools();
            // 是否总是在顶部
            main_window.set_always_on_top(true).unwrap();
            // 配置窗口位置
            main_window.set_position(LogicalPosition::new(50, 50)).unwrap();
            std::thread::spawn(move || {
                loop {
                    std::thread::sleep(std::time::Duration::from_secs(1));
                    main_window.emit("now_date_time", format!("{}", chrono::Local::now().format("%H:%M:%S").to_string())).unwrap();

                    let mut state = timer_state.lock().unwrap();
                    let status = state.timer_status.clone();
                    {
                        let seconds = state.timing;
                        if let TimerStatus::Started = status {
                            if state.timing >= state.warning_timing {
                                state.timer_status = TimerStatus::Warning;
                                main_window.emit("btn_color", "error").unwrap();
                            }
                        }
                        let days = seconds / (24 * 60 * 60);
                        let hours = (seconds / (60 * 60)) % 24;
                        let minutes = (seconds / 60) % 60;
                        let seconds = seconds % 60;
                        main_window.emit("timing", format!("{}'{}'{}'{}", days, hours, minutes, seconds)).unwrap();
                    }
                    match status {
                        TimerStatus::Waiting => {}
                        TimerStatus::Started => {
                            state.timing += 1;
                        }
                        TimerStatus::Suspend => {}
                        TimerStatus::Warning => {
                            state.timing += 1;
                        }
                    }
                    drop(state);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![timer_btn_click, timer_btn_double_click, update_transparency, update_bg_color, update_timing, get_warn_timing])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn timer_btn_click(timer_state: State<Arc<Mutex<TimerState>>>, window: Window<Wry>) {
    let main_window = window.get_window("main").unwrap();
    let mut state = timer_state.lock().unwrap();
    {
        let status = &state.timer_status;
        match status {
            TimerStatus::Waiting => {
                state.timer_status = TimerStatus::Started;
                main_window.emit("btn_color", "primary").unwrap();
            }
            TimerStatus::Started => {
                state.timer_status = TimerStatus::Suspend;
                main_window.emit("btn_color", "action").unwrap();
            }
            TimerStatus::Suspend => {
                state.timer_status = TimerStatus::Started;
                main_window.emit("btn_color", "primary").unwrap();
            }
            TimerStatus::Warning => {
                state.timer_status = TimerStatus::Suspend;
                main_window.emit("btn_color", "action").unwrap();
            }
        }
    }
    drop(state);
}

#[tauri::command]
fn timer_btn_double_click(timer_state: State<Arc<Mutex<TimerState>>>, window: Window<Wry>) {
    let main_window = window.get_window("main").unwrap();
    let mut state = timer_state.lock().unwrap();
    state.timer_status = TimerStatus::Waiting;
    state.timing = 0;
    drop(state);
    main_window.emit("btn_color", "action").unwrap();
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TimingParam {
    hour: i64,
    minute: i64,
    second: i64,
}

#[tauri::command]
fn update_timing(timing_param: TimingParam, timer_state: State<Arc<Mutex<TimerState>>>, window: Window<Wry>) {
    println!("timing param: {:?}", &timing_param);
    let warn_timing = timing_param.second + timing_param.minute * 60 + timing_param.hour * 60 * 60;
    let mut state = timer_state.lock().unwrap();
    state.timer_status = TimerStatus::Waiting;
    state.timing = 0;
    state.warning_timing = warn_timing;
    drop(state);
    timer_btn_double_click(timer_state, window);
}

#[tauri::command]
fn get_warn_timing(timer_state: State<Arc<Mutex<TimerState>>>) -> TimingParam {
    let seconds = timer_state.lock().unwrap().warning_timing;
    let hours = (seconds / (60 * 60)) % 24;
    let minutes = (seconds / 60) % 60;
    let seconds = seconds % 60;
    TimingParam {
        hour: hours,
        minute: minutes,
        second: seconds,
    }
}

#[tauri::command]
fn update_transparency(value: i32, timer_state: State<Arc<Mutex<TimerState>>>, window: Window<Wry>) {
    let mut state = timer_state.lock().unwrap();
    state.background_rgba.a = value as f32 / 100 as f32;
    let background_rgba = format!("rgba({},{},{},{})", state.background_rgba.r, state.background_rgba.g, state.background_rgba.b, state.background_rgba.a);
    let main_window = window.get_window("main").unwrap();
    main_window.emit("update_bgColor", background_rgba).unwrap();
}
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BgColor {
    r: f32,
    g: f32,
    b: f32,
    a: f32,
}
#[tauri::command]
fn update_bg_color(bg_color: BgColor, timer_state: State<Arc<Mutex<TimerState>>>, window: Window<Wry>) {
    let mut state = timer_state.lock().unwrap();
    state.background_rgba.r = bg_color.r;
    state.background_rgba.g = bg_color.g;
    state.background_rgba.b = bg_color.b;
    let background_rgba = format!("rgba({},{},{},{})", state.background_rgba.r, state.background_rgba.g, state.background_rgba.b, state.background_rgba.a);
    let main_window = window.get_window("main").unwrap();
    main_window.emit("update_bgColor", background_rgba).unwrap();
}
