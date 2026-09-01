# Plano: Documentação de conceitos-chave do onPoint na Obsidian (foco Rust)

> Modo plan-only (2026-08-31). Não executar nada daqui ainda.
> **Pedido real** (confirmado nesta rodada): "busque conceitos-chave *interessantes*
> usados no projeto e apresente como documentação na Obsidian, **em especial quanto
> ao Rust**". Então o entregável é um conjunto de notas de estudo curadas (não um
> dump de todos os arquivos) que explicam os conceitos interessantes do onPoint,
> com ênfase no backend Rust (Tauri). NÃO alterar código do app — só escrever notas.

## Goal
Criar notas de documentação na Obsidian vault que explicam os conceitos-chave do onPoint (Rust/Tauri em destaque, IPC, tray, modelo de capacidades, plugins, persistência), cada uma ancorada no código real do repo.

## Current context / assumptions
- Repo: `/home/moonlight/New Projects/app/app.onpoint`. Tauri v2: Rust em `src-tauri/` (`lib.rs` 112 linhas é o cérebro; `main.rs` 6 linhas; `Cargo.toml`; `tauri.conf.json`; `capabilities/default.json`), frontend React+TS em `src/`.
- Material já lido e usado neste plano (código real):
  - `src-tauri/src/lib.rs` — 4 comandos (`greet`, `popup_window`, `reset_popup_window`, `hide_popup_window`), tray com menu + eventos, fix Wayland/`unsafe`, plugins.
  - `src-tauri/src/main.rs` — `#[cfg_attr]` (conditional compilation) + `onpoint_lib::run()`.
  - `src-tauri/Cargo.toml` — `crate-type = ["staticlib","cdylib","rlib"]`, plugins.
  - `src-tauri/capabilities/default.json` — ACL (`core:window:allow-*`, `store:default`, etc.).
  - `src-tauri/tauri.conf.json` — janela 600x500, `decorations:false`, `transparent:true`, `center:true`; updater com `pubkey`.
  - `src/lib/windowPopup.ts` — `invoke("popup_window")` + fallback `getCurrentWindow()`.
  - `src/views/point/usePointProgress.ts` — hook central (já lido em plano anterior).
  - `src/views/configuration/Modal.Hour.tsx` — `ShiftHour`, `ScheduleItem` (modelo de dados), `LazyStore`.
- Obsidian vault em `~/Documents/Obsidian/Vault`. Destino: `APPs/Tauri/onPoint/`.
- Idioma: notas em PT-BR. Sem deps externas (só precisa criar arquivos `.md`).
- Conceitos "interessantes" identificados no código: IPC Rust↔JS, tray nativo, `unsafe`/env no fix Wayland, modelo de capacidades (ACL), macros `include_bytes!`/`generate_handler!`, `crate-type` FFI, plugins, persistência store+localStorage.

## Architecture / proposed approach
Em vez de mapear todo arquivo, escrevemos ~7 notas conceituais curadas (cada uma com trecho de código real + explicação didática), uma MOC central que as liga, e um visão-geral de arquitetura. Um script opcional `scripts/check-obsidian-links.mjs` valida que todo `[[wikilink]]` aponta para arquivo existente (única verificação automatável para docs). Nenhum arquivo de `src/`/`src-tauri/` é tocado.

## Step-by-step tasks

### Task 1 — Criar pastas na vault
```bash
mkdir -p ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/{00-MOC,01-Conceitos,02-Arquitetura}
```
Verificação: `ls ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint` lista as 3 pastas.

### Task 2 — MOC central: `00-MOC/onPoint-MOC.md`
Conteúdo (copy-paste):
```markdown
# onPoint — Map of Content

App desktop de ponto (Tauri v2: Rust + React/TS). Estudo de conceitos.

## Conceitos-chave
- [[01-Tauri-IPC]] — a ponte Rust ↔ frontend (`invoke` / `#[tauri::command]`)
- [[02-Tray-System]] — ícone de bandeja nativo em Rust (menu + eventos)
- [[03-Wayland-Unsafe]] — o fix `unsafe` do WebKit no Wayland (ensaio de Rust)
- [[04-Capabilities-ACL]] — modelo de permissões/ACL do Tauri
- [[05-Plugins-Persistencia]] — plugins, `include_bytes!` e store
- [[06-Data-Model]] — `ShiftHour` / `ScheduleItem` e persistência
- [[07-Janela-Config]] — janela sem decoração/transparente (tauri.conf.json)

