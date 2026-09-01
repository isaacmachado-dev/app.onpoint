# Plano: Notas de estudo do onPoint na Obsidian (só notas — não mexer no app)

> Modo plan-only (2026-08-31). Não executar nada daqui ainda.
> **Direção confirmada pelo usuário**: só gerar notas de estudo na Obsidian
> (MOC + mapa técnico dos arquivos + notas conceituais). NÃO refatorar, NÃO
> alterar o código do app. O único arquivo do repo que muda é `package.json`
> (acrescenta um script npm opcional) e o novo `scripts/gen-obsidian-notes.mjs`.

## Goal
Produzir notas de aprendizado (conceitos + mapa técnico por arquivo) sobre o onPoint direto na Obsidian vault, geradas a partir do código real por um script re-executável, sem alterar nenhum código do app.

## Current context / assumptions
- Repo: `/home/moonlight/New Projects/app/app.onpoint` — Tauri v2 (Rust em `src-tauri/`, frontend React+TS+Vite em `src/`). `package.json` só tem `build` (`tsc && vite build`); não há suíte de testes.
- onPoint = app de **controle de ponto/frequência** (estilo letswork.app): bate ponto, gauge de líquido, calendário, config de horários, tray, auto-updater, pop-up always-on-top.
- Obsidian vault em `~/Documents/Obsidian/Vault`. Destino: `APPs/Tauri/onPoint/` (já existe `APPs/Tauri/`).
- Ambiente: `node v26.8.1`. Usaremos **Node ESM (`.mjs`) sem deps externas** para o gerador (só `fs`/`path`/`os`). Testes do gerador com `node --test` (zero-dep, já vem no Node).
- Convenção de idioma: notas em **PT-BR** (usuário escreve em PT-BR).
- Arquivos reais confirmados em `src/`: `App.tsx`, `components/ui/*` (button, calendar, cup-soda, fingerprint, navbar, popover, rocket-icon, types), `hooks/useUpdater.ts`, `lib/utils.ts`, `lib/windowPopup.ts`, `main.tsx`, `views/calendar/Page.Calendar.tsx`, `views/configuration/*` (Button.Toggle, Modal.DatePicker, Modal.HourPicker, Modal.Hour, Page.Configuration, UpdateModal), `views/point/*` (confetti, Page.Point, PointProgressBar, PointWidget, usePointProgress), `vite-env.d.ts`. Backend: `src-tauri/src/lib.rs`.

## Architecture / proposed approach
Criamos `scripts/gen-obsidian-notes.mjs` que varre `src/**` e `src-tauri/src/**`, extrai símbolos por regex simples (sem parser TS — YAGNI) e emite, para cada arquivo, uma nota Markdown com o código completo em bloco e a lista de símbolos, sob `APPs/Tauri/onPoint/03-Arquitetura/`. Notas conceituais (Tauri v2, hooks React, arquitetura) e uma MOC central são escritas à mão (seed) para dar contexto. Tudo Markdown puro com `[[wikilinks]]` para navegação no Obsidian. O app em si não é tocado.

## Step-by-step tasks

### Task 1 — Criar pastas de destino na vault
Comando (só cria diretórios; é seguro):
```bash
mkdir -p ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/{00-MOC,01-Conceitos,02-Arquitetura,03-Arquitetura,04-Referencia}
```
Verificação: `ls ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint` lista as 5 pastas.

### Task 2 — Nota conceitual: Tauri v2 (seedada)
Criar `~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/01-Conceitos/Tauri-v2.md` (conteúdo copy-paste):
```markdown
# Tauri v2 — o que é (para entender o onPoint)

App desktop = **binário Rust** (backend, tray, comandos) + **webview** (frontend
HTML/JS, aqui React+TS+Vite). O binário abre uma janela com webview; o frontend
roda dentro dela.

## O coração: IPC via `invoke`
- Frontend chama Rust com `invoke("nome_do_comando", { args })`.
- Rust expõe comandos com `#[tauri::command] fn nome_do_comando(...)`.
- No onPoint: `src/lib/windowPopup.ts` chama `invoke("popup_window")` etc.;
  o backend está em `src-tauri/src/lib.rs`.

