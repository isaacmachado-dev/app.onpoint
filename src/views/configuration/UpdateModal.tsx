import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Download, RefreshCw, Rocket, ExternalLink } from "lucide-react";
import { useUpdater } from "@/hooks/useUpdater";

interface UpdateModalProps {
  onClose: () => void;
}

export default function UpdateModal({ onClose }: UpdateModalProps) {
  const { status, currentVersion, update, progress, error, checkForUpdate, downloadAndInstall, restart, openReleases } = useUpdater();

  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  const handleBackdrop = () => {
    if (status === "downloading") return;
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white p-5 rounded-2xl shadow-xl max-w-xs w-full text-left flex flex-col gap-4 animate-fade animate-duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-brand-main">Atualizações</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={status === "downloading"}
            className="text-gray-400 hover:text-gray-600 text-xs disabled:opacity-30 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* CHECKING */}
          {status === "checking" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <RefreshCw className="w-8 h-8 text-brand-main animate-spin" />
              <p className="text-sm font-medium text-gray-700">Verificando atualizações…</p>
              <p className="text-xs text-gray-400">v{currentVersion ?? "…"} • buscando no GitHub Releases</p>
            </div>
          )}

          {/* UP TO DATE */}
          {status === "up-to-date" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm font-bold text-gray-800">Você está na última versão!</p>
              <p className="text-xs text-gray-500">v{currentVersion} • verificado agora</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 w-full bg-brand-main text-white py-2.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {/* AVAILABLE */}
          {status === "available" && update && (
            <div className="flex flex-col gap-3">
              <div className="bg-brand-background rounded-2xl p-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-main flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">Nova versão disponível</p>
                  <p className="text-xs text-gray-600">
                    v{update.currentVersion} → <span className="font-bold text-brand-main">v{update.version}</span>
                  </p>
                </div>
              </div>

              {update.body && (
                <div className="bg-gray-50 rounded-xl p-3 max-h-28 overflow-auto">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Novidades:</p>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{update.body.slice(0, 600)}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={downloadAndInstall}
                  className="w-full bg-brand-main text-white py-2.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Baixar e instalar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-white border border-gray-200 py-2.5 rounded-full text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Depois
                </button>
              </div>

              <button type="button" onClick={openReleases} className="text-xs text-brand-main hover:underline flex items-center justify-center gap-1 cursor-pointer">
                Ver no GitHub <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* DOWNLOADING */}
          {status === "downloading" && (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-brand-main animate-spin" />
                <p className="text-sm font-semibold text-gray-800">Baixando atualização… {progress}%</p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-main rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Não feche o app durante o download</p>
            </div>
          )}

          {/* READY */}
          {status === "ready" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-full bg-brand-main/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-brand-main" />
              </div>
              <p className="text-sm font-bold text-gray-800">Pronto para instalar!</p>
              <p className="text-xs text-gray-500 text-center">O app será reiniciado na nova versão</p>
              <button
                type="button"
                onClick={restart}
                className="mt-1 w-full bg-brand-main text-white py-2.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                Reiniciar agora
              </button>
              <button type="button" onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                Reiniciar depois
              </button>
            </div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <p className="text-sm font-bold text-gray-800">Falha ao verificar</p>
              <p className="text-xs text-gray-500 text-center px-2">{error ?? "Erro desconhecido ao buscar atualizações"}</p>
              <div className="flex flex-col gap-2 w-full mt-1">
                <button
                  type="button"
                  onClick={checkForUpdate}
                  className="w-full bg-brand-main text-white py-2.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Tentar novamente
                </button>
                <button
                  type="button"
                  onClick={openReleases}
                  className="w-full bg-white border border-gray-200 py-2.5 rounded-full text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  Abrir página de download <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* IDLE - should not happen, but show retry */}
          {status === "idle" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-gray-600">Pronto para verificar</p>
              <button
                type="button"
                onClick={checkForUpdate}
                className="w-full bg-brand-main text-white py-2.5 rounded-full text-xs font-semibold cursor-pointer"
              >
                Verificar agora
              </button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-gray-400 text-center">Distribuído via GitHub Releases • Assinado com Ed25519</p>
      </div>
    </div>,
    document.body
  );
}
