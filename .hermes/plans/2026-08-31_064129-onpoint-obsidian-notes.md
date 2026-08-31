# Plano: Notas de aprendizado do onPoint no Obsidian

> Gerado em 2026-08-31. Modo plan-only — não executar nada daqui ainda.

## Goal
Produzir notas de aprendizado (conceituais + mapa técnico) sobre o app **onPoint** direto na Obsidian vault, mantidas sincronizadas pelo código via um gerador scriptável.

## Current context / assumptions
- O projeto mora em `/home/moonlight/New Projects/app/app.onpoint` (Tauri v2: Rust em `src-tauri/`, frontend React+TS+Vite em `src/`).
- É um app de **controle de ponto/frequência** (estilo letswork.app): bate ponto, barra de progresso por turno, calendário, configuração de horários, tray, auto-updater.
- A Obsidian vault está em `/home/moonlight/Documents/Obsidian/Vault`. Já existe `APPs/Tauri/` — destino natural.
- Ambiente tem `node v26.8.1` e `python3 3.14.7`; usaremos **Node ESM** (`.mjs`) para o gerador (sem deps externas, só `fs`/`path`).
- Assunções de escopo (usuário não respondeu clarificar; ajustar se quiser):
  - Escopo = **arquitetura completa + mapa de cada feature**.
  - Entrega = **script gerador + notas base seedadas**.
  - Nível = **misto**: intro conceitual + mapa técnico das partes.

## Architecture / proposed approach
Criamos um script `scripts/gen-obsidian-notes.mjs` que lê os arquivos-fonte reais, extrai funções/exports por regex simples (sem parser TS completo — YAGNI) e emite notas Markdown linkadas na vault sob `APPs/Tauri/onPoint/`. Notas seedadas (conceituais e o overview de arquitetura) são escritas à mão para dar contexto; o script cuida do mapa que muda com o código. Tudo é Markdown puro com `[[wikilinks]]` para navegação no Obsidian.

## Step-by-step tasks

### Task 1 — Criar diretório de destino na vault
Comando (read-only-safe, só cria pasta):
```bash
mkdir -p ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/{00-MOC,01-Conceitos,02-Arquitetura,03-Features,04-Referencia}
```
Verificação esperada: `ls ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint` lista as 5 pastas.

### Task 2 — Nota conceitual: O que é Tauri v2 (seedada)
Criar arquivo `~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/01-Conceitos/Tauri-v2.md` com conteúdo markdown explicando: binário Rust + webview frontend; `invoke()` chama comandos Rust `#[tauri::command]`; plugins (`plugin-store`, `plugin-opener`, `plugin-updater`, `plugin-autostart`, `plugin-process`); IPC é o "coração". Incluir link `[[onPoint-Arquitetura]]`.

### Task 3 — Nota conceitual: React hooks básicos usados no projeto (seedada)
Arquivo `~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/01-Conceitos/React-Hooks-no-onPoint.md`: explicar `useState`, `useEffect`, `useRef`, `useCallback` com exemplo tirado de `usePointProgress.ts` (linhas 48-208). Mostrar o padrão "estado + efeito de 1s de timer".

### Task 4 — Nota de arquitetura overview (seedada, central)
Arquivo `~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/02-Arquitetura/onPoint-Arquitetura.md`. Conteúdo mínimo (copy-paste):
```markdown
# onPoint — Arquitetura

App desktop Tauri v2 (Rust + React/TS). Janela única 600x500, sem decoração,
transparente, centralizada (ver `src-tauri/tauri.conf.json` app.windows).

## Fluxo de dados
1. Rust (`src-tauri/src/lib.rs`) registra comandos: `greet`, `popup_window`,
   `reset_popup_window`, `hide_popup_window`.
2. Frontend chama via `invoke("popup_window")` em `src/lib/windowPopup.ts`.
3. Configurações de horário persistidas em `LazyStore("settings.json")`
   (plugin-store) com fallback em `localStorage`.
4. `usePointProgress` (hook central) calcula gauge/progresso em tempo real
   e dispara pop-up quando `isReadyToPunch`.

## Estrutura de pastas
- `src/App.tsx` — shell + drag region da janela
- `src/components/ui/navbar.tsx` — 3 abas (ponto/calendário/config)
- `src/views/point/` — lógica de ponto + gauge + confete
- `src/views/configuration/` — modais de horário
- `src/views/calendar/` — calendário
- `src/hooks/useUpdater.ts` — auto-update via GitHub releases
- `src-tauri/src/lib.rs` — backend Rust/tray

Ver [[onPoint-Features]] e [[onPoint-Referencia]].
```
Verificação: abrir a nota no Obsidian e confirmar wikilinks não-quebrados.

### Task 5 — Escrever o gerador `scripts/gen-obsidian-notes.mjs`
Criar `scripts/gen-obsidian-notes.mjs` (NA pasta do projeto, não na vault). Lógica:
- `ROOT = path.resolve(import.meta.dirname, "..")` (raiz do repo).
- `OUT = ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint` (resolver `~`).
- Listar arquivos `.ts/.tsx` em `src/` (recursivo simples).
- Para cada arquivo: ler, extrair `export function NOME`, `export const NOME`, `interface NOME`, `type NOME`, `export default function` via regex; montar uma nota em `03-Features/<relpath>.md` com: caminho relativo, linhas, lista de símbolos, e um trecho dos primeiros ~40 linhas comentado.
- Gerar/atualizar `00-MOC/onPoint-MOC.md` listando todas as notas com wikilinks.
- Gerar `04-Referencia/onPoint-Referencia.md` como tabela: arquivo | o que faz (1 linha) | símbolos principais.

