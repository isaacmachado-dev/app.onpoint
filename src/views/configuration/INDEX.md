# Módulo de Configurações (`src/views/configuration`)

Este módulo é responsável pelo gerenciamento de preferências e configurações do aplicativo **onPoint**, incluindo inicialização com o sistema operacional, definição e edição de escalas/turnos de trabalho, seleção inteligente de dias da semana e integração com o sistema de arquivos via Tauri Store.

---

## Estrutura de Arquivos

```
src/views/configuration/
├── Button.Toggle.tsx      # Componente acessível de switch liga/desliga
├── Modal.DatePicker.tsx   # Popover inteligente de seleção de dias da semana
├── Modal.Hour.tsx         # Modal de turnos renderizado via React createPortal
├── Modal.HourPicker.tsx   # Seletor de relógio 24h integrado com timepicker-ui-react
├── Page.Configuration.tsx # View principal de listagem e gerenciamento de escalas
└── INDEX.md               # Documentação técnica do módulo
```

---

## Componentes

### 1. `PageConfiguration` (`Page.Configuration.tsx`)
View principal exibida quando a aba **Configurações** está ativa na navegação central.

#### Responsabilidades:
- Controla a flag de inicialização automática ao ligar o sistema.
- Lista as escalas e horários cadastrados (ex.: `Segunda a Sexta`, `Finais de semana`) com ações de edição e exclusão.
- Aciona a abertura do modal de configuração de horários (`ModalHour`).
- Executa o fechamento completo do aplicativo via Tauri Window API (`appWindow.close()`).

#### Estados Internos:
| Estado | Tipo | Descrição |
| :--- | :--- | :--- |
| `ativo` | `boolean` | Flag indicando se a inicialização com o sistema está habilitada |
| `modalContainerHour` | `boolean` | Controla a visibilidade do modal de definição de horários |
| `editingSchedule` | `ScheduleItem \| null` | Escala selecionada para edição (ou `null` para novo cadastro) |
| `schedules` | `ScheduleItem[]` | Lista de escalas cadastradas salvas no Tauri Store e localStorage |

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

## Persistência de Dados

As configurações de horários e escalas são salvas utilizando `@tauri-apps/plugin-store` (`settings.json`) no sistema operacional com fallback e sincronia no `localStorage`:
- **Tauri Store**: Permite que o backend Rust leia as configurações de escalas para disparo de notificações e alarmes em segundo plano.
- **Sincronia Automática**: Criação, edição e exclusão de horários persistem instantaneamente ao salvar.
