# Plano: Algoritmo do onPoint reescrito para estudo na Obsidian

> Modo plan-only (2026-08-31). Não executar nada daqui ainda.
> **Assunção de interpretação** (clarify falhou por timeout): "algo neste projeto
> precisa ser *escrito* de forma a que eu *aprenda* no /obsidian" = reescrever o
> algoritmo real de ponto/gauge do onPoint como módulo puro, comentado e testável,
> e gerar notas na Obsidian que embutem e expliquem esse código. Se o intento era
> só gerar notas (sem mexer no código), ver `.hermes/plans/2026-08-31_064129-...`
> e avise — este plano pode ser reduzido.

## Goal
Tornar o algoritmo de ponto/gauge do onPoint estudável: extrair a lógica de `usePointProgress.ts` para funções puras comentadas e testadas, e gerar notas de aprendizado na Obsidian vault que embutem o código real com explicação.

## Current context / assumptions
- Repo: `/home/moonlight/New Projects/app/app.onpoint` — Tauri v2 (Rust em `src-tauri/`, frontend React+TS+Vite em `src/`). `package.json` só tem `build` (`tsc && vite build`); **não há test runner**.
- O "algoritmo" mora em `src/views/point/usePointProgress.ts` (430 linhas): um hook React que mistura estado, timers de 1s, efeitos de pop-up e simuladores de teste. Difícil de ler/testar por ser tudo acoplado ao React.
- Obsidian vault em `~/Documents/Obsidian/Vault`. Destino natural: `APPs/Tauri/onPoint/` (já existe `APPs/Tauri/`).
- Ambiente: `node v26.8.1`. Usaremos **vitest** (devDep) para os testes das funções puras.
- Convenção de idioma: comentar em **PT-BR** (usuário escreve em PT-BR).

## Architecture / proposed approach
Extraímos as funções puras (sem React, sem `localStorage`) de `usePointProgress.ts` para `src/views/point/pointAlgorithm.ts`: `timeToMinutes`, `computeGaugeValue`, `isReadyToPunch`, `totalDayPercentage`, etc. O hook fica "fino" — guarda estado e chama essas funções. Funções puras são testáveis com `vitest` sem montar componente. Por fim, um gerador `scripts/gen-obsidian-notes.mjs` lê os arquivos reais e emite notas (MOC + conceitos + mapa técnico) na vault com wikilinks.

## Step-by-step tasks

### Task 1 — Criar `src/views/point/pointAlgorithm.ts` (funções puras, comentadas)
Arquivo novo. Substitui a lógica espalhada no hook. Conteúdo copy-pasteável:

```ts
// pointAlgorithm.ts
// Lógica PURO do cálculo de ponto/gauge do onPoint.
// Nenhuma dependência de React/localStorage: dado uma entrada, devolve saída.
// (Estudar estas funções isoladas é o objetivo das notas na Obsidian.)

export const DAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;

export interface ShiftHour {
  id: number;
  label: string;
  time: string; // "HH:MM"
}

/** "08:30" -> 510 (minutos desde meia-noite). String vazia/inválida -> 0. */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * % do gauge para o PRÓXIMO turno a bater, dado o horário atual.
 * - completedPunches >= total => 100 (dia completo)
 * - agora >= horário-alvo      => 100 (já passou da hora de bater)
 * - agora <= início da janela  => 0
 * - no meio                     => proporcional (1..99)
 * A "janela" do 1° turno começa 120 min antes do alvo; dos demais, no turno anterior.
 */
export function computeGaugeValue(
  now: Date,
  shifts: ShiftHour[],
  completedPunches: number
): number {
  const totalShifts = shifts.length;
  if (completedPunches >= totalShifts) return 100;

  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const target = shifts[completedPunches];
  const targetMinutes = timeToMinutes(target?.time || "08:00");

  let startMinutes = 0;
  if (completedPunches === 0) {
    startMinutes = Math.max(0, targetMinutes - 120);
  } else {
    const prev = shifts[completedPunches - 1];
    startMinutes = timeToMinutes(prev?.time || "08:00");
  }

  if (nowMinutes >= targetMinutes) return 100;
  if (nowMinutes <= startMinutes) return 0;
  const diffTotal = targetMinutes - startMinutes;
  const diffElapsed = nowMinutes - startMinutes;
  return Math.min(99, Math.max(1, Math.round((diffElapsed / diffTotal) * 100)));
}

/** Verdadeiro quando o gauge encheu e é hora de lembrar de bater o ponto. */
export function isReadyToPunch(args: {
  hasScheduleToday: boolean;
  shifts: ShiftHour[];
  completedPunches: number;
  gaugeValue: number;
  isDraining: boolean;
  isSnoozed: boolean;
}): boolean {
  const { hasScheduleToday, shifts, completedPunches, gaugeValue, isDraining, isSnoozed } = args;
  const isAllCompleted = hasScheduleToday && shifts.length > 0 && completedPunches >= shifts.length;
  return !isAllCompleted && hasScheduleToday && gaugeValue >= 100 && !isDraining && !isSnoozed;
}

/** % geral do dia: turnos fechados (100 cadas) + fração do turno atual. */
export function totalDayPercentage(args: {
  hasScheduleToday: boolean;
  shifts: ShiftHour[];
  completedPunches: number;
  gaugeValue: number;
  isAllCompleted: boolean;
}): number {
  const { hasScheduleToday, shifts, completedPunches, gaugeValue, isAllCompleted } = args;
  if (!(hasScheduleToday && shifts.length > 0)) return 0;
  return Math.min(
    100,
    Math.round(((completedPunches * 100 + (isAllCompleted ? 0 : gaugeValue)) / (shifts.length * 100)) * 100)
  );
}
```