Esqueleto copy-pasteável (complete, funcional):
```js
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(homedir(), "Documents/Obsidian/Vault/APPs/Tauri/onPoint");

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", "src-tauri/target", ".git"].some((sk) => p.includes(sk))) continue;
      walk(p, acc);
    } else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".d.ts")) {
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
];

function extractSymbols(src) {
  const out = new Set();
  for (const re of SYM_RE) {
    let m;
    while ((m = re.exec(src))) out.add(m[1]);
  }
  return [...out];
}

function oneLine(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const m = clean.match(/(?:interface|function|const|type)\s+([A-Za-z0-9_]+)[^\n]*=?\s*[{:(]/);
  return m ? m[0].slice(0, 80).replace(/\s+/g, " ").trim() : "";
}

const files = walk(join(ROOT, "src"));
const moc = ["# onPoint — Map of Content", "", "## Features (geradas do código)", ""];
const refRows = ["| Arquivo | O que faz | Símbolos |", "|---|---|---|"];

for (const f of files) {
  const rel = relative(ROOT, f);
  const src = readFileSync(f, "utf8");
  const syms = extractSymbols(src);
  const dest = join(OUT, "03-Features", rel.replace(/\.tsx?$/, ".md"));
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
    "## Primeiras linhas",
    "```ts",
    src.split("\n").slice(0, 40).join("\n"),
    "```",
    "",
    "Ver [[onPoint-Arquitetura]] e [[onPoint-MOC]].",
  ].join("\n");
  writeFileSync(dest, body);
  moc.push(`- [[${rel.replace(/\.tsx?$/, "")}]] — ${rel}`);
  refRows.push(`| \`${rel}\` | ${oneLine(src) || "—"} | ${syms.join(", ") || "—"} |`);
}

mkdirSync(join(OUT, "00-MOC"), { recursive: true });
writeFileSync(join(OUT, "00-MOC/onPoint-MOC.md"), moc.join("\n"));
mkdirSync(join(OUT, "04-Referencia"), { recursive: true });
writeFileSync(
  join(OUT, "04-Referencia/onPoint-Referencia.md"),
  ["# onPoint — Referência", "", ...refRows].join("\n")
);
console.log(`Geradas ${files.length} notas de feature em ${OUT}`);
```
Verificação (Task 5): `node scripts/gen-obsidian-notes.mjs` → saída `Geradas N notas de feature em /home/moonlight/Documents/Obsidian/Vault/APPs/Tauri/onPoint` com N>=20.

### Task 6 — Validar notas geradas
Comando:
```bash
ls ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/03-Features | head
cat ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/00-MOC/onPoint-MOC.md | head -20
```
Esperado: lista de `.md` por arquivo de `src/`; MOC com wikilinks.

### Task 7 — Script npm para reaproveitar
Adicionar ao `package.json` (scripts):
```json
"notes:obsidian": "node scripts/gen-obsidian-notes.mjs"
```
Verificação: `npm run notes:obsidian` imprime a mesma linha de sucesso.

### Task 8 — Ligar do vault existente (opcional)
Adicionar link na nota `~/Documents/Obsidian/Vault/APPs/Tauri/Tauri.md` (se existir) apontando para `[[onPoint-MOC]]`, ou criar `APPs/Tauri/onPoint.md` como portal que linka o MOC. Confirmar com `ls ~/Documents/Obsidian/Vault/APPs/Tauri/`.

## Tests / validation
Não há suíte de teste no repo (só `npm run build` = `tsc && vite build`). Para este plano, a validação é:
- TDD leve do gerador: escrever `scripts/gen-obsidian-notes.test.mjs` que importa `walk`/`extractSymbols` e afirma que `extractSymbols` encontra `usePointProgress` em `src/views/point/usePointProgress.ts` e que `walk` ignora `src-tauri/target`. Rodar `node --test scripts/` → 2 testes passando.
  - Teste mínimo copy-paste:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractSymbols } from "../gen-obsidian-notes.mjs";

test("extrai usePointProgress", () => {
  const src = `export function usePointProgress() { return {} }`;
  assert.ok(extractSymbols(src).includes("usePointProgress"));
});
```
- Build do app continua ok: `npm run build` (deve passar sem tocar em `src/`).
- Commit por etapa: Task 2-4 (seed notes não vão pro repo, vão pra vault — não commitar vault); Task 5-7 (script + package.json) com commit `feat: add obsidian notes generator`.

## Risks, tradeoffs, open questions
- **Regex, não parser TS**: falha em exports de uma linha estranha ou tipos condicionais. Aceitável para aprendizado; se quiser precisão, trocar por `typescript` compiler API (mais peso, YAGNI agora).
- **Notas seedadas vs geradas**: seedadas dão contexto mas podem desatualizar; o script cobre só o que muda. Revisar seed a cada release maior.
- **Escrever na vault**: o script escreve fora do repo (na vault). Não vai para git do projeto — intencional. Se a vault for sincronizada (Obsidian Sync/iCloud), as notas aparecem automático.
- **Caminho da vault hardcoded** em `homedir()/Documents/Obsidian/Vault/...`: se a vault mudar de lugar, atualizar `OUT` no script.
- **Open question**: o usuário quer realmente o gerador, ou só notas estáticas escritas uma vez? (Não respondeu ao clarificar — assumi gerador+seed; reduzir para só seed se preferir.)
- **Open question**: incluir `src-tauri/src/lib.rs` no mapa? Atualmente o script só varre `src/` (frontend). Se quiser Rust no mapa, estender `walk` para `src-tauri/src` e ajustar regex para `fn nome(` / `#[tauri::command]`.
