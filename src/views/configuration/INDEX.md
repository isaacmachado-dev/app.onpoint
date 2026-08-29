# Módulo de Configurações (`src/views/configuration`)

Este módulo é responsável pelo gerenciamento de preferências e configurações do aplicativo **onPoint**, incluindo inicialização do sistema, definição de escalas e horários de trabalho, além do controle de encerramento da aplicação.

---

## 📁 Estrutura de Arquivos

```
src/views/configuration/
├── Button.Toggle.tsx      # Componente de chave liga/desliga (switch) customizado
├── Modal.DatePicker.tsx   # Seletor de dias da semana (dias úteis, finais de semana, customizado)
├── Modal.Hour.tsx         # Modal de definição dos horários de batida de ponto
├── Page.Configuration.tsx # View/Página principal de configurações
└── index.md               # Documentação técnica do módulo
```

---

## 🧩 Componentes

### 1. `PageConfiguration` (`Page.Configuration.tsx`)
View principal exibida quando a aba **Configurações** está ativa na navegação central.

#### Responsabilidades:
- Controla o estado de inicialização automática ao ligar o sistema.
- Aciona a abertura do modal de configuração de horários (`ModalHour`).
- Executa o fechamento completo do aplicativo via Tauri Window API (`appWindow.close()`).

#### Estados Internos:
| Estado | Tipo | Descrição |
| :--- | :--- | :--- |
| `ativo` | `boolean` | Flag indicando se a inicialização com o sistema está habilitada |
| `modalContainerHour` | `boolean` | Controla a visibilidade do modal de definição de horários |

---

### 2. `ButtonToggle` (`Button.Toggle.tsx`)
Componente acessível de switch/toggle com suporte a animação deslizante e feedback visual.

#### Propriedades (`ButtonToggleProps`):
| Propriedade | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `label` | `string` | Sim | Texto principal exibido no card |
| `description` | `string` | Não | Subtítulo ou texto descritivo opcional |
| `checked` | `boolean` | Sim | Estado atual do toggle (marcado/desmarcado) |
| `onChange` | `(checked: boolean) => void` | Sim | Callback disparado ao alternar o valor |
| `disabled` | `boolean` | Não | Desativa interações quando `true` (padrão: `false`) |
| `activeColorClass` | `string` | Não | Classe Tailwind para o fundo ativo (padrão: `'bg-emerald-500'`) |
| `className` | `string` | Não | Classes adicionais para o container do botão |

#### Acessibilidade:
- Utiliza `role="switch"` e `aria-checked={checked}`.
- Propriedade `touchAction: 'manipulation'` para otimização em telas de toque.

---

### 3. `ModalHour` (`Modal.Hour.tsx`)
Modal com backdrop blur para configuração dos turnos de batida de ponto do colaborador.

#### Propriedades (`ModalHourProps`):
| Propriedade | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `setModalContainerHour` | `(modal: boolean) => void` | Sim | Função para fechar/abrir o modal |

#### Estrutura:
1. **Cabeçalho**: Título "Definir Horário" estilizado em `text-brand-main`.
2. **Seletor de Dias**: Componente `ModalDatePicker` para seleção dos dias aplicáveis.
3. **Turnos de Ponto**:
   - `1° Horário entrada`
   - `2° Horário saída` (intervalo/almoço)
   - `3° Horário entrada` (retorno)
   - `4° Horário saída` (fim de expediente)
4. **Ação Principal**: Botão "Salvar" para confirmar e persistir alterações.

---

### 4. `ModalDatePicker` (`Modal.DatePicker.tsx`)
Componente Popover para seleção dos dias da semana aplicáveis à rotina de trabalho.

#### Modelo de Dados:
```typescript
export interface DayOfWeek {
  id: string;   // Identificador único (ex: 'seg', 'ter')
  short: string; // Nome abreviado (ex: 'Seg', 'Ter')
  full: string;  // Nome por extenso (ex: 'Segunda-feira')
}
```

#### Constantes:
- `DAYS_OF_WEEK`: Lista ordenada dos 7 dias da semana iniciando em Domingo (`dom` até `sab`).

#### Funcionalidades:
- **Seleção Individual**: Alternância de seleção ao clicar no botão do dia.
- **Rótulo Inteligente no Botão**:
  - `Todos os dias`: Quando os 7 dias estão selecionados.
  - `Segunda a Sexta`: Quando apenas os 5 dias úteis estão selecionados.
  - `Finais de semana`: Quando apenas Sábado e Domingo estão selecionados.
  - Lista formatada: Ex: `"Seg, Ter, Qua"` para seleções customizadas.
  - `Selecionar dias`: Quando nenhum dia está selecionado.
- **Atalhos Rápidos**:
  - `Seg – Sex`: Seleciona rapidamente os 5 dias úteis.
  - `Todos`: Marca todos os 7 dias.
  - `Limpar`: Remove todas as seleções.

---

### 5. `ModalHourPicker` (`Modal.HourPicker.tsx`)
Componente para seleção de horários de turno utilizando a biblioteca `timepicker-ui-react` no formato 24 horas.

#### Propriedades (`ModalHourPickerProps`):
| Propriedade | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `initialTime` | `string` | Não | Horário inicial exibido no relógio (padrão: `'08:00'`) |
| `onConfirm` | `(time: string) => void` | Sim | Callback executado ao confirmar um horário formatado (`HH:MM`) |
| `onCancel` | `() => void` | Sim | Callback executado ao cancelar ou fechar o seletor |

#### Funcionamento:
- Ao ser montado, aciona automaticamente o clique no input interno referenciado para exibir o relógio Material Design com animação fluida.
- Configurado com relógio de **24 horas**, tema **basic** e rótulos em português (*"Confirmar"*, *"Cancelar"*, *"Definir Horário"*).

---

## 🎨 Paleta de Cores e Temas

Os componentes utilizam as variáveis de tema configuradas no Tailwind CSS v4:
- `--color-brand-main`: `#25586A` (Azul escuro principal, botões ativos e títulos)
- `--color-brand-secondary`: `#ACEBF0` (Azul claro de destaque e trilhos)
- `--color-brand-background`: `#E4F6FB` (Fundo geral da aplicação)

---

## 🔗 Integração Tauri

A página utiliza a API do Tauri para interação com a janela nativa:
```typescript
import { getCurrentWindow } from "@tauri-apps/api/window";

const fecharJanela = async () => {
  const appWindow = getCurrentWindow();
  await appWindow.close(); // Encerra o processo da janela
};
```

