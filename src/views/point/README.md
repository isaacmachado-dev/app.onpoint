# Módulo de Ponto (`src/views/point`)

Este módulo é a tela principal e o núcleo operacional do aplicativo **onPoint**. Ele é responsável por guiar o colaborador ao longo da sua jornada de trabalho diária, exibindo um relógio em tempo real no formato 24 horas, um indicador visual fluido da próxima batida (*Liquid Gauge*), acionamento de registro de ponto externo em tela cheia, barra de progresso com os marcos dos turnos diários e animações de celebração com confetes e partículas.

---

## Estrutura de Arquivos

```
src/views/point/
├── Page.Point.tsx         # View principal com suporte a modo tela cheia e barra de testes
├── PointProgressBar.tsx   # Barra de progresso inferior com marcadores (dots) e Loader ativo
├── PointWidget.tsx        # Widget central (Liquid Gauge, Botão Bater Ponto, Folga ou Concluído)
├── usePointProgress.ts    # Custom Hook com relógio 24h, cálculo de progresso e persistência
├── confetti.ts            # Motor de micro-partículas e celebração com estrelas douradas
└── README.md               # Documentação técnica detalhada do módulo
```

---

## Componentes e Hooks

### 1. `PagePoint` (`Page.Point.tsx`)
Componente principal da view de ponto. Conecta o hook de estado `usePointProgress` aos componentes visuais `PointWidget` e `PointProgressBar`.

#### Responsabilidades:
- **Relógio 24h**: Renderiza o relógio digital no topo atualizado a cada segundo (`HH:MM`).
- **Modo Tela Cheia (100% da Janela)**: Ao atingir o horário da batida (`isReadyToPunch`), cobre 100% da janela (`fixed inset-0 z-50`) com um painel interativo pulsante com suporte ao arraste de janela (`data-tauri-drag-region`).
- **Leitor Biométrico Integrado (`FingerprintIcon`)**:
  - Exibe o leitor biométrico estilizado com tamanho expandido (`size={76}`).
  - Ao pressionar e segurar (`onMouseDown` / `onTouchStart`), executa o traçado vetorial completo do SVG até $100\%$ (`pathLength: 0 -> 1`), permanecendo preenchido e iluminado no último frame.
  - Sincroniza a pressão física (`group-press`) entre o leitor e o botão *"BATER PONTO AGORA"*.
- **Barra de Teste Rápido**: Toolbar discreta na base para simulação imediata (`1°`, `2°`, `3°`, `4° ✨`, `Encher 🌊`, `Hora do Ponto`, `Reset`).

---

### `usePointProgress` (`usePointProgress.ts`)
Hook customizado que encapsula toda a lógica matemática, detecção de escalas, timers, drenagem suave e persistência.

#### Retorno do Hook:
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `realTime` | `string` | Horário atual formatado em 24h (`HH:MM`) |
| `shifts` | `ShiftHour[]` | Lista dos turnos configurados para o dia de hoje |
| `hasScheduleToday` | `boolean` | `true` se o dia atual possui escala cadastrada, `false` se for folga |
| `completedPunches` | `number` | Quantidade de batidas já registradas hoje (`0` a `4`) |
| `gaugeValue` | `number` | Porcentagem atual da água no Liquid Gauge (`0` a `100%`) |
| `isReadyToPunch` | `boolean` | `true` quando o horário da batida foi atingido e a água está cheia |
| `isAllCompleted` | `boolean` | `true` quando todas as batidas do dia foram realizadas |
| `currentShift` | `ShiftHour \| null` | Turno atual em andamento aguardando batida |
| `totalDayPercentage` | `number` | Porcentagem geral da jornada do dia para a barra inferior |
| `handlePunch` | `() => Promise<void>` | Dispara abertura do link, confetes, drenagem suave e avanço de turno |
| `testSimulatePunch` | `(punchCount: number) => void` | Simula a batida $N$ disparando a celebração correspondente |
| `testTriggerReadyToPunch` | `() => void` | Força a água para 100% e abre o modo tela cheia |
| `testSimulateGrowth` | `() => void` | Simula a água enchendo gradualmente em tempo real de 0% até 100% |
| `testResetDay` | `() => void` | Reseta batidas e água para 0% e descongela o relógio em tempo real |

