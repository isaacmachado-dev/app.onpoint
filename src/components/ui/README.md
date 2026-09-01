# Componentes de Interface (`src/components/ui`)

Este diretório contém os componentes visuais e micro-interações reutilizáveis do aplicativo **onPoint**, inspirado no Google / Material Expressss 3.

---

## Estrutura de Arquivos

```
src/components/ui/
├── navbar.tsx      # Barra de navegação inferior com pílula ativa deslizante (spring animation)
├── fingerprint.tsx # Ícone biométrico com animação contínua de escaneamento e suporte a group-press
├── cup-soda.tsx    # Ícone animado em loop contínuo (onda, canudo e borbulhas de gás)
├── button.tsx      # Botão genérico com variantes CVA
├── popover.tsx     # Popover baseado em @base-ui/react com z-index elevado (z-[120])
├── badge.tsx       # Badges estilizadas para status e turnos
└── README.md        # Documentação técnica do módulo UI
```

---

## Componentes

### 1. `FingerprintIcon` (`fingerprint.tsx`)
Ícone biométrico SVG com animação de traçado disparada 1x por pressionamento e sincronização de clique:
- **Disparo 1x ao Pressionar**: Ao pressionar o botão do mouse / toque (`onMouseDown` / `onTouchStart`), os traços realizam um único ciclo de escaneamento biométrico com brilho e traçado laser (`pathLength: 0 -> 1` em 0.75s).
- **Interação de Pressionamento Unificada (`group-press`)**:
  - Quando integrado na tela de bater ponto (`Page.Point.tsx`), o círculo biométrico e o botão *"BATER PONTO AGORA"* reagem simultaneamente ao clique/toque (`active:scale-95`, `group-active:scale-90`, `group-active:bg-brand-secondary/20`).

---

### 2. `CupSodaIcon` (`cup-soda.tsx`)
Ícone do estado de descanso / folga com animação 100% contínua:
- **Canudo**: Flutuação senoidal suave em loop infinito.
- **Líquido**: Oscilação contínua da onda central.
- **Borbulhas**: 5 partículas que sobem e estouram em tempos dessincronizados.

---

### 3. `Navbar` (`navbar.tsx`)
Barra de navegação principal que controla a troca de views (`ponto`, `calendario`, `configuracoes`):
- Pílula ativa deslizante com cálculo de translação contínua ($\text{translateX} = \text{activeIndex} \times 44\text{px}$) e curva elástica `cubic-bezier(0.34, 1.56, 0.64, 1)`.

---

### 4. `Popover` & `PopoverContent` (`popover.tsx`)
Wrapper de popover construído sobre `@base-ui/react/popover`:
- `z-index: 120` garantindo que caixas de seleção (ex: dias da semana no modal de horários) abram sobrepostas aos modais sem corte ou sobreposição incorreta.

