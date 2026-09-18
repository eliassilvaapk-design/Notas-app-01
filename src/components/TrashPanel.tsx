import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash, RotateCcw, AlertCircle, Info, Calendar, CalendarRange, Clock } from 'lucide-react';
import { TrashNote, UserPlan } from '../types';
import { getNoteColorClass, COLORS } from '../utils/storage';

interface TrashPanelProps {
  trash: TrashNote[];
  userPlan?: UserPlan;
  onRestore: (trashId: string) => void;
  onDeletePermanently: (trashId: string) => void;
  onClearAll: () => void;
  onTriggerTimeTravel: (days: number) => void; // Fast forward time triggers
}

export default function TrashPanel({
  trash,
  onRestore,
  onDeletePermanently,
  onClearAll,
  onTriggerTimeTravel,
}: TrashPanelProps) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const trashDaysLimit = 30;

  // Calculates how many days until a trash item is hard deleted
  const getDaysUntilHardDelete = (deletedAtStr: string) => {
    const deletedTime = new Date(deletedAtStr).getTime();
    const expiryTime = deletedTime + trashDaysLimit * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const diffMs = expiryTime - now;

    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Informative Banner */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-700 dark:text-slate-300">
        <div className="flex items-start space-x-3">
          <div className="bg-indigo-100 dark:bg-indigo-950/55 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl h-11 w-11 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Funcionamento da Lixeira</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              Notas nesta lixeira foram autoexcluídas ou deletadas por você. 
              Elas permanecerão guardadas aqui por <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">30 dias</strong> antes de serem eliminadas permanentemente do dispositivo.
            </p>
          </div>
        </div>

        {/* Time travel premium showcase container */}
        <div className="border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl p-3 flex flex-col items-center justify-center shrink-0 text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Painel Simulador de Tempo
          </span>
          <div className="flex items-center gap-1.5">
            <button
              id="time-travel-1d-btn"
              onClick={() => onTriggerTimeTravel(1)}
              className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-lg shadow-sm transition-all"
              title="Avança 1 dia na simulação técnica"
            >
              +1 Dia
            </button>
            <button
              id="time-travel-7d-btn"
              onClick={() => onTriggerTimeTravel(7)}
              className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-500 hover:text-white border border-indigo-200 dark:border-indigo-900/80 rounded-lg shadow-sm transition-all text-indigo-600 dark:text-indigo-300"
              title="Avança 7 dias na simulação técnica"
            >
              +7 Dias
            </button>
          </div>
        </div>
      </div>

      {/* Main section */}
      {trash.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl">
          <RotateCcw className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="font-bold text-base tracking-tight text-slate-500">Lixeira Vazia</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Não há notas na lixeira no momento. Notas expiradas ou deletadas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Itens Deletados ({trash.length})
            </span>

            {/* Clear All action */}
            {!showConfirmClear ? (
              <button
                id="trash-clear-all-btn"
                onClick={() => setShowConfirmClear(true)}
                className="text-xs hover:text-rose-500 font-bold transition-colors flex items-center space-x-1 py-1 px-3.5 bg-black/5 dark:bg-white/5 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-950"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Esvaziar Lixeira</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-rose-500 font-bold">Tem certeza?</span>
                <button
                  id="confirm-clear-trash-btn"
                  onClick={() => {
                    onClearAll();
                    setShowConfirmClear(false);
                  }}
                  className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md shadow-sm"
                >
                  Sim, esvaziar
                </button>
                <button
                  id="cancel-clear-trash-btn"
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2.5 py-1 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Deleted Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {trash.map((item) => {
                const colorClass = getNoteColorClass(item.note.color);
                const daysLeft = getDaysUntilHardDelete(item.deletedAt);

                return (
                  <motion.div
                    key={item.id}
                    id={`trash-item-${item.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-xl border p-4 shadow-sm relative flex flex-col justify-between h-full min-h-[160px] ${colorClass}`}
                  >
                    <div>
                      {/* Top Expiry Indicator */}
                      <div className="flex items-center justify-between mb-3 text-[10px] font-semibold text-slate-400">
                        <span className="flex items-center text-rose-500">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Exclusão definitiva em {daysLeft} dias
                        </span>
                        
                        <span className="font-mono text-slate-400 bg-black/5 dark:bg-white/5 py-0.5 px-1.5 rounded">
                          {new Date(item.deletedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* original title and notes content */}
                      {item.note.title && (
                        <h4 className="font-bold text-sm mb-1.5 truncate">{item.note.title}</h4>
                      )}

                      {item.note.type === 'checklist' && item.note.checklist ? (
                        <div className="space-y-1">
                          {item.note.checklist.slice(0, 3).map((listItem) => (
                            <div key={listItem.id} className="flex items-center space-x-1.5 text-xs opacity-60">
                              <span className="text-[8px]">{listItem.completed ? '✓' : '☐'}</span>
                              <span className={`truncate line-through`}>{listItem.text}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        item.note.content && (
                          <p className="text-xs opacity-75 line-clamp-4 leading-relaxed whitespace-pre-wrap break-all">
                            {item.note.content}
                          </p>
                        )
                      )}
                    </div>

                    {/* Footer restore / permanently delete panel */}
                    <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-black/5 dark:border-white/5">
                      <button
                        id={`restore-item-btn-${item.id}`}
                        onClick={() => onRestore(item.id)}
                        className="text-xs flex items-center space-x-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-500/10 hover:bg-indigo-500/20 py-1 px-2.5 rounded-lg transition-colors border border-indigo-200/20"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>

                      <button
                        id={`hard-delete-btn-${item.id}`}
                        onClick={() => onDeletePermanently(item.id)}
                        className="text-xs flex items-center space-x-1 font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 py-1 px-2.5 rounded-lg transition-colors"
                        title="Deletar permanentemente"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        <span>Excluir de vez</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
