# onPoint — Design System

> **Versão:** 2.0 · **Referência:** Inspiração no Material Expressss 3 / Google

---

## 🎨 Paleta de Cores

| Token Semântico | Valor Hex | Uso e Aplicação |
| :--- | :--- | :--- |
| `--color-brand-main` | `#25586A` | Cor de destaque primária: textos principais, botões primários, anel do gauge, dots concluídos e ícones ativos. |
| `--color-brand-secondary` | `#ACEBF0` | Cor de realce secundária: contornos ativos, fundo de botões secundários, partículas de água e detalhes contrastantes. |
| `--color-brand-background` | `#E4F6FB` | Cor de fundo geral do aplicativo e de cards contidos. |
| `surface-white` | `#FFFFFF` | Fundo de modais, popovers, pílula ativa da navbar e botões brancos. |
| `status-gold` | `#FFD700` / `#FFA500` | Estrelas de celebração da 4ª batida e badge *"De hoje tá pago"*. |

---

## 🔤 Tipografia

- **Família Tipográfica Principal:** Inter, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
- **Escala de Tamanhos:**
  - `text-3xl font-bold`: Relógio principal em tempo real (`PagePoint`).
  - `text-2xl font-black`: Título do turno ativo no modo tela cheia.
  - `text-base font-bold`: Logo e cabeçalhos de seções.
  - `text-xs font-medium / font-bold`: Rótulos de turno, badges e textos de apoio.
  - `text-[10px] font-bold`: Detalhes secundários, legendas e botões da barra de testes.

---

## 📐 Espaçamento e Raios de Borda

### Raios de Borda (*Border Radius*)
- **`rounded-full`**: Pílulas de navegação, botões circulares, widget central de água, marcadores de progresso e leitor biométrico.
- **`rounded-2xl` / `rounded-3xl`**: Cards de escala, containers de configuração e caixas modais.
- **`rounded-4xl`**: Estrutura externa da janela no arquivo `App.tsx`.

---

## 💫 Micro-Interações e Animações

### 1. Indicador Deslizante da Navbar
- **Efeito:** Translação contínua com efeito de mola elástica.
- **Cálculo:** $\text{translateX} = \text{activeIndex} \times 44\text{px}$.
- **Transição:** `transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)`.

### 2. Leitor Biométrico (`FingerprintIcon`)
- **Efeito de Traçado:** Ao pressionar o botão do mouse (`onMouseDown`), os traços vetoriais são desenhados de $0\%$ a $100\%$ em $0.65\text{s}$ (`pathLength: 0 -> 1`), permanecendo preenchidos no último frame.
- **Group-Press Feedback:** Pressionar o leitor ou o botão causa depressão sincronizada (`scale-90` e `scale-95`) com iluminação no anel biométrico.

### 3. Copo de Folga (`CupSodaIcon`)
- **Loop Infinito:** Onda do líquido, canudo e borbulhas de gás executam animações perpétuas e assíncronas no estado de folga.

### 4. Partículas e Celebração
- **Batidas 1 a 3:** Explosão de gotas de água azuis disparadas a partir do centro da tela.
- **4ª Batida:** Chuva de confetes com estrelas douradas ✨ disparadas por canhões laterais duplos.
