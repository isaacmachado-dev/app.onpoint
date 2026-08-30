#!/usr/bin/env bash
set -euo pipefail
# Patch Wayland nativo: injeta WEBKIT_DISABLE_DMABUF_RENDERER=1 nos bundles
# Corrige o crash: Gdk Error 71 Protocol error dispatching to Wayland display
# mantendo GDK_BACKEND=wayland (sem forçar XWayland)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUNDLE="$ROOT/src-tauri/target/release/bundle"

if [ ! -d "$BUNDLE" ]; then
  echo "Nenhum bundle encontrado em $BUNDLE - rode 'npm run tauri build' antes"
  exit 0
fi

echo "==> Patch Wayland: WEBKIT_DISABLE_DMABUF_RENDERER=1 (nativo)"

# 1. Patch .desktop (deb/rpm/appimage staged)
find "$BUNDLE" -name "*.desktop" -print | while read -r f; do
  if grep -q "^Exec=onPoint" "$f"; then
    echo "  patch desktop: $f"
    sed -i 's/^Exec=onPoint/Exec=env WEBKIT_DISABLE_DMABUF_RENDERER=1 onPoint/' "$f"
  elif grep -q "^Exec=env WEBKIT_DISABLE_DMABUF_RENDERER=1 onPoint" "$f"; then
    echo "  já patchado: $f"
  else
    echo "  skip (Exec custom): $f"
  fi
done

# 2. AppRun é binário ELF (linuxdeploy) - não patchável via shell.
#    O fix nativo Wayland para AppImage/binário direto é feito via Rust
#    em src-tauri/src/lib.rs:17 (set_var antes do WebKit init).
#    Desktop patch acima já cobre lançamento via .desktop.

# 3. Nota: .deb/.rpm já gerados precisam de rebuild para embutir o .desktop patchado
#    no arquivo final. O patch acima corrige o staging; rode `npm run tauri:build` novamente
#    ou aplique manual no sistema alvo:
#    sudo sed -i 's/^Exec=onPoint/Exec=env WEBKIT_DISABLE_DMABUF_RENDERER=1 onPoint/' /usr/share/applications/onPoint.desktop

echo "==> Done. Instale com:"
echo "  sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb  # depois: sed no /usr/share/applications/onPoint.desktop se necessário"
echo "  WEBKIT_DISABLE_DMABUF_RENDERER=1 ./src-tauri/target/release/bundle/appimage/onPoint*.AppImage"