---

### 3. `PointWidget` (`PointWidget.tsx`)
Widget central circular de 130px com estados visuais dinâmicos.

#### Estados Visuais:
1. **Sem Expediente / Folga (`!hasScheduleToday`)**:
   - Exibe container com borda tracejada, ícone `<CupSodaIcon />` animado continuamente e texto *"Sem expediente / Dia de folga"*.
2. **Pronto para Bater Ponto (`isReadyToPunch`)**:
   - Exibe o botão pulsante com ícone `<Fingerprint />`, horário do turno e chamada para ação.
3. **Jornada Concluída (`isAllCompleted`)**:
   - Exibe badge circular com ícone `<Star />` inclinado (`-rotate-12 hover:rotate-0`) e mensagem *"De hoje tá pago"*. O clique na estrela redispara os confetes dourados.
4. **Em Andamento (Liquid Gauge)**:
   - Renderiza a biblioteca `react-ts-liquid-gauge` com ondas animadas subindo proporcionalmente até o próximo horário previsto.

---

### 4. `PointProgressBar` (`PointProgressBar.tsx`)
Barra de progresso inferior que mapeia visualmente as etapas do dia.

#### Marcadores dos Turnos (Dots):
- **Turno Concluído (`idx < completedPunches`)**: Dot sólido `bg-brand-main` com anel branco `ring-2`.
- **Turno em Andamento (`idx === completedPunches`)**: Ícone `<Loader2 />` animado (`animate-spin`).
- **Turnos Futuros (`idx > completedPunches`)**: Dot translúcido aguardando execução.
- **Ação "Configurar"**: Quando não há escala para o dia, exibe botão com callback `onNavigateToConfiguration` para abrir a tela de configurações.

---

### 5. `confetti.ts`
Motor de celebrações visuais construído sobre `canvas-confetti`:
- `triggerWaterSplashConfetti()`: Mini explosão de gotas circulares em tons de azul (`#25586A` e `#ACEBF0`) ao redor do círculo central (batidas 1, 2 e 3).
- `triggerFinalCelebrationConfetti()`: Disparo duplo nas laterais com confetes e **estrelas douradas ✨** na tela inteira ao finalizar a 4ª batida do dia.

---

## Regras de Negócio e Cálculos

### 1. Cálculo de Nível da Água ($0\% \rightarrow 100\%$)
- **1ª Batida (Entrada da manhã)**:
  - Início do intervalo: 2 horas antes do horário previsto (ou 00:00).
  - Alvo: Horário do 1° turno (ex.: `08:00`).
- **Batidas Subsequentes (2ª, 3ª e 4ª)**:
  - Início do intervalo: Horário da batida anterior ($T_{\text{anterior}}$).
  - Alvo: Horário da próxima batida ($T_{\text{alvo}}$).
- **Fórmula**:
  $$\text{Progresso} = \left( \frac{T_{\text{atual}} - T_{\text{inicio}}}{T_{\text{alvo}} - T_{\text{inicio}}} \right) \times 100\%$$
- Ao atingir $T_{\text{atual}} \ge T_{\text{alvo}}$, o valor atinge $100\%$ e o modo tela cheia é ativado.

### 2. Fluxo ao Clicar em "Bater Ponto"
1. Abre a URL do sistema de ponto no navegador via `@tauri-apps/plugin-opener` (`openUrl`).
2. Dispara animação de partículas/confetes correspondente.
3. Executa drenagem suave da água ($100\% \rightarrow 0\%$) a cada 40ms (~800ms de duração).
4. Incrementa o contador `completedPunches` e persiste em `localStorage`.
5. Prepara o preenchimento da água em direção ao próximo turno cadastrado.

---

## Persistência de Dados

| Chave | Armazenamento | Propósito |
| :--- | :--- | :--- |
| `schedules` | `settings.json` (Tauri Store) / `localStorage` | Escalas e turnos configurados |
| `punches_YYYY-MM-DD` | `localStorage` | Contador de batidas realizadas na data |
| `gauge_YYYY-MM-DD` | `localStorage` | Última porcentagem da água salva |