## Plugins usados no onPoint
- `plugin-store` — persistência de config (`LazyStore("settings.json")`).
- `plugin-opener` — abrir URLs externas (`openUrl`).
- `plugin-updater` — auto-update via GitHub releases (`src/hooks/useUpdater.ts`).
- `plugin-autostart` — iniciar com o SO.
- `plugin-process` — controle de processo (reload/exit).

Ver [[onPoint-Arquitetura]] e [[onPoint-MOC]].
```

### Task 3 — Nota conceitual: Hooks React usados no onPoint (seedada)
Criar `~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/01-Conceitos/Hooks-React-no-onPoint.md`:
```markdown
# Hooks React no onPoint (para estudar o `usePointProgress`)

O app é React funcional. Os hooks centrais:

- `useState` — guarda estado (ex: `gaugeValue`, `completedPunches`, `realTime`).
- `useEffect` — efeito colateral / "ouça" algo. Dois padrões no onPoint:
  1. **Timer de 1s**: `useEffect(() => { const t = setInterval(fn, 1000); return () => clearInterval(t); }, [deps])` — atualiza o relógio/gauge.
  2. **Listener de evento**: `window.addEventListener("storage", loadData)` com cleanup no return.
- `useRef` — guarda um handle mutável sem renderizar (ex: `drainIntervalRef` para o intervalo de esvaziar o gauge).
- `useCallback` — memoriza função (usado em `PointWidget`/`Page.Point` ao passar handlers).

## Padrão-chave de estudo
`usePointProgress` (em `src/views/point/usePointProgress.ts`) é o cérebro:
estado de ponto + efeito de 1s que recalcula o gauge + dispara pop-up quando
`gaugeValue >= 100 && !isDraining`. Ler esse arquivo junto de [[onPoint-Arquitetura]].

Ver [[onPoint-MOC]].
```

### Task 4 — Nota de arquitetura (seedada, central)
Criar `~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/02-Arquitetura/onPoint-Arquitetura.md`:
```markdown
# onPoint — Arquitetura (visão geral)

App desktop Tauri v2 (Rust + React/TS). Janela única ~600x500, sem decoração,
transparente, centralizada (ver `src-tauri/tauri.conf.json`, `app.windows`).

## Fluxo de dados
1. Rust (`src-tauri/src/lib.rs`) registra comandos: `greet`, `popup_window`,
   `reset_popup_window`, `hide_popup_window`.
2. Frontend chama via `invoke("popup_window")` em `src/lib/windowPopup.ts`.
3. Config de horários persiste em `LazyStore("settings.json")` (plugin-store)
   com fallback em `localStorage` (`src/views/point/usePointProgress.ts`).
4. `usePointProgress` (hook central) calcula gauge/progresso em tempo real e
   dispara pop-up quando `isReadyToPunch`.

## Estrutura de pastas (frontend `src/`)
- `App.tsx` — shell + região arrastável da janela
- `components/ui/navbar.tsx` — 3 abas (ponto / calendário / config)
- `views/point/` — lógica de ponto + gauge de líquido + confete
- `views/configuration/` — modais de horário
- `views/calendar/` — calendário
- `hooks/useUpdater.ts` — auto-update via GitHub releases
- `lib/windowPopup.ts` — wrapper dos `invoke` de pop-up

## Backend (`src-tauri/`)
- `src-tauri/src/lib.rs` — comandos Rust + tray

Ver [[onPoint-MOC]] e [[onPoint-Referencia]].
```

### Task 5 — Escrever o gerador `scripts/gen-obsidian-notes.mjs`
Criar o arquivo no repo. Ele é **exportável** (funções `walk`, `extractSymbols`,
`oneLine` exportadas) para poder ser testado com `node --test`. Conteúdo completo:
```js
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(homedir(), "Documents/Obsidian/Vault/APPs/Tauri/onPoint");

// Varre dir, ignorando node_modules/target/.git; coleta .ts/.tsx/.rs (não .d.ts).
export function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", "target", ".git"].some((sk) => p.includes(sk))) continue;
      walk(p, acc);
    } else if (/\.(ts|tsx|rs)$/.test(e.name) && !e.name.endsWith(".d.ts")) {
      acc.push(p);
    }
  }
  return acc;
}

