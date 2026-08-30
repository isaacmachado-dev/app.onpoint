# System Tray — onPoint (Tauri v2)

## Visão Geral
O aplicativo expõe um ícone persistente na **system tray** (bandeja do sistema) para
mostrar/ocultar a janela e encerrar o app, mesmo com a janela fechada.

## Arquitetura
- **Entrada:** `src-tauri/src/lib.rs` → `run()` → `setup()` (bloco `.setup(|app| { ... })`).
- **Builder:** `TrayIconBuilder::with_id("main-tray")` (id estável para updates futuros).
- **Ícone:** `Image::from_bytes(include_bytes!("../icons/tray.png"))` — **embarcado no binário**
  via `include_bytes!`, eliminando dependência de caminho de arquivo em runtime (dev e release).
  - Fallback: `app.default_window_icon()` caso o PNG embarcado falhe ao decodificar.
  - Feature necessária em `Cargo.toml`: `tauri = { features = ["tray-icon", "image-png"] }`.
- **Menu:** `MenuItem` "Mostrar" / "Sair" (`Menu::with_items`).
- **Interações:**
  - Clique esquerdo no ícone → alterna visibilidade da janela (`on_tray_icon_event`).
  - Botão esquerdo também abre o menu (`show_menu_on_left_click(true)`).
  - "Mostrar" → `window.show() + unminimize() + set_focus()`.
  - "Sair" → `app.exit(0)`.

## Assets
- `src-tauri/icons/tray.png` — PNG 32x32 dedicado ao tray (gerado a partir de `32x32.png`).
- `src-tauri/icons/_source.svg` — **fonte canônica** `1024x1024` (`onpoint.svg` — elipse `#ACEBF0` + traços `#25586A`). Todos os PNGs/ICO/ICNS derivam dela via `npx tauri icon`.

## Branding canônico — por que o logo não pegava em todos os sistemas
Diagnóstico 2026-08-30:
1. **Duas marcas divergentes:** `public/onpoint.svg` (elipse clara canônica) vs `src-tauri/icons/_source.svg` antigo (gradiente indigo `#6366f1→#312e81`). O bundle nativo usava indigo enquanto a UI web usava claro — sensação de "não aplicou".
2. **Favicon fantasma:** `index.html:5` referenciava `/vite.svg` inexistente (template Vite não limpo) → 404 no webview; alguns WMs usam favicon como fallback de window icon. Fixado para `/onpoint.svg` + `<title>onPoint</title>`.
3. **Bundle Linux incompleto:** `tauri.conf.json:28` sem `bundle.category/publisher/shortDescription` → `.desktop` gerado com `Categories=` vazio e `Comment=A Tauri App` genérico (filtrado em GNOME Software/KDE Discover). Corrigido: `category=Utility`, `publisher=Isaac Machado (https://isaacmachado.com.br)`, `shortDescription/longDescription` → `Categories=Utility;` e `Comment` útil.
4. **Case mismatch:** CI `.github/workflows/build.yml:70` instalava `onpoint.png` lowercase com `Icon=onpoint`, enquanto `.deb` usa `onpoint.png` Pascal (`Icon=onPoint`). FS case-sensitive quebrava ícone no pacote pacman. Normalizado para `onPoint` Pascal em workflow + `scripts/install-arch.sh:67`.
5. **`tray.png` divergente:** `32x32.png` (963B canônico) vs `tray.png` (1069B indigo) — `TrayIconBuilder` em `src-tauri/src/lib.rs:39` embarcava logo errado no tray. Sincronizado: `tray.png` agora é cópia de `32x32.png`.
6. **Sem SVG escalável:** `_source.svg` indigo não era canônico, e `.deb` oficial não incluía `hicolor/scalable`. Instalador local `install-arch.sh` já instalava `scalable/onpoint.svg`; CI agora usa Pascal e descrição correta. Para hi-DPI, o SVG canônico garante vetor nítido.

## Garantia no Ubuntu (GNOME)
O Tauri v2 renderiza o tray via **libappindicator**. Para o ícone aparecer no Ubuntu:
1. Usar a sessão **"Ubuntu"** (já traz a extensão *Ubuntu AppIndicators* ativa).
2. Em GNOME puro, instalar a extensão **App Indicators** (sem ela o tray não aparece —
   limitação de protocolo, não do Tauri).
3. `libappindicator` deve estar presente no SO (`gir1.2-appindicator3-0.1` / pacote equivalente).

## Janela transparente (config + CSS)
- `tauri.conf.json → app.windows[].transparent: false` torna a janela opaca no nível do SO.
  Com `transparent: true` + `decorations: false`, a janela NÃO tem fundo do SO e depende
  100% do conteúdo web pintar o fundo; qualquer "vazado" fica transparente (efeito visual de ver o desktop).
