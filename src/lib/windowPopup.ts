import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Traz a janela para a frente da tela no estilo pop-up modal:
 * - Desminimiza se estiver minimizada
 * - Mostra se estiver oculta
 * - Ativa always on top para sobrepor qualquer janela aberta
 * - Foca a janela
 */
export async function triggerPopupWindow(): Promise<void> {
  try {
    await invoke("popup_window");
    return;
  } catch (err) {
    console.warn("invoke(popup_window) falhou, aplicando fallback via window API:", err);
  }

  try {
    const appWindow = getCurrentWindow();
    await appWindow.unminimize();
    await appWindow.show();
    await appWindow.setAlwaysOnTop(true);
    await appWindow.setFocus();
  } catch (error) {
    console.error("Falha ao subir janela em pop-up:", error);
  }
}

/**
 * Desativa o modo always on top para permitir que a janela se comporte normalmente.
 */
export async function resetPopupWindowLevel(): Promise<void> {
  try {
    await invoke("reset_popup_window");
    return;
  } catch (err) {
    console.warn("invoke(reset_popup_window) falhou:", err);
  }

  try {
    const appWindow = getCurrentWindow();
    await appWindow.setAlwaysOnTop(false);
  } catch (error) {
    console.error("Falha ao redefinir nível da janela:", error);
  }
}

/**
 * Desativa always on top e oculta a janela no tray do sistema.
 */
export async function hidePopupWindow(): Promise<void> {
  try {
    await invoke("hide_popup_window");
    return;
  } catch (err) {
    console.warn("invoke(hide_popup_window) falhou:", err);
  }

  try {
    const appWindow = getCurrentWindow();
    await appWindow.setAlwaysOnTop(false);
    await appWindow.hide();
  } catch (error) {
    console.error("Falha ao ocultar janela:", error);
  }
}

