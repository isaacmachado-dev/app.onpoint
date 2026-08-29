# onPoint — Especificação Técnica

> **Versão:** 0.2.0 · **Objetivo:** Garantir a pontualidade no registro de ponto diário através de micro-interações elegantes e feedback visual contínuo.

---

## 1. Visão Geral e Princípios de Design

- **Estética:** Inspirado no Google / Material Expressss 3, paleta azul oceano (`#25586A`, `#ACEBF0`, `#E4F6FB`, `#FFFFFF`), cantos arredondados (`rounded-3xl` / `rounded-4xl`), transições suaves e feedback tátil.
- **Assinatura Visual:** Relógio digital centralizado acompanhado por medidor líquido (*Liquid Fill Gauge*) que se preenche progressivamente à medida que o horário do turno se aproxima.
- **Micro-Interações Recompensadoras:** Chuva de confetes com gotas azuis em batidas intermediárias e explosão de estrelas douradas ✨ ao concluir o expediente.

---

## 2. Arquitetura do Software

- **Front-end:** Vite 7, React 19, TypeScript 5, Tailwind CSS 4.
- **Micro-Animações:** `framer-motion`, `canvas-confetti`, `react-ts-liquid-gauge`.
- **Camada Nativa de Desktop:** Tauri 2 (Rust).
- **Persistência de Dados:**
  - Primária: `@tauri-apps/plugin-store` (`settings.json`).
  - Cache / Fallback: `localStorage` do Webview.
- **Plataformas Homologadas:** Linux (Arch Linux, Wayland, Ubuntu, X11) e Windows 11.

---

## 3. Requisitos Funcionais

### A. Núcleo Operacional (Ponto)
1. **Relógio Digital**: Exibição contínua do horário militar (`HH:MM`) com precisão de segundos.
2. **Cálculo Dinâmico da Água**:
   - $0\%$ a $100\%$ entre o início do intervalo e o horário alvo do turno.
   - Drenagem suave (~800ms) após o registro de cada batida.
3. **Modo Bater Ponto em Tela Cheia**:
   - Ao atingir o horário previsto, ativa o modo imersivo (`fixed inset-0 z-50`).
   - Apresenta o leitor biométrico vetorial com animação de desenho 1x por clique e retenção no frame completo.
   - Ao confirmar, dispara a URL externa configurada via `@tauri-apps/plugin-opener`.
4. **Marcadores de Progresso**: Dots inferiores indicando turnos cumpridos, turno ativo com spinner e turnos futuros.
5. **Barra de Testes Integrada**: Simulação instantânea de batidas 1, 2, 3, 4 ✨, enchimento progressivo e reset.

### B. Módulo de Configurações
1. **Cadastro e Edição de Escalas**: Até 4 turnos diários configuráveis por bloco de dias.
2. **Seleção de Dias da Semana**: Popover inteligente com filtros rápidos (*Todos os dias*, *Segunda a Sexta*, *Finais de semana*).
3. **Seletor de Horários 24h**: Modal integrado com conversão automática 12h/24h.
4. **Inicialização com o Sistema**: Opção para auto-start ao ligar o computador.
5. **Fechamento e Ocultação**: Suporte a fechar ou minimizar a janela para a bandeja.

### C. Calendário Mensal (Em desenvolvimento)
1. Visão consolidada dos dias trabalhados no mês.
2. Detecção e alerta visual para batidas faltantes ou inconsistências.

---

## 4. Decisões Técnicas

| Tema | Decisão | Racional |
| :--- | :--- | :--- |
| **Aceleração Gráfica** | `WEBKIT_DISABLE_DMABUF_RENDERER=1 GDK_BACKEND=x11` | Resolve falhas de renderização e congelamento do WebKitGTK no Wayland/Arch Linux. |
| **Janela Nativa** | 600×500, `transparent: true`, `decorations: false` | Proporciona visual moderno sem bordas de janela padrão do SO. |
| **Portais React** | `createPortal(..., document.body)` | Evita que menus de navegação (`Navbar`) sobreponham os modais de configuração. |
| **Hierarquia Z-Index** | Base: `z-0`, Navbar: `z-10`, Modal: `z-[100]`, Popover: `z-[120]` | Garante ordenação visual rigorosa sem conflitos de stacking context. |
| **Navegação Deslizante** | `translateX(activeIndex * 44px)` | Curva de mola CSS com aceleração por GPU para transição entre abas. |

---

## 5. Status do Cronograma

- [x] **Fase 1 — Setup e Shell Tauri 2** (Janela transparente, flags Wayland, Tailwind CSS 4).
- [x] **Fase 2 — Liquid Gauge & Relógio 24h** (Ondas dinâmicas, drenagem suave).
- [x] **Fase 3 — Modo Bater Ponto em Tela Cheia** (Take-over 100%, leitor biométrico animado).
- [x] **Fase 4 — Sistema de Celebrações** (Confetes de água e estrelas douradas ✨).
- [x] **Fase 5 — Configuração de Escalas & Modais** (Time pickers, portais, persistência dupla).
- [x] **Fase 6 — Barra de Teste e Validação** (Toolbar com simulações instantâneas).
- [ ] **Fase 7 — Calendário Mensal e Histórico** (Grid mensal e consolidação de espelho de ponto).
