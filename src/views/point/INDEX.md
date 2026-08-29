# Módulo de Ponto (`src/views/point`)

Este módulo é a tela principal e o núcleo operacional do aplicativo **onPoint**. Ele é responsável por guiar o colaborador ao longo da sua jornada de trabalho diária, exibindo um relógio em tempo real (formato 24 horas), um indicador visual fluido da próxima batida (*Liquid Gauge*), acionamento de registro de ponto externo e uma barra de progresso com os marcos dos turnos diários.

---

## 📁 Estrutura de Arquivos

```
src/views/point/
├── Page.Point.tsx         # View principal limpa e declarativa
├── PointProgressBar.tsx   # Barra de progresso inferior e marcadores (dots) dos turnos
├── PointWidget.tsx        # Widget central (Liquid Gauge, Botão Bater Ponto, Folga ou Concluído)
├── usePointProgress.ts    # Custom Hook isolando toda a lógica de negócio, relógio e persistência
└── index.md               # Documentação técnica do módulo
```

---

## 🧩 Componentes e Hooks

### 1. `PagePoint` (`Page.Point.tsx`)
Componente principal da view de ponto. Conecta o hook de estado `usePointProgress` aos componentes visuais `PointWidget` e `PointProgressBar`.

#### Responsabilidades:
- Renderiza o cabeçalho com o relógio digital em tempo real (24h).
- Estrutura o layout central com o widget de status e a barra inferior de progresso.

---

### 2. `usePointProgress` (`usePointProgress.ts`)
Hook customizado que encapsula toda a lógica matemática, detecção de escalas, timers e persistência.

#### Retorno do Hook:
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `realTime` | `string` | Horário atual formatado em 24h (`HH:MM`) com atualização a cada segundo |
| `shifts` | `ShiftHour[]` | Lista dos 4 turnos configurados para o dia de hoje |
| `hasScheduleToday` | `boolean` | `true` se o dia atual possui escala cadastrada, `false` se for folga |
| `completedPunches` | `number` | Quantidade de batidas já registradas hoje (`0` a `4`) |
| `gaugeValue` | `number` | Porcentagem atual da água no Liquid Gauge (`0` a `100%`) |
| `isReadyToPunch` | `boolean` | `true` quando o horário da batida foi atingido e a água está cheia |
| `isAllCompleted` | `boolean` | `true` quando todas as batidas do dia foram realizadas |
| `currentShift` | `ShiftHour \| null` | Turno atual em andamento aguardando batida |
| `totalDayPercentage` | `number` | Porcentagem geral da jornada do dia para a barra inferior |
| `handlePunch` | `() => Promise<void>` | Dispara abertura do link, drenagem suave e avanço de turno |

#### Lógica de Inicialização Síncrona:
Ao carregar a view, o hook lê instantaneamente do `localStorage`:
1. `schedules`: Verifica se o dia atual possui escala cadastrada (evitando *flicker* visual nos fins de semana).
2. `punches_YYYY-MM-DD`: Quantidade de batidas já efetuadas no dia de hoje.
3. `gauge_YYYY-MM-DD`: Último nível da água registrado.

---

### 3. `PointWidget` (`PointWidget.tsx`)
Widget central circular de 130px com estados visuais dinâmicos.

#### Estados Visuais:
1. **Sem Expediente / Folga (`!hasScheduleToday`)**:
   - Exibe container com borda tracejada e ícone `<Coffee />` indicando dia de descanso.
2. **Pronto para Bater Ponto (`isReadyToPunch`)**:
   - Exibe o botão pulsante com ícone `<Fingerprint />`, horário do turno e chamada para ação.
3. **Jornada Concluída (`isAllCompleted`)**:
   - Exibe badge circular com ícone `<CheckCheck />` e mensagem "Dia Concluído! 4/4 batidas".
4. **Em Andamento (Liquid Gauge)**:
   - Renderiza a biblioteca `react-ts-liquid-gauge` com ondas animadas subindo proporcionalmente até o próximo horário.

#### Propriedades (`PointWidgetProps`):
| Propriedade | Tipo | Descrição |
| :--- | :--- | :--- |
| `hasScheduleToday` | `boolean` | Indica se o dia possui escala |
| `isReadyToPunch` | `boolean` | Ativa o botão de bater ponto |
| `isAllCompleted` | `boolean` | Indica fim do expediente |
| `currentShift` | `ShiftHour \| null` | Dados do turno atual |
| `gaugeValue` | `number` | Nível da água (0 a 100) |
| `totalShiftsCount` | `number` | Total de turnos cadastrados |
| `onPunch` | `() => void` | Callback ao clicar em bater ponto |

---

### 4. `PointProgressBar` (`PointProgressBar.tsx`)
Barra de progresso inferior que mapeia visualmente as 4 etapas do dia.

#### Marcadores dos Turnos (Dots):
- **Turno Concluído (`idx < completedPunches`)**: Dot sólido `bg-brand-main` com anel branco `ring-2`.
- **Turno em Andamento (`idx === completedPunches`)**: Ícone `<Loader2 />` com animação `animate-spin`.
- **Turnos Futuros (`idx > completedPunches`)**: Dot translúcido aguardando execução.
- **Ação "Configurar"**: Quando não há escala para o dia, exibe um botão que navega diretamente para a view de configurações (`PageConfiguration`).

---

## ⚙️ Regras de Negócio e Cálculos

### 1. Cálculo de Nível da Água ($0\% \rightarrow 100\%$)
- **1ª Batida (Entrada da manhã)**:
  - Início do intervalo: 2 horas antes do horário previsto (ou 00:00).
  - Alvo: Horário do 1° turno (ex.: `08:00`).
- **Batidas Subsequentes (2ª, 3ª e 4ª)**:
  - Início do intervalo: Horário da batida anterior ($T_{anterior}$).
  - Alvo: Horário da próxima batida ($T_{alvo}$).
- **Fórmula**:
  $$\text{Progresso} = \left( \frac{T_{atual} - T_{inicio}}{T_{alvo} - T_{inicio}} \right) \times 100\%$$
- Ao atingir $T_{atual} \ge T_{alvo}$, o valor atinge $100\%$ e o botão de bater ponto é liberado.

### 2. Fluxo ao Clicar em "Bater Ponto"
1. Abre a URL do sistema de ponto no navegador via `@tauri-apps/plugin-opener` (`openUrl`).
2. Executa a animação de drenagem suave da água ($100\% \rightarrow 0\%$) a cada 40ms (~800ms de duração).
3. Incrementa o contador `completedPunches`.
4. Persiste o novo estado em `localStorage`.
5. Inicia o preenchimento da água para o próximo turno configurado.

---

## 💾 Persistência de Dados

| Chave | Armazenamento | Propósito |
| :--- | :--- | :--- |
| `schedules` | `settings.json` (Tauri Store) / `localStorage` | Escalas e horários configurados |
| `punches_YYYY-MM-DD` | `localStorage` | Contador de batidas realizadas na data |
| `gauge_YYYY-MM-DD` | `localStorage` | Última porcentagem da água salva |

