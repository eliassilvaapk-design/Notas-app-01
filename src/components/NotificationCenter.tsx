import { Bell, BellOff, CheckCheck, Trash2, X, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { AppNotification } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onToggleRead: (id: string) => void;
  onRemove: (id: string) => void;
  onClose?: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onToggleRead,
  onRemove,
  onClose,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[480px]">
      {/* Title Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-indigo-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm tracking-tight text-slate-700 dark:text-slate-200">
            Avisos de Expiração
          </h3>
        </div>

        <div className="flex items-center space-x-1.5">
          {onClose && (
            <button
              id="close-notif-center"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <button
            id="mark-all-read-btn"
            onClick={onMarkAllAsRead}
            className="hover:text-indigo-600 flex items-center space-x-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Marcar lidas</span>
          </button>

          <button
            id="clear-all-notif-btn"
            onClick={onClearAll}
            className="hover:text-rose-500 flex items-center space-x-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar tudo</span>
          </button>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
            <BellOff className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-semibold">Tudo em dia!</p>
            <p className="text-[10px] mt-0.5 leading-relaxed">
              Você será avisado aqui 24 horas antes das suas notas expirarem.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3.5 flex items-start gap-3 transition-colors ${
                  notif.read ? 'opacity-65 hover:opacity-100' : 'bg-indigo-50/20 dark:bg-indigo-500/5'
                }`}
              >
                {/* Warning icon indicators */}
                <div className="mt-0.5">
                  {notif.type === 'expiring_soon' ? (
                    <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-1.5 rounded-lg shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                    </div>
                  ) : (
                    <div className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-1.5 rounded-lg shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 select-none">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold truncate pr-3">
                      {notif.type === 'expiring_soon' ? 'Vence em breve' : 'Nota expirada'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 leading-none">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-normal break-words">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    {/* Read indicator toggle */}
                    <button
                      id={`toggle-read-btn-${notif.id}`}
                      onClick={() => onToggleRead(notif.id)}
                      className="text-[9px] text-indigo-500 hover:text-indigo-600 font-bold flex items-center space-x-1"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{notif.read ? 'Marcar como não lida' : 'Marcar como lida'}</span>
                    </button>

                    {/* Individual remove button */}
                    <button
                      id={`remove-notif-btn-${notif.id}`}
                      onClick={() => onRemove(notif.id)}
                      className="text-[9px] text-slate-400 hover:text-rose-600 font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