const SYM_RE = [
  /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g,
  /export\s+const\s+([A-Za-z0-9_]+)/g,
  /export\s+interface\s+([A-Za-z0-9_]+)/g,
  /export\s+type\s+([A-Za-z0-9_]+)/g,
  /export\s+default\s+function\s+([A-Za-z0-9_]+)/g,
  /#\[tauri::command\]\s*(?:async\s+)?fn\s+([A-Za-z0-9_]+)/g,
];

export function extractSymbols(src) {
  const out = new Set();
  for (const re of SYM_RE) {
    let m;
    while ((m = re.exec(src))) out.add(m[1]);
  }
  return [...out];
}

// Tenta inferir "o que o arquivo faz" pela 1ª declaração significativa.
export function oneLine(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const m = clean.match(/(?:interface|function|const|type|fn)\s+([A-Za-z0-9_]+)[^\n]*=?[\s\S]{0,40}/);
  return m ? m[0].replace(/\s+/g, " ").trim().slice(0, 90) : "";
}

// Gera todas as notas. Separado para poder ser testado sem side-effects pesados.
export function generate(opts = {}) {
  const out = opts.out ?? OUT;
  const files = walk(join(ROOT, "src")).concat(walk(join(ROOT, "src-tauri/src")));
  const moc = ["# onPoint — Map of Content", "", "## Arquivos (gerados do código)", ""];
  const refRows = ["| Arquivo | O que faz | Símbolos |", "|---|---|---|"];

  for (const f of files) {
    const rel = relative(ROOT, f);
    const src = readFileSync(f, "utf8");
    const syms = extractSymbols(src);
    const dest = join(out, "03-Arquitetura", rel.replace(/\.(tsx?|rs)$/, ".md"));
    mkdirSync(dirname(dest), { recursive: true });
    const body = [
      `# ${rel}`,
      "",
      "> Gerado por `scripts/gen-obsidian-notes.mjs`. Não editar à mão.",
      "",
      `Caminho: \`${rel}\` (${src.split("\n").length} linhas)`,
      "",
      "## Símbolos exportados",
      syms.length ? syms.map((s) => `- \`${s}\``).join("\n") : "- (nenhum export nomeado)",
      "",
      "## Código completo",
      "```ts",
      src,
      "```",
      "",
      "Ver [[onPoint-Arquitetura]] e [[onPoint-MOC]].",
    ].join("\n");
    writeFileSync(dest, body);
    moc.push(`- [[${rel.replace(/\.(tsx?|rs)$/, "")}]] — ${rel}`);
    refRows.push(`| \`${rel}\` | ${oneLine(src) || "—"} | ${syms.join(", ") || "—"} |`);
  }

  mkdirSync(join(out, "00-MOC"), { recursive: true });
  writeFileSync(join(out, "00-MOC/onPoint-MOC.md"), moc.join("\n"));
  mkdirSync(join(out, "04-Referencia"), { recursive: true });
  writeFileSync(join(out, "04-Referencia/onPoint-Referencia.md"), ["# onPoint — Referência", "", ...refRows].join("\n"));
  return files.length;
}

// Só roda ao executar direto (não ao ser importado por testes).
if (import.meta.url === `file://${process.argv[1]}`) {
  const n = generate();
  console.log(`Geradas ${n} notas de arquivo em ${OUT}`);
}
```
Verificação (Task 5): `node -e "import('./scripts/gen-obsidian-notes.mjs')" && echo ok` não deve dar erro de sintaxe (importa sem rodar o side-effect). Comando de execução real na Task 7.

### Task 6 — Teste do gerador (TDD, zero-dep)
Criar `scripts/gen-obsidian-notes.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractSymbols, oneLine } from "./gen-obsidian-notes.mjs";

test("extractSymbols acha função exportada", () => {
  assert.ok(extractSymbols("export function usePointProgress() {}").includes("usePointProgress"));
});

test("extractSymbols acha comando Tauri Rust", () => {
  assert.ok(extractSymbols("#[tauri::command]\nasync fn popup_window() {}").includes("popup_window"));
});

