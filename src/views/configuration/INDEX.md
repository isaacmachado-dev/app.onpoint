# Módulo de Configurações (`src/views/configuration`)

Este módulo é responsável pelo gerenciamento de preferências e configurações do aplicativo **onPoint**, incluindo inicialização com o sistema operacional (autostart), definição e edição de escalas/turnos de trabalho, seleção inteligente de dias da semana e integração com o sistema de arquivos via Tauri Store.

> **Regra de Autostart (baseado na configuração do app):** O estado de "Inicializar ao ligar o sistema" é sempre a **fonte de verdade (single source of truth)** a configuração persistida em `settings.json` (Tauri Store). O toggle apenas lê/escreve essa chave e o estado real do SO é sincronizado a partir dela — nunca o contrário.

---

## Estrutura de Arquivos

```
src/views/configuration/
├── Button.Toggle.tsx      # Componente acessível de switch liga/desliga
├── Modal.DatePicker.tsx   # Popover inteligente de seleção de dias da semana
├── Modal.Hour.tsx         # Modal de turnos renderizado via React createPortal
├── Modal.HourPicker.tsx   # Seletor de relógio 24h integrado com timepicker-ui-react
├── UpdateModal.tsx        # Modal de auto-update (updater + portal z-[100])
├── Page.Configuration.tsx # View principal de listagem e gerenciamento de escalas
└── INDEX.md               # Documentação técnica do módulo
```

---

## Componentes

### 1. `PageConfiguration` (`Page.Configuration.tsx`)
View principal exibida quando a aba **Configurações** está ativa na navegação central.

#### Responsabilidades:
- **Autostart config-driven:** Lê a chave `autostart` do Tauri Store (`settings.json`) ao montar e sincroniza o estado real do SO via `tauri-plugin-autostart`. Ao alternar o toggle, persiste a preferência na configuração do app e habilita/desabilita o autostart no sistema.
- Lista as escalas e horários cadastrados (ex.: `Segunda a Sexta`, `Finais de semana`) com ações de edição e exclusão.
- Aciona a abertura do modal de configuração de horários (`ModalHour`).
- Executa o fechamento completo do aplicativo via Tauri Window API (`appWindow.close()`).

#### Estados Internos:
| Estado | Tipo | Descrição |
| :--- | :--- | :--- |
| `ativo` | `boolean` | Flag indicando se a inicialização com o sistema está habilitada (espelha a chave `autostart` da config do app) |
| `autostartLoading` | `boolean` | `true` enquanto o estado real de autostart é lido/resolve do SO (desabilita o toggle nesse meio tempo) |
| `modalContainerHour` | `boolean` | Controla a visibilidade do modal de definição de horários |
| `editingSchedule` | `ScheduleItem \| null` | Escala selecionada para edição (ou `null` para novo cadastro) |
| `schedules` | `ScheduleItem[]` | Lista de escalas cadastradas salvas no Tauri Store e localStorage |

#### Fluxo de Autostart (config → SO)
1. **Mount** (`loadAutostart`): `store.get("autostart")` é a fonte de verdade; se divergir de `isEnabled()` do SO, aplica `enable()`/`disable()` para igualar.
2. **Toggle** (`handleToggleAutostart`): grava `autostart` no Tauri Store e executa `enable()`/`disable()` do `@tauri-apps/plugin-autostart`.

---

### 2. `ModalHour` (`Modal.Hour.tsx`)
Modal com backdrop blur e renderização via **`createPortal`** no `document.body`.

#### Arquitetura de Camadas (Stacking Context & Portals):
- **`createPortal(..., document.body)`**: Renderiza o modal fora da árvore DOM interna, evitando que a barra de navegação ou layouts pais fiquem sobrepostos.
- **Nível de Z-Index**:
  - `Modal.Hour.tsx`: `z-[100]` (cobre toda a janela do app e a navbar `z-10`).
  - `Modal.DatePicker.tsx` (Popover): `z-[120]` (abre sobre o modal).

#### Estrutura:
1. **Cabeçalho**: Título dinâmico (*"Definir Horário"* ou *"Editar Horário"*).
2. **Seletor de Dias**: `ModalDatePicker` para seleção dos dias aplicáveis.
3. **Turnos de Ponto**: 4 turnos padrão com badges coloridas e botões de seleção de horário:
   - `1° Horário entrada` (Padrão: 08:00)
   - `2° Horário saída` (Padrão: 12:00)
   - `3° Horário entrada` (Padrão: 13:00)
   - `4° Horário saída` (Padrão: 17:00)
4. **Botão Salvar**: Persiste os dados na escala ativa e fecha o modal.

---

### 3. `ModalDatePicker` (`Modal.DatePicker.tsx`)
Componente Popover para seleção dos dias da semana com `z-[120]`.

#### Modelo de Dados:
```typescript
export interface DayOfWeek {
  id: string;    // 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab'
  short: string; // 'Dom' | 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb'
  full: string;  // 'Domingo' | 'Segunda-feira' | ...
}
```

