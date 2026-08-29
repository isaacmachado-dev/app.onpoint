import { getCurrentWindow } from "@tauri-apps/api/window";
import { LazyStore } from "@tauri-apps/plugin-store";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ButtonToggle } from "./Button.Toggle";
import ModalHour, { ScheduleItem } from "./Modal.Hour";

export default function PageConfiguration() {
  const [ativo, setAtivo] = useState(false);
  const [modalContainerHour, setModalContainerHour] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Carregar horários salvos ao montar o componente
  useEffect(() => {
    const loadSchedules = async () => {
      // 1. Tenta carregar do Tauri Store
      try {
        const store = new LazyStore("settings.json");
        const stored = await store.get<ScheduleItem[]>("schedules");
        if (stored && Array.isArray(stored) && stored.length > 0) {
          setSchedules(stored);
          return;
        }
      } catch (err) {
        console.warn("Tauri Store não disponível, tentando localStorage:", err);
      }

      // 2. Fallback para localStorage
      try {
        const savedRaw = localStorage.getItem("schedules");
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSchedules(parsed);
          }
        }
      } catch (err) {
        console.error("Erro ao ler localStorage:", err);
      }
    };

    loadSchedules();
  }, []);

  const fecharJanela = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.close(); 
    } catch (error) {
      console.error("Failed to hide window:", error);
    }
  };

  const persistSchedules = async (updated: ScheduleItem[]) => {
    setSchedules(updated);

    // Tauri Store
    try {
      const store = new LazyStore("settings.json");
      await store.set("schedules", updated);
      await store.save();
    } catch (err) {
      console.warn("Falha ao salvar no Tauri Store:", err);
    }

    // localStorage
    try {
      localStorage.setItem("schedules", JSON.stringify(updated));
    } catch (err) {
      console.error("Falha ao salvar no localStorage:", err);
    }
  };

  const handleDeleteSchedule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = schedules.filter((item) => item.id !== id);
    persistSchedules(updated);
  };

  const handleEditSchedule = (schedule: ScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSchedule(schedule);
    setModalContainerHour(true);
  };

  const handleAddNewSchedule = () => {
    setEditingSchedule(null);
    setModalContainerHour(true);
  };

  const handleSaveSchedule = (savedSchedule: ScheduleItem) => {
    const exists = schedules.some((s) => s.id === savedSchedule.id);
    const updated = exists
      ? schedules.map((s) => (s.id === savedSchedule.id ? savedSchedule : s))
      : [...schedules, savedSchedule];

    persistSchedules(updated);
    setEditingSchedule(null);
  };
    
  return (
    <>
      <div className="flex flex-col items-center justify-center text-center gap-4 w-full max-w-sm">
        {/* Toggle Inicializar com o sistema */}
        <div className="bg-white rounded-full p-4 w-full">
          <div className="max-w-md mx-auto">
            <ButtonToggle
              label="Inicializar ao ligar o sistema"
              checked={ativo}
              onChange={setAtivo}
              activeColorClass="bg-brand-secondary"
            />
          </div>
        </div>

        {/* Card Definir horário */}
        <div className="bg-white rounded-3xl p-5 w-full text-left shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-black">Definir horário</h2>
            <button
              type="button"
              onClick={handleAddNewSchedule}
              className="p-1 text-brand-main hover:bg-brand-background rounded-full transition-colors cursor-pointer"
              title="Adicionar novo horário"
            >
              {schedules.length !== 0 ? (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <>
                </>
                )}
            </button>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {schedules.length === 0 ? (
              <button
                type="button"
                onClick={handleAddNewSchedule}
                className="text-xs font-semibold text-brand-main bg-brand-background hover:bg-brand-secondary/40 py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Adicionar horário de expediente
              </button>
            ) : (
              schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  onClick={(e) => handleEditSchedule(schedule, e)}
                  className="bg-[#D9D9D9] hover:bg-[#cecece] transition-colors rounded-full px-4 py-2.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="font-bold text-sm text-gray-700">
                    {schedule.daysLabel}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleEditSchedule(schedule, e)}
                      className="p-1 text-black hover:text-brand-main transition-colors cursor-pointer"
                      title="Editar horário"
                    >
                      <SquarePen className="w-[18px] h-[18px] stroke-[2.2]" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                      className="p-1 text-black hover:text-red-500 transition-colors cursor-pointer"
                      title="Excluir horário"
                    >
                      <Trash2 className="w-[18px] h-[18px] stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Botão Fechar completamente */}
        <button 
          type="button"
          className="bg-white rounded-full p-4 font-semibold text-sm w-full justify-between flex flex-row cursor-pointer hover:bg-gray-50 transition-colors" 
          onClick={fecharJanela}
        >
          <h3 className="text-black">Fechar completamente</h3>
        </button>
      </div>

      {modalContainerHour && (
        <ModalHour
          setModalContainerHour={setModalContainerHour}
          editingSchedule={editingSchedule}
          onSave={handleSaveSchedule}
        />
      )}
    </>
  );
}