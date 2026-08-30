# System Tray — onPoint (Tauri v2)

## Visão Geral
O aplicativo expõe um ícone persistente na **system tray** (bandeja do sistema) para
mostrar/ocultar a janela e encerrar o app, mesmo com a janela fechada.

## Arquitetura
- **Entrada:** `src-tauri/src/lib.rs` → `run()` → `setup()` (bloco `.setup(|app| { ... })`).
- **Builder:** `TrayIconBuilder::with_id("main-tray")` (id estável para updates futuros).
- **Ícone:** `Image::from_bytes(include_bytes!("../icons/tray.png"))` — **embarcado no binário**
  via `include_bytes!`, eliminando dependência de caminho de arquivo em runtime (dev e release).
  - Fallback: `app.default_window_icon()` caso o PNG embarcado falhe ao decodificar.
  - Feature necessária em `Cargo.toml`: `tauri = { features = ["tray-icon", "image-png"] }`.
- **Menu:** `MenuItem` "Mostrar" / "Sair" (`Menu::with_items`).
- **Interações:**
  - Clique esquerdo no ícone → alterna visibilidade da janela (`on_tray_icon_event`).
  - Botão esquerdo também abre o menu (`show_menu_on_left_click(true)`).
  - "Mostrar" → `window.show() + unminimize() + set_focus()`.
  - "Sair" → `app.exit(0)`.

## Assets
- `src-tauri/icons/tray.png` — PNG 32x32 dedicado ao tray (gerado a partir de `32x32.png`).

## Garantia no Ubuntu (GNOME)
O Tauri v2 renderiza o tray via **libappindicator**. Para o ícone aparecer no Ubuntu:
1. Usar a sessão **"Ubuntu"** (já traz a extensão *Ubuntu AppIndicators* ativa).
2. Em GNOME puro, instalar a extensão **App Indicators** (sem ela o tray não aparece —
   limitação de protocolo, não do Tauri).
3. `libappindicator` deve estar presente no SO (`gir1.2-appindicator3-0.1` / pacote equivalente).
