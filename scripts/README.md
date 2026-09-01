# Scripts — onPoint (build, Wayland, instalação Arch)

Pasta de automação de **build** e **deploy** local. Todos os scripts são `bash + set -euo pipefail`,
idempotentes e projetados para rodar da **raiz do projeto** (`bash scripts/<nome>.sh`).

## Arquivos

| Script | Propósito |
| :--- | :--- |
| `fix-wayland-bundle.sh` | Patch pós-build: injeta `env WEBKIT_DISABLE_DMABUF_RENDERER=1` no `Exec=` de todo `.desktop` gerado (`deb/rpm/AppDir`). Fix Wayland nativo sem forçar `GDK_BACKEND=x11`. |
| `build-appimage.sh` | Workaround AppImage no Arch: contorna `linuxdeploy` antigo do Tauri (strip sem `.relr.dyn` + plugin gtk com paths Debian). Recompila `AppDir` fresco e re-empacota com `~/.cache/tauri/linuxdeploy_fixed`. |
| `install-arch.sh` | Instala binário `onPoint` já compilado em `/usr/bin` + hicolor completo (16→512, `@2x`, `scalable/svg`, `pixmaps` fallback) + `.desktop` patchado. Suporta `--uninstall`. |

## Fluxos canônicos

```bash
# Build padrão (deb+rpm + patch Wayland)
npm run tauri:build              # -> deb+rpm + fix-wayland-bundle.sh
npm run tauri:build:wayland      # alias idem (sem XWayland)

# AppImage no Arch (linuxdeploy fix)
bash scripts/build-appimage.sh   # requer linuxdeploy_fixed (ver src-tauri/README.md)

# Instalar localmente (Hyprland/GNOME/KDE)
bash scripts/install-arch.sh
bash scripts/install-arch.sh --uninstall
```

## Detalhes técnicos

- `fix-wayland-bundle.sh:18` usa `find "$BUNDLE" -name "*.desktop"` — cobre `deb/data/usr/share/applications`, `rpm` staging e `AppDir/usr/share/applications` em uma passada.
- `build-appimage.sh:12-14` depende de `~/.cache/tauri/linuxdeploy_fixed` com `strip` do sistema (`/usr/bin/strip` binutils 2.47) e `linuxdeploy-plugin-gtk.sh` patchado para `gdk-pixbuf-2.0/2.10.0/loaders` do Arch. Sem isso, `mksquashfs` (pacote `squashfs-tools`) falha.
- `install-arch.sh:65` instala `_source.svg` como `hicolor/scalable/apps/onpoint.svg` — garante nítidez hi-DPI; `.deb` oficial usa PNGs high-res como fallback (não inclui scalable por padrão).
- Todos os scripts resolvem `ROOT` via `$(cd "$(dirname "$0")/.." && pwd)` — funcionam tanto em `npm run` quanto em chamada direta.

## Dependências de SO

- `squashfs-tools` (`mksquashfs`) para AppImage
- `libappindicator` / `gir1.2-appindicator3-0.1` para tray no Ubuntu/GNOME
- `webkit2gtk-4.1`, `gtk3` para runtime Tauri