Verificação (Task 1): `npx tsc --noEmit` não deve acusar erro de tipo neste arquivo.

### Task 2 — Testes da lógica pura: `src/views/point/pointAlgorithm.test.ts`
Criar com **vitest**. Conteúdo copy-pasteável:

```ts
import { describe, it, expect } from "vitest";
import { timeToMinutes, computeGaugeValue, isReadyToPunch, totalDayPercentage } from "./pointAlgorithm";
import type { ShiftHour } from "./pointAlgorithm";

const shifts: ShiftHour[] = [
  { id: 1, label: "1° Entrada", time: "08:00" },
  { id: 2, label: "2° Saída", time: "12:00" },
  { id: 3, label: "3° Entrada", time: "13:00" },
  { id: 4, label: "4° Saída", time: "17:00" },
];

describe("timeToMinutes", () => {
  it("08:00 -> 480", () => expect(timeToMinutes("08:00")).toBe(480));
  it("17:30 -> 1050", () => expect(timeToMinutes("17:30")).toBe(1050));
  it("string vazia -> 0", () => expect(timeToMinutes("")).toBe(0));
});

describe("computeGaugeValue", () => {
  it("100 se passou do horário alvo (08:01)", () => {
    expect(computeGaugeValue(new Date(2026, 0, 1, 8, 1), shifts, 0)).toBe(100);
  });
  it("0 antes da janela (06:00)", () => {
    expect(computeGaugeValue(new Date(2026, 0, 1, 6, 0), shifts, 0)).toBe(0);
  });
  it("50% no meio da janela (07:00, janela 06:00-08:00)", () => {
    expect(computeGaugeValue(new Date(2026, 0, 1, 7, 0), shifts, 0)).toBe(50);
  });
  it("100 quando todos os turnos concluídos", () => {
    expect(computeGaugeValue(new Date(), shifts, 4)).toBe(100);
  });
});

describe("isReadyToPunch", () => {
  it("true quando gauge=100 e agendado", () =>
    expect(isReadyToPunch({ hasScheduleToday: true, shifts, completedPunches: 0, gaugeValue: 100, isDraining: false, isSnoozed: false })).toBe(true));
  it("false se adiado (snoozed)", () =>
    expect(isReadyToPunch({ hasScheduleToday: true, shifts, completedPunches: 0, gaugeValue: 100, isDraining: false, isSnoozed: true })).toBe(false));
});

describe("totalDayPercentage", () => {
  it("0 sem agendamento", () =>
    expect(totalDayPercentage({ hasScheduleToday: false, shifts: [], completedPunches: 0, gaugeValue: 0, isAllCompleted: false })).toBe(0));
  it("25% com 1 de 4 turnos fechados", () =>
    expect(totalDayPercentage({ hasScheduleToday: true, shifts, completedPunches: 1, gaugeValue: 0, isAllCompleted: false })).toBe(25));
});
```