- Em `src/App.css`, a regra `:root { background-color: transparent }` estava **fora de qualquer
  `@layer`** e vencia a regra sólida `html, body { background-color: #E4F6FB }` (que está em
  `@layer base`), pois regras *unlayered* têm prioridade sobre regras em camadas. Removida para
  garantir fundo sólido.

## Ícones multiplataforma (bundle)
- `npx tauri icon <fonte.png>` regenera **todo** o conjunto (`16x16`…`512x512`, `128x128@2x`,
  `icon.icns`, `icon.ico`, `icon.png`, além de iOS/Android/Square/Store) a partir de UMA fonte PNG `1024x1024`, garantindo tamanhos/formas consistentes. Este é o fix canônico quando o ícone some no launcher do Linux (.deb/AppImage/Arch). Fonte atual: `onpoint.svg` `1024x1024` → export PNG → `tauri icon`.
- `tauri.conf.json:28 → bundle.icon` lista explícita `16,24,32,48,64,128,128@2x,256,512(icon.png),icns,ico` — cobre hicolor completo. `publisher/category/shortDescription` garantem `.desktop` correto em Linux.
- `src-tauri/icons/_source.svg` `1024x1024` canônico (onPoint) é instalado como `hicolor/scalable/apps/onpoint.svg` por `scripts/install-arch.sh:67` e garante nítidez hi-DPI; `.deb` oficial do Tauri usa PNGs high-res como fallback.
- `tray.png` é asset separado (não regerado por `tauri icon`) — **sincronizado** com `32x32.png` canônico após diagnóstico; preservar em futuras regenerações (`cp 32x32.png tray.png`).
- **RGBA obrigatório (tray-icon v0.24.2):** `tauri::generate_context!()` (`src-tauri/src/lib.rs:82`) valida que **todo** ícone listado em `bundle.icon` é `RGBA` 8-bit. `npx tauri icon` otimiza `16x16/24x24/48x48` para **paleta (P/colormap)** via `pngquant` — isso panica em compile time `icon ... is not RGBA`. Fix: `python3 -c "from PIL import Image; Image.open(p).convert('RGBA').save(p)"` nos 3 arquivos; tamanhos ficam ~459/697/1257B e `file` passa a `8-bit/color RGBA`. Verificar com `file src-tauri/icons/*.png` e `cargo check` antes de buildar.

## Empacotamento Debian (.deb) - Diagnóstico GNOME Software "Potencialmente inseguro"

**Sintoma (Image 1 - Ubuntu 22.04/24.04):** Ao abrir o `.deb` no "Central de Aplicativos" (GNOME Software) aparecia:
- Banner laranja "Potencialmente inseguro - Esse pacote é fornecido por terceiros"
- `Editor desconhecido` / `Licença unknown` / `Publicado Desconhecido`
- Ícone cinza genérico (pizza) em vez do logo onPoint

### Conceitos-chave

1. **Banner laranja é INEVITÁVEL para .deb local.** GNOME Software exibe para *qualquer* `.deb` fora de `archive.ubuntu.com`. Só some via repositório apt com GPG / Snap Store / Flathub. Para GitHub Releases, permanece.
2. **DEB `Maintainer` vs `Publisher`.** Tauri mapeia `bundle.publisher` → `Maintainer:` apenas se `Cargo.toml authors` vazio. Correção: `publisher` com email `Isaac Machado <contato@isaacmachado.com.br>` em `tauri.conf.json:32`.
3. **AppStream `metainfo.xml` = identidade na loja.** GNOME lê `AppStream` em `/usr/share/metainfo/*.metainfo.xml` (copiado via `tauri.conf.json:43` `linux.deb.files`), não o `control`. Sem `metadata_license`/`project_license`/`launchable` correto, mostra `unknown` e ícone genérico.
4. **Licença Proprietária.** `bundle.license` + `Cargo.toml license` = `Proprietary` → GNOME exibe "Proprietário" sem liberar MIT (ajuste a pedido).

### Correções aplicadas (2026-08-30) - branch `develop`

| Arquivo | Antes | Depois |
|---|---|---|
| `tauri.conf.json:32` `publisher` | `Isaac Machado` | `Isaac Machado <contato@isaacmachado.com.br>` |
| `tauri.conf.json:36` `license` | *(ausente)* | `"Proprietary"` |
| `Cargo.toml:6` `license` | *(ausente)* | `Proprietary` |
| `bundle/com.moonlight.onPoint.metainfo.xml` | Sem `metadata_license`/`project_license`, `launchable` `onPoint.desktop` | Add `CC0-1.0`/`proprietary`, fix `launchable` → `com.moonlight.onPoint.desktop`, ícones `stock`+`cached` `onPoint`, `developer id` |

### Validar próximo .deb

```bash
npm run tauri:build
dpkg-deb -I src-tauri/target/release/bundle/deb/*.deb | grep Maintainer
appstreamcli validate /usr/share/metainfo/com.moonlight.onPoint.metainfo.xml
```

## Auto-Update (tauri-plugin-updater + GitHub Releases)