## Visão geral
- [[onPoint-Arquitetura]]
```

### Task 3 — CONCEITO 1 (Rust, central): `01-Conceitos/01-Tauri-IPC.md`
```markdown
# Tauri IPC — a ponte Rust ↔ frontend

O "coração" de um app Tauri: o frontend (JS/TS) chama funções do backend (Rust)
por nome, e o Rust devolve o resultado. Isso é o **IPC** (Inter-Process Call),
embora rode no mesmo binário.

## No Rust: `#[tauri::command]`
`src-tauri/src/lib.rs` expõe comandos assim:
```rust
#[tauri::command]
fn popup_window(app_handle: tauri::AppHandle) {
    if let Some(window) = app_handle.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_always_on_top(true);
        let _ = window.set_focus();
        let _ = window.request_user_attention(Some(tauri::UserAttentionType::Critical));
    }
}
```
- `#[tauri::command]` transforma a função num comando chamável via IPC.
- `app_handle: tauri::AppHandle` é **injetado pelo Tauri** (não passamos na chamada
  JS) — é dependência injetada por tipo de parâmetro.
- `if let Some(window) = ...` — pattern matching: "se achou a janela, use-a".
- `let _ = window.unminimize();` — ignora o `Result` (erro silencioso). Idiomático
  quando o erro não importa.

Os comandos são registrados no builder:
```rust
.invoke_handler(tauri::generate_handler![greet, popup_window, reset_popup_window, hide_popup_window])
```

## No frontend: `invoke`
`src/lib/windowPopup.ts`:
```ts
import { invoke } from "@tauri-apps/api/core";
export async function triggerPopupWindow(): Promise<void> {
  try { await invoke("popup_window"); return; }
  catch (err) { console.warn("invoke falhou, usando window API:", err); }
  const appWindow = getCurrentWindow();
  await appWindow.unminimize();
  // ...fallback
}
```
- `invoke("popup_window")` dispara o comando Rust pelo nome.
- Há **fallback** para a Window API do Tauri (`@tauri-apps/api/window`) caso o
  comando não exista/permissão negada — defesa em profundidade.

Ver [[onPoint-Arquitetura]] e [[04-Capabilities-ACL]] (por que o fallback existe: ACL).
```

### Task 4 — CONCEITO 2 (Rust): `01-Conceitos/02-Tray-System.md`
```markdown
# Tray System — bandeja do sistema em Rust

O onPoint vive minimizado na bandeja (tray). Tudo é construído em Rust no `setup`.

## `TrayIconBuilder`
`src-tauri/src/lib.rs`:
```rust
let tray_icon = Image::from_bytes(include_bytes!("../icons/tray.png") as &[u8])
    .unwrap_or_else(|_| app.default_window_icon().cloned().unwrap());

TrayIconBuilder::with_id("main-tray")
    .icon(tray_icon)
    .menu(&menu)
    .show_menu_on_left_click(true)
    .on_menu_event(|app, event| match event.id.as_ref() {
        "mostrar" => { /* mostra janela */ }
        "sair" => { app.exit(0); }
        _ => {}
    })
    .on_tray_icon_event(|tray, event| {
        if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
            // alterna visibilidade da janela
        }
    })
    .build(app)?;
```

## Pontos de estudo
- `include_bytes!("../icons/tray.png")` — **macro que embute o arquivo no binário em
  compile-time** (zero I/O em runtime). `Image::from_bytes(...)` desserializa.
- `.on_menu_event(...)` e `.on_tray_icon_event(...)` — **closures** (lambdas) como
  callbacks; `match` sobre o id do evento de menu.
- `match event { TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } => ... }`
  — pattern matching destruturando o evento; `..` ignora os campos restantes.