### Task 3 — Adicionar vitest e rodar os testes (TDD: ver falha -> passa)
1. `npm install -D vitest` (instala devDep).
2. Adicionar em `package.json` > `scripts`:
   ```json
   "test": "vitest run"
   ```
3. Rodar: `npm test`
   - Saída esperada: `Test Files  1 passed (1)` / `Tests  9 passed (9)` (ou contagem igual à soma dos `it`).

### Task 4 — Refatorar `usePointProgress.ts` para usar as funções puras
No hook, importar do novo módulo e substituir os blocos equivalentes. Padrão (não reescrever o arquivo inteiro — só trocar estas partes):

- Topo do arquivo: `import { computeGaugeValue, isReadyToPunch, totalDayPercentage } from "./pointAlgorithm";`
- Dentro do `updateProgress` (linhas ~169-190), substituir o cálculo manual por:
  ```ts
  const nextVal = computeGaugeValue(now, shifts, completedPunches);
  ```
  (remover `timeToMinutes` local e o bloco `let nextVal...` — agora delegado).
- Substituir `const isReadyToPunch = ...` (linha 388) por:
  ```ts
  const isReadyToPunch = isReadyToPunch({ hasScheduleToday, shifts, completedPunches, gaugeValue, isDraining, isSnoozed });
  ```
- Substituir `totalDayPercentage` (linhas 401-406) por:
  ```ts
  const totalDayPercentage = totalDayPercentage({ hasScheduleToday, shifts, completedPunches, gaugeValue, isAllCompleted });
  ```
- `timeToMinutes` local (linhas 24-28) e `DAY_KEYS` (linha 8) podem continuar ou ser importados de `pointAlgorithm`; manter `DAY_KEYS` local se usado em `getInitialScheduleForToday` (sim, é usado) — importar de `pointAlgorithm` e remover a declaração local para DRY.

Verificação (Task 4): `npm run build` continua passando (`tsc && vite build` sem erros de tipo).

### Task 5 — Gerador de notas Obsidian: `scripts/gen-obsidian-notes.mjs`
Criar script Node ESM (sem deps) que varre `src/**/*.ts(x)` e `src-tauri/src/**/*.rs`, extrai símbolos por regex e escreve notas na vault. Esqueleto funcional (adaptado do plano anterior):

```js
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(homedir(), "Documents/Obsidian/Vault/APPs/Tauri/onPoint");

function walk(dir, acc = []) {
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
  /#\[tauri::command\]\s*(?:async\s+)?fn\s+([A-Za-z0-9_]+)/g,
];

function extractSymbols(src) {
  const out = new Set();
  for (const re of SYM_RE) { let m; while ((m = re.exec(src))) out.add(m[1]); }
  return [...out];
}

const files = walk(join(ROOT, "src")).concat(walk(join(ROOT, "src-tauri/src")));
const moc = ["# onPoint — Map of Content", "", "## Arquivos (gerados do código)", ""];
const refRows = ["| Arquivo | Símbolos |", "|---|---|"];

for (const f of files) {
  const rel = relative(ROOT, f);
  const src = readFileSync(f, "utf8");
  const syms = extractSymbols(src);
  const dest = join(OUT, "03-Arquitetura", rel.replace(/\.(tsx?|rs)$/, ".md"));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, [
    `# ${rel}`,
    "",
    "> Gerado por `scripts/gen-obsidian-notes.mjs`. Não editar à mão.",
    "",
    `Caminho: \`${rel}\` (${src.split("\n").length} linhas)`,
    "",
    "## Símbolos",
    syms.length ? syms.map((s) => `- \`${s}\``).join("\n") : "- (nenhum)",
    "",
    "## Código (primeiras 60 linhas)",
    "```ts",
    src.split("\n").slice(0, 60).join("\n"),
    "```",
    "",
    "Ver [[onPoint-Arquitetura]] e [[onPoint-MOC]].",
  ].join("\n"));
  moc.push(`- [[${rel.replace(/\.(tsx?|rs)$/, "")}]] — ${rel}`);
  refRows.push(`| \`${rel}\` | ${syms.join(", ") || "—"} |`);
}

