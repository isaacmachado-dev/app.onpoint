# Onpoint Design System

## Overview

Design system do projeto Onpoint, auditado contra o arquivo Figma real
(`7chQ1nVn4WMA3ySoq18bdn`, página "Main", 12 root nodes) em 2026-08-25.
Valores extraídos do arquivo estão marcados como **[extraído]**; valores
inferidos/propostos (não presentes no Figma) estão marcados como **[proposto]**.
O draft original gerado pelo plugin misturava os dois sem distinção — este
documento corrige isso.

---

## Colors

### Extraídas do Figma

| Token        | Hex       | Uso observado no arquivo |
|--------------|-----------|--------------------------|
| `primary`    | `#25586A` | Cor dominante: 14 fills + 21 strokes. Usada em contornos e destaques. |
| `accent`     | `#ACEBF0` | Segunda mais usada (11x). Superfícies de apoio. |
| `surface`    | `#E4F6FB` | 3x. Painéis/cartões claros. |
| `background` | `#FFFFFF` | Fundo de página e canvas. |
| `text`       | `#000000` | Texto principal. |
| `primary-tint` | `#335C67` | Variação próxima do primary (1 fill). Revisar papel antes de reusar. |
| `accent-bright` | `#90E0EF` | Tom mais vivo do accent (1x). |
| `neutral-bg` | `#F6F9FA` | Cinza-azulado muito claro (1x). |
| Amostras decorativas (ícones/refs lucide): `#FFE5D9`, `#FDE4CF`, `#3D405B`, `#CFBAF0`, `#880D1E` | — | Provavelmente amostras de cor soltas, não parte do sistema. Não usar como tokens sem definir papel. |

### Propostas do plugin (NÃO existem no Figma — definir manualmente antes de usar)

| Token          | Hex proposto | Nota |
|----------------|--------------|------|
| `border`       | `#D9D9D9`    | O plugin usou esta cor para todas as bordas, mas no arquivo as bordas reais são `#25586A`. Decidir: bordas cinza neutras ou seguir o traço azul do Figma. |
| `muted-text`   | `#999999`    | Inventada para texto secundário. |
| `error`        | `#EF4444`    | Inventada para estados de erro. |

**Recomendação:** bordas seguirem `primary` (`#25586A`) com opacidade reduzida,
fiel ao desenho; ou padronizar `#D9D9D9` se preferir bordas neutras — mas essa
é uma decisão de design, não algo já definido no Figma.

---

## Typography

- Fonte: **Inter**, peso **700** nos textos existentes. [extraído]
- Nenhum text style publicado no arquivo ("No local text styles found"). [extraído]
- Headline/body fonts e escala tipográfica: **[manual]** — definir.

Textos presentes no arquivo: "oNpoint" (logo, 3x), "14:00", "Inicializar ao ligar o sistema", "Fechar completamente".

---

## Spacing

Base unit: **8px** [proposto — não há auto layouts nem espaçamentos sistematizados no arquivo]

- xs: 4px — gaps inline apertados
- sm: 8px — espaçamento compacto
- md: 16px — padding padrão
- lg: 24px — padding de cards, gutters de seção
- xl: 32px — espaçamento entre seções maiores

---

## Border Radius

Raios realmente encontrados no arquivo [extraído]:
0, 3.5, 15, 16, 27, 34.5, 47, 62, 200 — ou seja, **não existe um sistema de
raios consistente**; os frames parecem ter raios ajustados individualmente
(200 ≈ pills/círculos, 16 ≈ painéis).

Proposta de normalização [proposto]:

- sm: 4px — tags, chips
- md: 8px — botões, inputs, cards
- lg: 16px — painéis grandes (confere com o raio 16 encontrado)
- full: 9999px — pills, avatares (confere com o raio 200 dos círculos)

---

## Elevation [proposto]

Sombras suaves e difusas por padrão:

- sm: botões, chips, overlays pequenos
- DEFAULT: cards, dropdowns, superfícies flutuantes padrão
- md: cards elevados, side panels
- lg: modais e overlays de alta prioridade

---

## Components

> Todos os estados (hover/focus/disabled/error) abaixo são **[proposto]** —
> o arquivo Figma não define variantes de componente. Cores base são as extraídas.

### Buttons
- **Primary**: fill `#25586A`, texto `#FFFFFF`, radius md.
- **Secondary**: transparente, texto `#000000`, 1px border (ver nota sobre `border`), radius md.
- **Ghost**: transparente, texto muted, radius md.
- Focus ring: 3px do token primário com alpha ~12%.
- Disabled: 40% opacity.

### Cards
- **Default**: fill `#E4F6FB`, border sutil, radius md/lg.
- **Large Panel**: fill `#E4F6FB`, radius lg (16px).

### Inputs
- **Default**: fill `#E4F6FB`, border sutil, texto `#000000`.
- **Focus**: border `#25586A` + focus ring.
- **Error**: border `#EF4444` + ring (cor proposta).
- **Disabled**: 40% opacity, texto muted.

### Layout Containers
- `#E4F6FB` para regiões contidas; `#FFFFFF` para fundo de página. [extraído]
- 16px apenas para painéis grandes. [proposto]

---

## Layout Principles [proposto]

- Whitespace generoso entre seções.
- Agrupamento card-based para conteúdo relacionado.
- Ritmo de spacing na base 8px.
- Manter fundo de página e surface visualmente distintos.
- Reusar padrões de auto layout (a criar — o arquivo atual não tem nenhum).

## Do's and Don'ts

1. **Do** usar `#25586A` para ênfase interativa principal — é a cor mais recorrente do arquivo.
2. **Do** manter fundo de página `#FFFFFF`.
3. **Do** preservar contraste forte com `#000000` no conteúdo de leitura.
4. **Do** tratar as cores decorativas (`#FFE5D9`, `#FDE4CF`, etc.) como amostras, não tokens.
5. **Don't** introduzir accent colors novas sem promover a token semântico.
6. **Don't** assumir que bordas/radius/estados vêm do Figma — foram normalizados aqui; revisar antes de considerar fonte da verdade.

---

## Provenance

- Auditado contra a API do Figma em 2026-08-25 (file `7chQ1nVn4WMA3ySoq18bdn`, lastModified 2026-08-26T01:14Z).
- Página escaneada: Main (12 root nodes). Existe também página "Draft" com 1 frame, fora do escopo.
- Draft original gerado por plugin Figma; este documento corrige omissões (#335C67, cores decorativas) e distingue extraído vs. proposto.
