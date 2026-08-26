# onPoint — Especificação

> Prazo: 1 semana · Objetivo: bater o ponto no horário correto.
> Primeiro projeto com Tauri / primeiro app nativo de desktop.

## 1. Visão Geral

- **Estética:** Google / Material Express 3, azul, animações fluidas
- **Assinatura visual:** relógio "clockando" com água subindo representando o
  tempo até a próxima batida (liquid gauge)

## 2. Arquitetura

- **Front-end:** Vite, React, TypeScript, Tailwind CSS 4
- **UI:** Material Express 3-like (libs a definir)
- **Back-end:** nenhum por enquanto (Tauri shell apenas)
- **Infra:** Arch Linux, Ubuntu e Windows

## 3. Funcionalidades

### A. Core

- Lembrar o usuário de bater o ponto
- Botão principal "OK — Realizar batida" → abre o site de batida

### B. Calendário de batidas

- Botão de navegação para visão de calendário sobre batidas
- Dias incorretos sinalizados (checagem central no próprio site da batida)
- Transição que troca a visão central do widget

### C. Easter egg (futuro)

- Integração WhatsApp enviando "HORA DE BATER O PONTO" no horário configurado

## 4. Decisões técnicas

| Tema            | Decisão                                                              |
| --------------- | -------------------------------------------------------------------- |
| Wayland         | `WEBKIT_DISABLE_DMABUF_RENDERER=1 GDK_BACKEND=x11` no script `tauri:arch` |
| Janela          | 400×300 fixa, `alwaysOnTop`, `decorations: false`, `transparent: true` |
| Bordas          | `rounded-4xl` no `<main>` com `w-screen h-screen`                     |
| Liquid gauge    | SVG animado via CSS ou framer-motion (`react-wave-progress` alternativa) |
| Fundo           | Azul Material Express 3                                               |

## 5. Cronograma

### Fase 1 — Setup e Mock ✅
- [x] Projeto Vite + React + TS inicializado, script Wayland ajustado
- [x] `tauri.conf.json`: janela fixa, transparente, sem decorações
- [ ] `alwaysOnTop: true`

### Fase 2 — Interface e Estética 🚧
- [ ] Widget flutuante Tailwind (fundo azul, rounded-4xl no main)
- [ ] Relógio liquid gauge (água subindo), baixo consumo de hardware
- [ ] Estado secundário: calendário de batidas com transição de visão

### Fase 3 — Integração e Agentes ⬜
- [ ] Lembrete no horário configurado
- [ ] Abertura do site de batida
- [ ] (Futuro) Integração WhatsApp
