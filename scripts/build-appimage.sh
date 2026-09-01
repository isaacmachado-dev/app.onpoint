# Build manual do AppImage (contorna o linuxdeploy antigo do Tauri, incompativel com Arch)
# Uso: rode a partir da raiz do projeto com:  bash scripts/build-appimage.sh
#
# O que faz:
#   1. Remove o AppDir antigo (evita symlinks stale do plugin gtk).
#   2. Roda `npm run tauri build` (recompila e cria um AppDir FRESCO; o passo
#      appimage do Tauri vai falhar ao chamar o linuxdeploy quebrado, mas o
#      AppDir ja foi criado -> ignoramos esse erro).
#   3. Empacota o AppDir com o linuxdeploy corrigido (strip do sistema + plugin
#      gtk patchado para paths do Arch).

CACHE="$HOME/.cache/tauri"
FIXED="$CACHE/linuxdeploy_fixed/squashfs-root/AppRun"
APPRUN="$CACHE/AppRun-x86_64"
APPDIR="$(pwd)/src-tauri/target/release/bundle/appimage/onPoint.AppDir"

if [ ! -x "$FIXED" ]; then
  echo "ERRO: linuxdeploy corrigido nao encontrado em $FIXED"
  echo "Veja README.md (secao de build AppImage) para recriar o linuxdeploy_fixed."
  exit 1
fi

echo "==> Limpando AppDir antigo"
rm -rf "$APPDIR"

echo "==> Rodando tauri build (o passo appimage do Tauri vai falhar; ignorado)"
npm run tauri build || true

if [ ! -d "$APPDIR" ]; then
  echo "ERRO: AppDir nao foi criado pelo tauri build em $APPDIR"
  exit 1
fi

echo "==> Empacotando AppImage com linuxdeploy corrigido"
# O plugin appimage escreve o .AppImage no diretorio corrente, entao entra
# na pasta de bundle para que o artefato caia no lugar esperado.
( cd "$(dirname "$APPDIR")" && "$FIXED" --appdir "$APPDIR" --plugin gtk --plugin gstreamer --output appimage --custom-apprun "$APPRUN" )

echo "==> Patch Wayland nativo no AppDir/AppImage"
bash "$(dirname "$0")/fix-wayland-bundle.sh"

echo ""
echo "Pronto: src-tauri/target/release/bundle/appimage/onPoint-x86_64.AppImage"