- `app.exit(0)` — encerra o app pela `AppHandle`.
- `.build(app)?` — o `?` propaga erro (tipo `Result`) para o `setup` retornar `Ok(())`.

Ver [[01-Tauri-IPC]] e [[onPoint-Arquitetura]].
```

### Task 5 — CONCEITO 3 (Rust, ensino de `unsafe`): `01-Conceitos/03-Wayland-Unsafe.md`
```markdown
# O fix Wayland e o `unsafe` do Rust (ensaio)

Este trecho de `src-tauri/src/lib.rs` é o melhor exemplo de Rust "real" no projeto:
```rust
if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
    // SAFETY: chamado no início do main, single-thread ainda
    unsafe { std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1") };
}
```
Contexto: no Wayland nativo (Arch/Hyprland) o renderer DMABUF do WebKitGTK crasha.
A var de ambiente `WEBKIT_DISABLE_DMABUF_RENDERER=1` corrige, mas queremos injetá-la
no binário (funciona em .deb/AppImage sem depender de .desktop/ENV externo).

## O que estudar aqui
1. **`Result` e `is_err()`**: `std::env::var(...)` retorna `Result<String, VarError>`.
   `is_err()` é true se a var **não existe** → só setamos se ausente (respeita valor do usuário).
2. **`unsafe`**: `std::env::set_var` é `unsafe` em Rust moderno porque mexer no
   ambiente pode competir com outra thread lendo env (data race). Dentro de `unsafe { }`
   o compilador relaxa — *você* garante a segurança.
3. **Comentário `SAFETY`**: convenção Rust — explica POR QUE é seguro aqui
   ("início do main, ainda single-thread"). Sempre exigido em code review sério.
4. **Conditional compilation** (`src-tauri/src/main.rs`):
   ```rust
   #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
   ```
   `#[cfg_attr(condição, atributo)]` aplica `windows_subsystem="windows"` só em release
   (sem console). E em `lib.rs`: `#[cfg_attr(mobile, tauri::mobile_entry_point)]`.

> Lição: `unsafe` não é "inseguro sempre" — é "o compilador não pode provar; eu assumo".
> O comentário SAFETY é o contrato.

Ver [[onPoint-Arquitetura]] e [[05-Plugins-Persistencia]].
```

### Task 6 — CONCEITO 4 (Rust/segurança): `01-Conceitos/04-Capabilities-ACL.md`
```markdown
# Tauri Capabilities — o modelo de permissões (ACL)

No Tauri v2 o frontend **não pode chamar nada do sistema à vontade**. Cada ação
precisa de uma *permission* declarada em `capabilities/default.json`.

## Exemplo real (`src-tauri/capabilities/default.json`)
```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-set-always-on-top",
    "core:window:allow-request-user-attention",
    "store:default",
    "autostart:default",
    "updater:default",
    "process:allow-restart"
  ]
}
```
## Por que importa
- `core:window:allow-set-always-on-top` é a permissão que habilita o `popup_window`
  (Rust) a fazer `set_always_on_top(true)`. Sem ela, o `invoke` falha → daí o
  **fallback** em `src/lib/windowPopup.ts` usar a Window API.
- `store:default` habilita o `LazyStore("settings.json")` do frontend.
- `generate_handler!` (lib.rs) registra os comandos; as *capabilities* decidem se o
  frontend pode chamá-los. Dois lados: comando existe (Rust) + permissão concedida (ACL).

Ver [[01-Tauri-IPC]] (a ponte) e [[05-Plugins-Persistencia]] (os plugins citados).
```

### Task 7 — CONCEITO 5: `01-Conceitos/05-Plugins-Persistencia.md`
```markdown
# Plugins Tauri e `include_bytes!`

## Plugins (registrados no builder, `lib.rs`)
```rust
tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())      // abrir URLs (openUrl)
    .plugin(tauri_plugin_store::Builder::default().build())  // LazyStore
    .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None)) // iniciar c/ SO
    .plugin(tauri_plugin_updater::Builder::new().build())     // auto-update GitHub
    .plugin(tauri_plugin_process::init())     // restart/exit
```
Cada plugin é um crate separado (`Cargo.toml`): `tauri-plugin-opener`, `-store`,
`-autostart`, `-updater`, `-process`. Plugins estendem o backend sem você escrever o Rust.

