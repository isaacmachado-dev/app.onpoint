#!/usr/bin/env bash
set -euo pipefail
# Instala o binário já compilado no Arch (wayland nativo)
# Uso: bash scripts/install-arch.sh  (a partir da raiz do projeto)
#      bash scripts/install-arch.sh --uninstall para remover

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/src-tauri/target/release/onPoint"
DESKTOP_SRC="$ROOT/src-tauri/target/release/bundle/deb/onPoint_0.2.4_amd64/data/usr/share/applications/onPoint.desktop"
# fallback se deb não existir (build recente sem deb)
[ -f "$DESKTOP_SRC" ] || DESKTOP_SRC="$ROOT/src-tauri/target/release/bundle/appimage/onPoint.AppDir/usr/share/applications/onPoint.desktop"

if [[ "${1:-}" == "--uninstall" ]]; then
  echo "==> Removendo onPoint"
  sudo rm -f /usr/bin/onPoint
  sudo rm -f /usr/share/applications/onPoint.desktop
  for s in 16x16 24x24 32x32 48x48 64x64 128x128 256x256 512x512 256x256@2; do
    sudo rm -f "/usr/share/icons/hicolor/$s/apps/onPoint.png"
  done
  sudo rm -f /usr/share/icons/hicolor/scalable/apps/onPoint.svg
  sudo rm -f /usr/share/pixmaps/onPoint.png
  sudo update-desktop-database /usr/share/applications 2>/dev/null || true
  sudo gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true
  echo "Removido."
  exit 0
fi

if [ ! -f "$BIN" ]; then
  echo "Binário não encontrado: $BIN"
  echo "Rode antes: npm run tauri:build:wayland"
  exit 1
fi

echo "==> Instalando onPoint em /usr/bin/onPoint (17M, Wayland nativo já patchado)"
sudo install -Dm755 "$BIN" /usr/bin/onPoint

echo "==> Instalando .desktop (Exec=env WEBKIT_DISABLE_DMABUF_RENDERER=1 onPoint)"
if [ -f "$DESKTOP_SRC" ]; then
  sudo install -Dm644 "$DESKTOP_SRC" /usr/share/applications/onPoint.desktop
else
  # fallback: cria desktop mínimo
  sudo tee /usr/share/applications/onPoint.desktop >/dev/null <<'EOF'
[Desktop Entry]
Name=onPoint
Comment=onPoint — gerenciamento de ponto e frequência
Exec=env WEBKIT_DISABLE_DMABUF_RENDERER=1 onPoint
Icon=onPoint
Type=Application
Categories=Utility;
StartupWMClass=onPoint
Terminal=false
EOF
fi

echo "==> Instalando ícones (hicolor 100% + pixmaps fallback)"
for icon in "$ROOT/src-tauri/icons/16x16.png" "$ROOT/src-tauri/icons/24x24.png" "$ROOT/src-tauri/icons/32x32.png" "$ROOT/src-tauri/icons/48x48.png" "$ROOT/src-tauri/icons/64x64.png" "$ROOT/src-tauri/icons/128x128.png" "$ROOT/src-tauri/icons/256x256.png"; do
  size=$(basename "$icon" .png)
  sudo install -Dm644 "$icon" "/usr/share/icons/hicolor/$size/apps/onPoint.png"
done
# 512 usa icon.png (512x512) + 256@2x
sudo install -Dm644 "$ROOT/src-tauri/icons/icon.png" /usr/share/icons/hicolor/512x512/apps/onPoint.png
sudo install -Dm644 "$ROOT/src-tauri/icons/128x128@2x.png" /usr/share/icons/hicolor/256x256@2/apps/onPoint.png
# fallback absoluto para DEs que não seguem hicolor
sudo install -Dm644 "$ROOT/src-tauri/icons/128x128.png" /usr/share/pixmaps/onPoint.png
# SVG escalável se existir
if [ -f "$ROOT/src-tauri/icons/_source.svg" ]; then
  sudo install -Dm644 "$ROOT/src-tauri/icons/_source.svg" /usr/share/icons/hicolor/scalable/apps/onPoint.svg
fi

sudo update-desktop-database /usr/share/applications 2>/dev/null || true
sudo gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true
# Hyprland/KDE/GNOME precisam de cache refresh
if command -v kbuildsycoca6 >/dev/null 2>&1; then kbuildsycoca6 2>/dev/null || true; fi

echo ""
echo "Pronto. Teste:"
echo "  onPoint                    # via launcher / KRunner / Hyprland"
echo "  /usr/bin/onPoint           # direto (já com fix Wayland via Rust)"
echo "  grep Exec /usr/share/applications/onPoint.desktop"
echo ""
echo "Desinstalar: bash scripts/install-arch.sh --uninstall"