test("oneLine resume a 1ª declaração", () => {
  const r = oneLine("// cabe\n/** doc */\nexport function usePointProgress() {");
  assert.ok(r.includes("usePointProgress"));
});
```
TDD: rode ANTES de ter o gerador completo para ver falhar; após Task 5 deve passar.
Comando: `node --test scripts/gen-obsidian-notes.test.mjs`
Esperado: `# tests 3` / `# pass 3` (ou `3 passing`).

### Task 7 — Rodar o gerador e validar
Comando:
```bash
node scripts/gen-obsidian-notes.mjs
```
Esperado (stdout): `Geradas N notas de arquivo em /home/moonlight/Documents/Obsidian/Vault/APPs/Tauri/onPoint` com N >= 20.
Validar notas:
```bash
ls ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/03-Arquitetura | wc -l
cat ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/00-MOC/onPoint-MOC.md | head -20
```
Esperado: conta >= 20; MOC lista wikilinks `[[...]]`.

### Task 8 — Script npm para reaproveitar (mínimo, opcional)
Em `package.json` > `scripts` adicionar:
```json
"notes:obsidian": "node scripts/gen-obsidian-notes.mjs"
```
Verificação: `npm run notes:obsidian` imprime a mesma linha de sucesso.
(Opcional: não é estritamente necessário; é só conveniência. Não altera código do app.)

### Task 9 — Ligar do portal existente da vault (opcional)
Se existir `~/Documents/Obsidian/Vault/APPs/Tauri/Tauri.md`, acrescentar link
`[[onPoint-MOC]]`. Senão, criar `~/Documents/Obsidian/Vault/APPs/Tauri/onPoint.md`:
```markdown
# onPoint
App desktop de ponto (Tauri v2). Estudo em [[onPoint-MOC]].
```
Confirmar com `ls ~/Documents/Obsidian/Vault/APPs/Tauri/`.

## Tests / validation
- **Gerador** (TDD): `node --test scripts/gen-obsidian-notes.test.mjs` → 3 testes passando (Task 6, antes/depois de Task 5).
- **Execução**: `node scripts/gen-obsidian-notes.mjs` → `Geradas N notas...` com N>=20; `ls .../03-Arquitetura | wc -l` >= 20; MOC com wikilinks (Task 7).
- **App intacto**: confirmar que NENHUM arquivo de `src/` ou `src-tauri/` foi alterado — `git status` no repo deve mostrar só `scripts/gen-obsidian-notes.mjs`, `scripts/gen-obsidian-notes.test.mjs` e (se feito) a linha `notes:obsidian` em `package.json`. As notas vão para a vault (fora do repo), então não entram no git do projeto.
- **Commits frequentes**:
  - `feat: add obsidian notes generator + tests` (Tasks 5-6)
  - `chore: add notes:obsidian npm script` (Task 8, se feito)
  - Notas da vault NÃO são commitadas no repo.

## Risks, tradeoffs, open questions
- **Regex, não parser TS/Rust**: falha em exports de uma linha estranha ou tipos condicionais. Aceitável para aprendizado (YAGNI). Se quiser precisão, trocar por TS compiler API (mais peso).
- **Notas seedadas vs geradas**: seed (Tasks 2-4) dão contexto mas podem desatualizar; o gerador cobre o que muda no código. Revisar seed a cada release maior.
- **Escrever na vault**: o gerador escreve FORA do repo (na vault). Intencional — não vai para o git do projeto. Se a vault sincroniza (Obsidian Sync/iCloud), aparece automático.
- **Caminho da vault hardcoded** em `homedir()/Documents/Obsidian/Vault/...`: se a vault mudar de lugar, ajustar `OUT` no script.
- **Código completo embutido** nas notas (Task 5): deixa cada nota autocontida para estudo, mas gera arquivos grandes na vault. Se preferir só o cabeçalho + símbolos (leve), trocar o bloco `Código completo` por `primeiras 60 linhas`.
- **Open question**: incluir backend Rust (`src-tauri/src/lib.rs`) no mapa? O script da Task 5 já varre `src-tauri/src` — confirmar se a vault deve conter notas de Rust também (assumi sim).