## `include_bytes!` (já visto no tray)
Embute assets no binário em compile-time. Usado p/ o ícone do tray.

## Persistência no frontend
`src/views/point/usePointProgress.ts` e `Modal.Hour.tsx` usam:
```ts
import { LazyStore } from "@tauri-apps/plugin-store";
const store = new LazyStore("settings.json");
const stored = await store.get<ScheduleItem[]>("schedules");
```
- O `LazyStore` grava em `settings.json` (via plugin-store, com permissão `store:default`).
- Há **fallback** para `localStorage` se o store falhar (ver `getInitialScheduleForToday`).

Ver [[04-Capabilities-ACL]] e [[06-Data-Model]].
```

### Task 8 — CONCEITO 6 (modelo de dados): `01-Conceitos/06-Data-Model.md`
```markdown
# Modelo de dados — turnos e agenda

O domínio do onPoint (frontend, `src/views/configuration/Modal.Hour.tsx`):
```ts
export interface ShiftHour {
  id: number;
  label: string;   // "1° Entrada"
  time: string;    // "08:00"
}
export interface ScheduleItem {
  id: string;
  days: string[];  // ["seg","ter",...] (chaves em DAY_KEYS)
  daysLabel: string;
  shifts: ShiftHour[];
}
```
## Fluxo
1. Usuário edita agenda nos modais de `views/configuration/`.
2. Salva em `LazyStore("settings.json")` como `ScheduleItem[]` (com fallback localStorage).
3. `usePointProgress` (hook central) lê o `ScheduleItem` do dia (`days.includes(dayName)`)
   e calcula o gauge de cada turno.

No Rust isso seria `serde` (`Cargo.toml`: `serde = { features = ["derive"] }`) para
(Des)serializar JSON — mas aqui o modelo vive no TS e o Rust só repassa.

Ver [[05-Plugins-Persistencia]] e [[onPoint-Arquitetura]].
```

### Task 9 — CONCEITO 7 (janela): `01-Conceitos/07-Janela-Config.md`
```markdown
# Janela sem decoração e transparente

`src-tauri/tauri.conf.json` define a janela principal:
```json
"windows": [{
  "title": "onPoint",
  "width": 600, "height": 500,
  "resizable": false,
  "decorations": false,   // sem barra de título do SO
  "transparent": true,    // fundo transparente (efeito "flutuante")
  "center": true
}]
```
- `decorations:false` + `transparent:true` dão o visual flutuante. Como não há
  barra de título, o **arrasto da janela** é feito no frontend (`core:window:allow-start-dragging`
  na capability) — região arrastável em `src/App.tsx`.
- `center:true` abre centralizada.

Ver [[04-Capabilities-ACL]] (precisa de `allow-start-dragging`) e [[onPoint-Arquitetura]].
```

### Task 10 — Visão geral: `02-Arquitetura/onPoint-Arquitetura.md`
```markdown
# onPoint — Arquitetura (visão geral)

App desktop Tauri v2: binário Rust (backend) + webview React/TS (frontend).

## Backend (`src-tauri/`)
- `src/main.rs` — entrypoint mínimo: `#[cfg_attr]` + `onpoint_lib::run()`.
- `src/lib.rs` — `run()`: registra plugins, monta tray, define comandos IPC
  (`popup_window` etc.), aplica o fix Wayland `unsafe`.
- `Cargo.toml` — `crate-type = ["staticlib","cdylib","rlib"]` (FFI p/ mobile/desktop).
- `tauri.conf.json` — janela + config de bundle/updater.
- `capabilities/default.json` — ACL (o que o frontend pode fazer).