mkdirSync(join(OUT, "00-MOC"), { recursive: true });
writeFileSync(join(OUT, "00-MOC/onPoint-MOC.md"), moc.join("\n"));
mkdirSync(join(OUT, "04-Referencia"), { recursive: true });
writeFileSync(join(OUT, "04-Referencia/onPoint-Referencia.md"), ["# onPoint — Referência", "", ...refRows].join("\n"));
console.log(`Geradas ${files.length} notas em ${OUT}`);
```

Verificação (Task 5): `node scripts/gen-obsidian-notes.mjs` → `Geradas N notas em /home/moonlight/Documents/Obsidian/Vault/APPs/Tauri/onPoint` com N >= 20.

### Task 6 — Notas conceituais seedadas (escritas à mão na vault)
Criar na vault (fora do repo — não vão para git):
- `APPs/Tauri/onPoint/01-Conceitos/Tauri-v2.md`: binário Rust + webview; `invoke()` ↔ `#[tauri::command]`; plugins (store/opener/updater/autostart/process). Link `[[onPoint-Arquitetura]]`.
- `APPs/Tauri/onPoint/01-Conceitos/Hooks-React-no-onPoint.md`: `useState`/`useEffect`/`useRef`/`useCallback`; padrão "estado + timer de 1s" visto em `usePointProgress`.
- `APPs/Tauri/onPoint/02-Arquitetura/onPoint-Arquitetura.md`: overview (janela 600x500 sem decoração/transparente; fluxo Rust↔frontend; `LazyStore("settings.json")` com fallback `localStorage`; `usePointProgress` como hook central). Linka `[[onPoint-MOC]]`.

### Task 7 — npm script para reaproveitar
Em `package.json` > `scripts` adicionar:
```json
"notes:obsidian": "node scripts/gen-obsidian-notes.mjs"
```
Verificação: `npm run notes:obsidian` imprime a mesma linha de sucesso.

### Task 8 — Build final de sanidade
`npm run build` → `tsc` sem erros e `vite build` conclui. Confirma que o refactor (Task 4) não quebrou o app.

## Tests / validation (ciclo TDD por task)
- Task 2: escrever `pointAlgorithm.test.ts` ANTES de confiar na lógica; `npm test` deve mostrar os 9 testes verdes.
- Task 4: `npm run build` (tsc) valida que o hook tipa certo após usar as funções puras.
- Task 5: `node scripts/gen-obsidian-notes.mjs` + `ls ~/Documents/Obsidian/Vault/APPs/Tauri/onPoint/03-Arquitetura | wc -l` deve ser >= 20.
- Commits frequentes:
  - `feat: extract point algorithm into pure tested functions` (Tasks 1-3)
  - `refactor: usePointProgress delegates to pointAlgorithm` (Task 4)
  - `feat: add obsidian notes generator + seed notes` (Tasks 5-7)
  - (notas da vault NÃO são commitadas no repo)

## Risks, tradeoffs, open questions
- **Interpretação do pedido**: o clarify expirou; assumi "reescrever o algoritmo para estudo + notas". Se o usuário queria só notas (sem tocar no código), descartar Tasks 1-4 e ficar com 5-7 (reaproveitando o plano `2026-08-31_064129`).
- **Regex, não parser TS/Rust**: falha em exports exóticos. Aceitável para aprendizado (YAGNI). Trocar por TS compiler API se quiser precisão.
- **Vault path hardcoded** em `homedir()/Documents/Obsidian/Vault/...`: se a vault mudar, ajustar `OUT`.
- **Notas seedadas podem desatualizar**; o gerador cobre só o que muda no código. Revisar seed a cada release.
- **Vitest adiciona devDep** (~pequena); se o usuário preferir zero deps, dá pra usar `node --test` com `tsx`, mas vitest é o caminho mais simples e padrão.
- **Open question**: incluir o backend Rust (`src-tauri/src/lib.rs`) no mapa de notas? O script da Task 5 já varre `src-tauri/src` — confirmar se a vault deve conter notas de Rust também.
