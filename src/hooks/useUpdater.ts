import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { openUrl } from "@tauri-apps/plugin-opener";
import { getVersion } from "@tauri-apps/api/app";
import { useCallback, useState } from "react";

export type UpdaterStatus =
  | "idle"
  | "checking"
  | "up-to-date"
  | "available"
  | "downloading"
  | "ready"
  | "error";

export interface UpdateInfo {
  version: string;
  currentVersion: string;
  body?: string;
  date?: string;
  raw: unknown;
}

const RELEASES_URL = "https://github.com/isaacmachado-dev/app.onpoint/releases/latest";

export function useUpdater() {
  const [status, setStatus] = useState<UpdaterStatus>("idle");
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentVersion = useCallback(async () => {
    try {
      const v = await getVersion();
      setCurrentVersion(v);
      return v;
    } catch {
      return null;
    }
  }, []);

  const checkForUpdate = useCallback(async () => {
    setStatus("checking");
    setError(null);
    setProgress(0);
    await loadCurrentVersion();
    try {
      const result = await check();
      if (!result) {
        setStatus("up-to-date");
        setUpdate(null);
        return null;
      }
      const info: UpdateInfo = {
        version: result.version,
        currentVersion: result.currentVersion,
        body: result.body,
        date: result.date,
        raw: result,
      };
      setUpdate(info);
      setStatus("available");
      return info;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus("error");
      return null;
    }
  }, [loadCurrentVersion]);

  const downloadAndInstall = useCallback(async () => {
    if (!update?.raw) {
      setError("Nenhuma atualização disponível");
      setStatus("error");
      return;
    }
    // Tauri Update object has downloadAndInstall
    const updater = update.raw as {
      downloadAndInstall: (
        onEvent: (event: { event: string; data: { chunkLength: number; contentLength?: number } }) => void
      ) => Promise<void>;
    };

    // Fallback: if method missing, open releases
    if (typeof updater.downloadAndInstall !== "function") {
      await openUrl(RELEASES_URL);
      return;
    }

    setStatus("downloading");
    setProgress(0);
    setError(null);
    try {
      let contentLength = 0;
      let downloaded = 0;
      await updater.downloadAndInstall((event) => {
        if (event.event === "Started") {
          contentLength = (event.data.contentLength ?? 0) as number;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (contentLength > 0) {
            setProgress(Math.round((downloaded / contentLength) * 100));
          } else {
            // indeterminate fallback
            setProgress((p) => Math.min(95, p + 2));
          }
        } else if (event.event === "Finished") {
          setProgress(100);
        }
      });
      setStatus("ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus("error");
    }
  }, [update]);

  const restart = useCallback(async () => {
    try {
      await relaunch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus("error");
    }
  }, []);

  const openReleases = useCallback(async () => {
    try {
      await openUrl(RELEASES_URL);
    } catch (e) {
      console.error("Falha ao abrir releases:", e);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
  }, []);

  return {
    status,
    currentVersion,
    update,
    progress,
    error,
    checkForUpdate,
    downloadAndInstall,
    restart,
    openReleases,
    reset,
    loadCurrentVersion,
  };
}