## Frontend (`src/`)
- `App.tsx` — shell + região arrastável.
- `components/ui/navbar.tsx` — 3 abas (ponto/calendário/config).
- `views/point/` — `usePointProgress` (hook central: gauge/turnos/pop-up) + confete.
- `views/configuration/` — modais de horário (modelo `ShiftHour`/`ScheduleItem`).
- `views/calendar/` — calendário.
- `lib/windowPopup.ts` — `invoke` dos comandos de janela + fallback.
- `hooks/useUpdater.ts` — auto-update (plugin-updater).

## Fluxo típico
Usuário bate ponto → `usePointProgress` calcula gauge → ao chegar em 100% chama
`triggerPopupWindow()` → Rust `popup_window` sobe a janela always-on-top.
Config persiste em `settings.json` (store) com fallback localStorage.

Estude os conceitos em [[onPoint-MOC]].
```

### Task 11 — Validador de wikilinks (script Node, opcional)
Criar `scripts/check-obsidian-links.mjs`:
```js
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const DIR = join(homedir(), "Documents/Obsidian/Vault/APPs/Tauri/onPoint");
const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".md")) files.push(p);
  }
})(DIR);

const names = new Set(files.map((f) => f.slice(DIR.length + 1).replace(/\.md$/, "")));
let broken = 0;
for (const f of files) {
  const txt = readFileSync(f, "utf8");
  const links = [...txt.matchAll(/\[\[([^\]\|]+)/g)].map((m) => m[1].trim());
  for (const l of links) if (!names.has(l)) { console.log(`BROKEN: ${f} -> [[${l}]]`); broken++; }
}
console.log(broken === 0 ? "OK: todos os wikilinks resolvem" : `${broken} link(s) quebrado(s)`);
process.exit(broken === 0 ? 0 : 1);
```
Verificação: `node scripts/check-obsidian-links.mjs` → `OK: todos os wikilinks resolvem`.
(Se algum quebrar, ajustar o nome do arquivo ou do link — ex: `onPoint-MOC` deve bater
com o arquivo `00-MOC/onPoint-MOC.md` relativo a `onPoint-MOC`.)

### Task 12 — Conferir entrega
```bash
ls ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/01-Conceitos
```
Esperado: 7 arquivos (`01-Tauri-IPC.md` ... `07-Janela-Config.md`).
```bash
node scripts/check-obsidian-links.mjs
```
Esperado: `OK: todos os wikilinks resolvem` (exit 0).

## Tests / validation
- Não há suíte de teste no repo e isto é documentação (não código do app). A validação
  é: (a) todas as 7 notas conceituais + MOC + arquitetura existem; (b) `check-obsidian-links.mjs`
  reporta zero links quebrados. Isso é o análogo ao "teste verde" para docs.
- **App intacto**: `git status` no repo deve mostrar SÓ `scripts/check-obsidian-links.mjs`
  (e talvez nada mais). Nenhum arquivo de `src/`/`src-tauri/` é alterado. As notas vão
  para a vault (fora do repo), então não entram no git do projeto.
- Commits: `docs: add onPoint concept notes for Obsidian` (só o script validador vai pro repo;
  as notas são na vault, fora do repo).

## Risks, tradeoffs, open questions
- **Curadoria vs exaustão**: escolhi 7 conceitos interessantes em vez de mapear todos os
  arquivos. Se o usuário quiser também o mapa cru de arquivos, adicionar um gerador
  `gen-obsidian-notes.mjs` (como nos planos `064129`/`073000` desta sessão) como suplemento.
- **Código pode desatualizar as notas**: as notas citam trechos reais; ao mudar `lib.rs`
  etc., rever. É documentação estática de estudo, não gerada automaticamente a cada build.
- **Caminho da vault hardcoded** em `homedir()/Documents/Obsidian/Vault/...`: ajustar `DIR`
  no script se a vault mudar.
- **Open question**: o usuário quer as notas em PT-BR mesmo? Assumi PT-BR (escreve assim).
  Se preferir EN, trocar os corpos.
- **Open question**: incluir também um glossário de macros Rust (`include_bytes!`,
  `generate_handler!`, `generate_context!`, `cfg_attr`) como nota extra? Deixei implícito
  nas notas 02/03/05; posso destacar numa `08-Macros-Rust.md` se quiser.
