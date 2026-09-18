import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Pin, Trash2, Edit3, Clock, CheckSquare, Square, AlertCircle, AlertTriangle, Folder as FolderIcon } from 'lucide-react';
import { Note, Folder, Label } from '../types';
import { getNoteColorClass } from '../utils/storage';

interface NoteCardProps {
  key?: string;
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onToggleChecklistItem?: (noteId: string, itemId: string) => void;
  folders: Folder[];
  labels: Label[];
}

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleChecklistItem, folders, labels }: NoteCardProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);

  // Expiration countdown calculator
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(note.expiresAt).getTime();
      const diffMs = expiry - now;

      if (diffMs <= 0) {
        setTimeLeftStr('Expirada');
        setIsExpiringSoon(true);
        return;
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setIsExpiringSoon(diffMs <= 24 * 60 * 60 * 1000); // less than 24 hours

      if (diffDays > 0) {
        setTimeLeftStr(`${diffDays}d ${diffHours}h restantes`);
      } else if (diffHours > 0) {
        setTimeLeftStr(`${diffHours}h ${diffMinutes}m restantes`);
      } else {
        setTimeLeftStr(`${diffMinutes}m restantes`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // update every minute
    return () => clearInterval(interval);
  }, [note.expiresAt]);

  const colorClass = getNoteColorClass(note.color);

  return (
    <motion.div
      id={`note-card-${note.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 shadow-sm hover:shadow-md transition-all h-full min-h-[160px] ${colorClass}`}
    >
      {/* Top Controls / Pin & Expiration Indicator */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Expiration Stamp */}
          <div 
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${
              isExpiringSoon 
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse border border-rose-200 dark:border-rose-900/40' 
                : 'bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {isExpiringSoon ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            )}
            <span id={`note-timer-${note.id}`} className="font-mono">{timeLeftStr}</span>
          </div>

          {/* Pin Button */}
          <button
            id={`pin-note-btn-${note.id}`}
            onClick={() => onTogglePin(note.id)}
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
              note.isPinned 
                ? 'text-amber-500 opacity-100' 
                : 'text-slate-400 dark:text-slate-500 opacity-40 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title={note.isPinned ? 'Desafixar nota' : 'Fixar nota'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Content Body */}
        <div onClick={() => onEdit(note)} className="cursor-pointer space-y-2">
          {/* Simulated Image Note Display */}
          {note.type === 'image' && note.imageUrl && (
            <div className="w-full h-32 overflow-hidden rounded-lg mb-3 border border-slate-200/40 dark:border-slate-700/40">
              <img 
                src={note.imageUrl} 
                alt={note.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Title */}
          {note.title && (
            <h3 className="font-semibold text-sm leading-tight tracking-tight break-words">
              {note.title}
            </h3>
          )}

          {/* Note content (text or checklists) */}
          {note.type === 'checklist' && note.checklist && note.checklist.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {note.checklist.slice(0, 4).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center space-x-2 text-xs"
                  onClick={(e) => {
                    // Prevent editing modal popup when clicking the checkbox directly
                    e.stopPropagation();
                    if (onToggleChecklistItem) onToggleChecklistItem(note.id, item.id);
                  }}
                >
                  <button 
                    id={`checkbox-${note.id}-${item.id}`}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 fill-indigo-500/10" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 hover:text-slate-500" />
                    )}
                  </button>
                  <span className={`truncate break-all select-none ${item.completed ? 'line-through opacity-50' : ''}`}>
                    {item.text || 'Item vazio'}
                  </span>
                </div>
              ))}
              {note.checklist.length > 4 && (
                <span className="text-[10px] text-slate-500 block pt-1 font-mono">
                  + {note.checklist.length - 4} mais itens...
                </span>
              )}
            </div>
          ) : (
            note.content && (
              <p className="text-xs leading-relaxed opacity-90 break-words whitespace-pre-wrap line-clamp-6">
                {note.content}
              </p>
            )
          )}

          {/* Associated Folder & Labels Badges */}
          {(note.folderId || (note.labelIds && note.labelIds.length > 0)) && (
            <div className="flex flex-wrap gap-1 pt-3 w-full">
              {note.folderId && (() => {
                const folder = folders.find(f => f.id === note.folderId);
                if (!folder) return null;
                const folderColorClass = (() => {
                  switch (folder.color) {
                    case 'indigo': return 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/30';
                    case 'emerald': return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30';
                    case 'amber': return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/30';
                    case 'rose': return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/30';
                    case 'purple': return 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/30';
                    case 'teal': return 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/30';
                    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                  }
                })();
                return (
                  <span 
                    key={folder.id} 
                    className={`inline-flex items-center space-x-1 py-0.5 px-2 rounded-full text-[9px] font-extrabold border ${folderColorClass}`}
                    title={`Pasta: ${folder.name}`}
                  >
                    <FolderIcon className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[80px]">{folder.name}</span>
                  </span>
                );
              })()}
              {note.labelIds && note.labelIds.map(labelId => {
                const label = labels.find(l => l.id === labelId);
                if (!label) return null;
                const labelColorClass = (() => {
                  switch (label.color) {
                    case 'rose': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30';
                    case 'indigo': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30';
                    case 'emerald': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
                    case 'amber': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';
                    case 'purple': return 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-450 border-purple-200 dark:border-purple-900/30';
                    case 'teal': return 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/30';
                    case 'slate':
                    default: return 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/60';
                  }
                })();
                return (
                  <span 
                    key={label.id} 
                    className={`inline-flex items-center py-0.5 px-2 rounded-full text-[9px] font-bold border ${labelColorClass}`}
                  >
                    #{label.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-200/20 dark:border-slate-700/20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <span className="text-[9px] font-mono opacity-50">
          Criado: {new Date(note.createdAt).toLocaleDateString()}
        </span>
        
        <div className="flex items-center gap-1.5">
          {/* Edit button */}
          <button
            id={`edit-note-btn-${note.id}`}
            onClick={() => onEdit(note)}
            className="p-1 rounded-md text-slate-500 hover:text-indigo-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Editar nota"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete button (moves to Trash) */}
          <button
            id={`delete-note-btn-${note.id}`}
            onClick={() => onDelete(note.id)}
            className="p-1 rounded-md text-slate-500 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Mover para a lixeira"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