#### Rótulos Inteligentes:
- `Todos os dias`: Quando os 7 dias estão selecionados.
- `Segunda a Sexta`: Quando os 5 dias úteis estão selecionados.
- `Finais de semana`: Quando apenas Sábado e Domingo estão selecionados.
- `Seg, Ter, Qua`: Formatação abreviada para seleções customizadas.
- `Selecionar dias`: Quando nenhum dia está selecionado.

---

### 4. `ModalHourPicker` (`Modal.HourPicker.tsx`)
Wrapper sobre `timepicker-ui-react` que garante exibição e persistência estrita no padrão **24 horas (HH:MM)**.

#### Conversão de Formatos:
- **`to12h(time24)`**: Converte `"17:00"` para `"05:00 PM"` para inicializar o picker visual de 12 horas.
- **`to24h(hour, minutes, type)`**: Converte a saída do picker (ex: `05:00 PM`) de volta para o padrão militar 24h (`"17:00"`).

---

### 5. `ButtonToggle` (`Button.Toggle.tsx`)
Componente acessível de switch/toggle com suporte a animação deslizante e feedback visual.

#### Propriedades (`ButtonToggleProps`):
| Propriedade | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `label` | `string` | Sim | Texto principal exibido no card |
| `description` | `string` | Não | Subtítulo ou texto descritivo opcional |
| `checked` | `boolean` | Sim | Estado atual do toggle |
| `onChange` | `(checked: boolean) => void` | Sim | Callback disparado ao alternar o valor |
| `disabled` | `boolean` | Não | Desativa interações quando `true` |

---

### 6. `UpdateModal` (`UpdateModal.tsx`) — Auto-update completo
Modal premium para o fluxo **Checar atualizações** com `tauri-plugin-updater` (GitHub Releases) + `tauri-plugin-process`.

#### Máquina de Estados (via `src/hooks/useUpdater.ts`)
| Estado | UI | Ação |
|---|---|---|
| `checking` | Spinner `Loader2` + "Verificando…" | `check()` no `useEffect` ao abrir modal |
| `up-to-date` | `CheckCircle2` verde + `vX.Y.Z` | Botão Fechar |
| `available` | Card `Rocket` + `vAtual → vNova` + changelog (`body`) | "Baixar e instalar" → `downloadAndInstall(onProgress)` |
| `downloading` | Barra `framer-motion` + `%` (Started/Progress/Finished) | bloqueia backdrop |
| `ready` | "Pronto para instalar" | "Reiniciar agora" → `relaunch()` |
| `error` | `AlertTriangle` + msg + "Tentar novamente" | fallback `openUrl(RELEASES_URL)` |

#### Integração
*   **Hook:** `useUpdater()` encapsula `check()` do `@tauri-apps/plugin-updater`, `getVersion()` e `openUrl()` do `opener`. Persistência opcional em `settings.json` se necessário.
*   **Portal:** `createPortal(document.body)` `z-[100]` igual `ModalHour`, backdrop `bg-black/60 backdrop-blur-xs`.
*   **Host:** `Page.Configuration.tsx:15` `showUpdateModal` → `<UpdateModal onClose>` substitui o placeholder `location.reload()`.
*   **Fallback .deb:** Linux `.deb` não é patchável via updater — modal detecta ausência de `downloadAndInstall` e abre `https://github.com/isaacmachado-dev/app.onpoint/releases/latest` via `opener`.

---

## Integração Backend (Rust / Tauri) — Autostart + Updater

O toggle depende do plugin oficial **`tauri-plugin-autostart`** registrado no binário Rust.

### Registro (`src-tauri/src/lib.rs:55-57`)
```rust
use tauri_plugin_autostart::MacosLauncher;

.plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
.plugin(tauri_plugin_updater::Builder::new().build())
.plugin(tauri_plugin_process::init())
```

### Capacidade (`src-tauri/capabilities/default.json:22-24`)
```json
"permissions": ["store:default","autostart:default","updater:default","process:allow-restart"]
```
`updater:default` libera `check/download/install`; `process:allow-restart` libera `relaunch()`.

### Dependências
- **Rust** (`Cargo.toml`): `tauri-plugin-autostart = "2"`, `tauri-plugin-updater = "2"`, `tauri-plugin-process = "2"`
- **Frontend** (`package.json`): `@tauri-apps/plugin-autostart`, `@tauri-apps/plugin-updater`, `@tauri-apps/plugin-process` (^2)
- **Config** (`tauri.conf.json:39,64`): `bundle.createUpdaterArtifacts:true` + `plugins.updater: {pubkey, endpoints:[.../latest.json]}` (assinatura Ed25519 `~/.tauri/onpoint.key` → Secret `TAURI_SIGNING_PRIVATE_KEY` no `build.yml:50`)
- **CI** (`.github/workflows/build.yml:50`): `tauri-action@v0` lê `TAURI_SIGNING_PRIVATE_KEY` e publica `latest.json` + `.sig` no Release.

---

## Persistência de Dados

As configurações de horários e escalas são salvas utilizando `@tauri-apps/plugin-store` (`settings.json`) no sistema operacional com fallback e sincronia no `localStorage`:
- **Tauri Store**: Permite que o backend Rust leia as configurações de escalas para disparo de notificações e alarmes em segundo plano.
- **Sincronia Automática**: Criação, edição e exclusão de horários persistem instantaneamente ao salvar.