**Fluxo:** `Page.Configuration.tsx:242` → "Checar atualizações" → `UpdateModal.tsx` (portal `z-[100]`) → `useUpdater.ts` → `https://github.com/isaacmachado-dev/app.onpoint/releases/latest/download/latest.json`.

*   **Signing:** `npx tauri signer generate --ci -w ~/.tauri/onpoint.key` → `pubkey` em `tauri.conf.json:64` `plugins.updater.pubkey` (Ed25519, base64 minisign), `TAURI_SIGNING_PRIVATE_KEY` (conteúdo de `~/.tauri/onpoint.key`) como Secret no `build.yml:50`. `bundle.createUpdaterArtifacts:true` gera `latest.json` + `.sig` por plataforma.
*   **Plugins:** `lib.rs:57` `updater::Builder::new().build()` + `process::init()`; `capabilities/default.json:23` `updater:default` + `process:allow-restart`.
*   **Hook `src/hooks/useUpdater.ts:7`:** `status` (`idle|checking|up-to-date|available|downloading|ready|error`), `check()` → `downloadAndInstall(onProgress)` com eventos `Started/Progress/Finished` → `relaunch()`. Fallback `.deb` → `openUrl(RELEASES_URL)`.
*   **Modal `src/views/configuration/UpdateModal.tsx:14`:** Auto-check no `useEffect`, estados com `lucide-react` + barra `progress%`, changelog `body`, CTA "Baixar e instalar" / "Reiniciar agora".
*   **CI:** `tauri-action@v0` lê `TAURI_SIGNING_PRIVATE_KEY` e publica `latest.json` no Release `vX.Y.Z`.

## Build do AppImage no Arch (linuxdeploy incompatível)

O `npm run tauri build` falha **apenas** no passo AppImage com `failed to run linuxdeploy`.
O `.deb` e o `.rpm` são gerados normalmente.

### Causa-raiz
O Tauri faz download de um `linuxdeploy` **antigo** e o usa para empacotar o AppImage.
Esse `linuxdeploy` tem dois problemas em sistemas modernos (Arch/Fedora novos):

1. **`strip` embutido obsoleto** — o `strip` dentro do `linuxdeploy` não entende a
   seção `.relr.dyn` (RELATIVE_RELAX) gerada pelo `ld`/`binutils` atuais. Ele aborta em
   *todas* as bibliotecas (`libxml2`, `libxkbcommon`, …):
   `unknown type [0x13] section .relr.dyn`.
2. **plugin `gtk` com paths do Debian** — o script do plugin copia
   `gdk_pixbuf_binarydir` que, no Arch, aponta para `/usr/lib/gdk-pixbuf-2.0/2.10.0`
   (inexistente; os loaders ficam em `.../2.10.0/loaders`). O `copy_tree` falha.

Dependência de build ausente que dispara o erro inicial: **`squashfs-tools`**
(`mksquashfs`), obrigatório para criar o squashfs do AppImage. Instalar com
`pacman -S squashfs-tools`.

### Por que não adianta patchar o cache do Tauri
O Tauri verifica a integridade do `linuxdeploy` baixado e **re-baixa o original**
se o arquivo em `~/.cache/tauri/linuxdeploy-x86_64.AppImage` foi alterado. Por isso
qualquer correção direta nesse arquivo (script-wrapper ou AppImage repactado) é
descartada na próxima build. A solução é o **build manual** abaixo.

### Workaround: `scripts/build-appimage.sh`
O script:
1. Remove o `AppDir` antigo (evita symlinks stale do plugin `gtk`).
2. Roda `npm run tauri build` — recria um `AppDir` fresco; o passo AppImage do Tauri
   falha ao chamar o `linuxdeploy` quebrado, mas o `AppDir` já existe (erro ignorado).
3. Empacota com um `linuxdeploy` **corrigido** mantido em
   `~/.cache/tauri/linuxdeploy_fixed/`.

Para (re)criar o `linuxdeploy_fixed` uma vez:
```bash
cd ~/.cache/tauri
./linuxdeploy-x86_64.AppImage --appimage-extract   # gera squashfs-root
rm squashfs-root/usr/bin/strip
ln -s /usr/bin/strip squashfs-root/usr/bin/strip    # usa strip do sistema (binutils 2.47)
# patch no plugin gtk: tornar a copia de gdk-pixbuf tolerante (veja diff em
# linuxdeploy_fixed/squashfs-root/usr/bin/linuxdeploy-plugin-gtk.sh)
```
Uso: `bash scripts/build-appimage.sh` (rode da raiz do projeto). O artefato final
fica em `src-tauri/target/release/bundle/appimage/onPoint-x86_64.AppImage`.

> Observação: o `AppImage` assim gerado usa as libs do sistema no runtime (GTK/pixbuf),
> o que é suficiente para testar no próprio Arch. Para distribuição multi-distro,
> recomenda-se atualizar o `linuxdeploy` usado pelo Tauri ou empacotar via AUR.
