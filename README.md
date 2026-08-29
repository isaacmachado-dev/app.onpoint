# onPoint 

> Bata o ponto no horário certo. Sem esquecer.

Widget flutuante de desktop que lembra você de bater o ponto, com um relógio
animado estilo "água subindo" (liquid gauge) mostrando o tempo até a próxima
batida.


---

## Stack

| Camada        | Tecnologia                          |
| ------------- | ----------------------------------- |
| Front-end     | Vite + React 19 + TypeScript        |
| Estilo        | Tailwind CSS 4 (Material Express 3) |
| Animações     | SVG/CSS + framer-motion (a definir) |
| Shell nativo  | Tauri 2 (Rust)                      |
| Plataformas   | Arch Linux, Ubuntu, Windows         |

## Funcionalidades

### Core

- [ ] Lembrete para bater o ponto no horário configurado
- [ ] Botão principal "Bater ponto" → abre o site de batida
- [ ] Relógio liquid gauge (água subindo até a próxima batida)

### Calendário de batidas

- [ ] Visão alternativa com calendário do mês
- [ ] Dias com marcações incorretas destacados (checagem feita no site da batida)

### Futuro

- [ ] Integração WhatsApp: "HORA DE BATER O PONTO" no horário configurado
- [ ] Integração com Google Agenda/Tasks

## Desenvolvimento

```bash
# instalar dependências
npm install

# Linux (Arch/Wayland — contorna bugs de buffer do WebKitGTK)
npm run tauri:arch

# Linux genérico / outros
npm run tauri dev

# build de produção
npm run tauri build
```

> **Wayland:** o script `tauri:arch` exporta `WEBKIT_DISABLE_DMABUF_RENDERER=1`
> e `GDK_BACKEND=x11` para garantir renderização fluida sem erros gráficos.
> Em Ubuntu/X11 puro, `tauri dev` funciona direto.

## Janela

O widget é uma janela fixa de **400×300**, sem decorações nativas e
transparente (bordas arredondadas via CSS), configurada em
`src-tauri/tauri.conf.json`.

## Estrutura

```
src/
  App.tsx          # Widget principal (views: relógio ↔ calendário)
  App.css          # Tailwind + estilos globais
src-tauri/
  src/lib.rs       # Comandos Tauri
  tauri.conf.json  # Janela, bundle e segurança
```

## Roadmap (1 semana)

| Fase | Escopo                                        | Status |
| ---- | --------------------------------------------- | ------ |
- [X] | 1    | Setup Tauri + janela transparente + mock      
- [X] | 2    | UI azul Material, liquid gauge, configurações        
- [ ] | 3    | Lembretes, abertura do site, integração WA        

---

Feito com ☕ por @isaacmachado-dev - Licença a definir
