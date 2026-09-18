import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Clock, Calendar, Plus, Trash2, Camera, Image as ImageIcon, Folder as FolderIcon } from 'lucide-react';
import { Note, ChecklistItem, NoteType, Folder, Label } from '../types';
import { COLORS, ColorOption } from '../utils/storage';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit: Note | null; // null if creating a new note
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'expiresAt' | 'notified24h'>) => void;
  folders: Folder[];
  labels: Label[];
}

// Simulated placeholder images for rapid beautiful notes
const IMAGE_PRESETS = [
  { name: 'Montanhas', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Espaço', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
  { name: 'Estudo', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
  { name: 'Café', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
];

export default function NoteModal({ isOpen, onClose, noteToEdit, onSave, folders, labels }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('text');
  const [color, setColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [lifeDays, setLifeDays] = useState<number>(7); // Default 7 days expiry
  const [folderId, setFolderId] = useState<string>('');
  const [labelIds, setLabelIds] = useState<string[]>([]);
  
  // Checklist states
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');

  // Image states
  const [imageUrl, setImageUrl] = useState('');
  const [showImageSelector, setShowImageSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load editing note when provided
  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setType(noteToEdit.type);
      setColor(noteToEdit.color);
      setIsPinned(noteToEdit.isPinned);
      setLifeDays(noteToEdit.lifeDays);
      setChecklist(noteToEdit.checklist || []);
      setImageUrl(noteToEdit.imageUrl || '');
      setFolderId(noteToEdit.folderId || '');
      setLabelIds(noteToEdit.labelIds || []);
    } else {
      // Clear for new note
      setTitle('');
      setContent('');
      setType('text');
      setColor('default');
      setIsPinned(false);
      setLifeDays(7); // default 7 days
      setChecklist([]);
      setImageUrl('');
      setFolderId('');
      setLabelIds([]);
    }
    setNewChecklistItemText('');
    setShowImageSelector(false);
  }, [noteToEdit, isOpen]);

  // Handle color selection (all colors completely unlocked and free)
  const handleSelectColor = (selected: ColorOption) => {
    setColor(selected.id);
  };

  // Image Upload - Converts to Base64 data Url
  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('Por favor, selecione uma imagem menor que 1.5MB para persistência local rápida.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setType('image');
        setShowImageSelector(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Preset image selection
  const handleSelectPresetImage = (url: string) => {
    setImageUrl(url);
    setType('image');
    setShowImageSelector(false);
  };

  // Checklist utilities
  const handleAddChecklistItem = () => {
    if (!newChecklistItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text: newChecklistItemText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistItemText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleSave = () => {
    // Basic validation
    if (type === 'checklist' && checklist.length === 0 && !title.trim()) {
      alert('Adicione pelo menos um item na lista de tarefas.');
      return;
    }
    if (type !== 'checklist' && !title.trim() && !content.trim() && !imageUrl) {
      alert('Escreva algo ou adicione um título ou imagem antes de salvar.');
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      type,
      checklist: type === 'checklist' ? checklist : undefined,
      imageUrl: type === 'image' ? imageUrl : undefined,
      color,
      isPinned,
      lifeDays,
      folderId: folderId || undefined,
      labelIds: labelIds.length > 0 ? labelIds : undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            id="note-modal-container"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`relative w-full max-w-xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden text-slate-800 dark:text-slate-100 ${COLORS.find(c => c.id === color)?.class || COLORS[0].class}`}
          >
            {/* Header / Pin Button */}
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {noteToEdit ? 'Editar Nota' : 'Nova Nota'}
              </span>

              <div className="flex items-center space-x-2">
                {/* Save button (top action) */}
                <button
                  id="modal-save-top-btn"
                  onClick={handleSave}
                  className="flex items-center space-x-1 py-1 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-xs shadow-sm transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>

                {/* Close Button */}
                <button
                  id="modal-close-top-btn"
                  onClick={onClose}
                  className="p-1 px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Content Panel */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Image attachment show panel */}
              {type === 'image' && imageUrl && (
                <div className="relative group w-full max-h-[220px] rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                  <img 
                    src={imageUrl} 
                    alt="Upload Preview" 
                    className="w-full h-[220px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    id="remove-attached-image-btn"
                    onClick={() => {
                      setImageUrl('');
                      setType('text');
                    }}
                    className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 shadow-md hover:scale-105 transition-all"
                    title="Remover imagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Title Input */}
              <input
                id="modal-note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título"
                className="w-full text-lg font-bold bg-transparent outline-none border-b border-transparent focus:border-slate-300 dark:focus:border-slate-700 pb-1"
              />

              {/* Note Content depending on TYPE */}
              {type === 'checklist' ? (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                    Lista de Tarefas
                  </h4>
                  {/* Active checklist list */}
                  {checklist.length > 0 && (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {checklist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between group py-1 border-b border-black/5 dark:border-white/5">
                          <div className="flex items-center space-x-2.5 flex-1">
                            <button
                              id={`checkbox-item-${item.id}`}
                              onClick={() => handleToggleChecklistItem(item.id)}
                              className="text-slate-500 hover:text-slate-700"
                            >
                              {item.completed ? (
                                <span className="text-indigo-500">✓</span>
                              ) : (
                                <span className="opacity-40">☐</span>
                              )}
                            </button>
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setChecklist(checklist.map(i => i.id === item.id ? { ...i, text: newText } : i));
                              }}
                              className={`bg-transparent outline-none text-sm w-full font-medium ${item.completed ? 'line-through opacity-40' : ''}`}
                            />
                          </div>
                          <button
                            id={`remove-item-${item.id}`}
                            onClick={() => handleRemoveChecklistItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                            title="Remover item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add item input */}
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      id="modal-new-checklist-item"
                      type="text"
                      placeholder="Adicionar item à lista..."
                      value={newChecklistItemText}
                      onChange={(e) => setNewChecklistItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem();
                        }
                      }}
                      className="bg-black/5 dark:bg-white/5 border border-transparent rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 flex-1"
                    />
                    <button
                      id="modal-add-item-btn"
                      onClick={handleAddChecklistItem}
                      className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                      title="Adicionar item"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Text & Image type content text field */
                <textarea
                  id="modal-note-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva sua nota aqui..."
                  rows={8}
                  className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
                />
              )}

              {/* Preset Image Selector Panel */}
              <AnimatePresence>
                {showImageSelector && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-black/10 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Inserir Imagem</span>
                      <button 
                        id="close-image-selector-btn"
                        onClick={() => setShowImageSelector(false)} 
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>

                    {/* Preconfigured library or local select */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {IMAGE_PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectPresetImage(preset.url)}
                          className="h-14 rounded-lg overflow-hidden relative group border border-slate-200/50 hover:border-indigo-500 transition-all text-left"
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/50 text-[10px] text-white text-center py-0.5 font-medium">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="text-center py-2 border-t border-black/10 dark:border-white/10 mt-1">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button
                        id="local-file-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs inline-flex items-center space-x-1 text-indigo-500 hover:text-indigo-600 font-semibold"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Carregar do dispositivo...</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Folder and Labels selector block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5 text-xs">
                {/* Folder Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                    <FolderIcon className="w-3.5 h-3.5" />
                    <span className="font-bold">Pasta de Destino</span>
                  </div>
                  <select
                    id="note-folder-select"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="">Nenhuma Pasta</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multiple Labels Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                    <span className="font-extrabold text-[12px]">#</span>
                    <span className="font-bold">Etiquetas</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white/70 dark:bg-slate-900/70 rounded-lg border border-black/10 dark:border-white/10 min-h-[38px]">
                    {labels.length === 0 ? (
                      <span className="text-[10px] text-slate-400">Nenhuma etiqueta disponível.</span>
                    ) : (
                      labels.map((l) => {
                        const isSelected = labelIds.includes(l.id);
                        const labelColors = (() => {
                          switch (l.color) {
                            case 'rose': return 'bg-rose-100/70 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300';
                            case 'indigo': return 'bg-indigo-100/70 border-indigo-300 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-300';
                            case 'emerald': return 'bg-emerald-100/70 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300';
                            case 'amber': return 'bg-amber-100/70 border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-305';
                            case 'purple': return 'bg-purple-100/70 border-purple-300 text-purple-700 dark:bg-purple-950/40 dark:border-purple-900/50 dark:text-purple-300';
                            case 'teal': return 'bg-teal-100/70 border-teal-300 text-teal-700 dark:bg-teal-950/40 dark:border-teal-900/50 dark:text-teal-300';
                            default: return 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-200';
                          }
                        })();

                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setLabelIds(labelIds.filter((id) => id !== l.id));
                              } else {
                                setLabelIds([...labelIds, l.id]);
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-all ${
                              isSelected
                                ? labelColors
                                : 'bg-transparent border-black/10 dark:border-white/10 hover:bg-slate-200/50 text-slate-400 dark:text-slate-550'
                            }`}
                          >
                            #{l.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Note Expiration Customization Block */}
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 space-y-3 border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <h4 className="text-xs font-bold">Prazo de Vida da Nota</h4>
                      <p className="text-[10px] text-slate-400">Após este prazo, a nota se autoexcluirá.</p>
                    </div>
                  </div>
                  <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                    {lifeDays === 1 ? '1 dia' : `${lifeDays} dias`}
                  </span>
                </div>

                {/* Expiry LifeDays presets and range slider */}
                <div className="space-y-4">
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5">
                    {[1, 7, 30].map((presetVal) => (
                      <button
                        key={presetVal}
                        id={`life-preset-${presetVal}`}
                        onClick={() => setLifeDays(presetVal)}
                        className={`text-xs py-1 px-3 rounded-lg border transition-all font-medium ${
                          lifeDays === presetVal 
                            ? 'bg-indigo-500 border-indigo-500 text-white' 
                            : 'bg-black/5 dark:bg-white/5 border-slate-300/40 hover:bg-black/10'
                        }`}
                      >
                        {presetVal === 1 ? '1 Dia' : `${presetVal} Dias`}
                      </button>
                    ))}
                    
                    {/* Custom designation helper */}
                    <button
                      id="life-preset-custom"
                      onClick={() => setLifeDays(lifeDays === 1 || lifeDays === 7 || lifeDays === 30 ? 3 : lifeDays)}
                      className={`text-xs py-1 px-3 rounded-lg border transition-all font-medium ${
                        lifeDays !== 1 && lifeDays !== 7 && lifeDays !== 30 
                          ? 'bg-indigo-500 border-indigo-500 text-white' 
                          : 'bg-black/5 dark:bg-white/5 border-slate-300/40 hover:bg-black/10'
                      }`}
                    >
                      Personalizado
                    </button>
                  </div>

                  {/* Slider and expiration schedule review */}
                  <div>
                    <input
                      id="note-life-slider"
                      type="range"
                      min={1}
                      max={90}
                      value={lifeDays}
                      onChange={(e) => setLifeDays(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>1 Dia</span>
                      <span>30 Dias</span>
                      <span>60 Dias</span>
                      <span>90 Dias</span>
                    </div>
                  </div>

                  {/* Expiration warning timestamp representation */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white/40 dark:bg-black/20 p-2 rounded-lg border border-black/5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Prazo calculado:{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {new Date(Date.now() + lifeDays * 24 * 60 * 60 * 1000).toLocaleString('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Footer Actions: Color options picker & Type switches */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Actions: Note Type Switches & Add Image */}
              <div className="flex items-center space-x-1.5">
                {/* Note type buttons */}
                <button
                  id="type-text-btn"
                  onClick={() => setType('text')}
                  className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                    type === 'text' 
                      ? 'bg-black/10 dark:bg-white/10 shadow-inner' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  Texto
                </button>
                <button
                  id="type-checklist-btn"
                  onClick={() => setType('checklist')}
                  className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                    type === 'checklist' 
                      ? 'bg-black/10 dark:bg-white/10 shadow-inner' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  Checklist
                </button>

                {/* Add Image/File trigger */}
                <button
                  id="type-image-trigger"
                  onClick={() => setShowImageSelector(!showImageSelector)}
                  className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex items-center space-x-1 text-xs font-medium transition-all ${
                    type === 'image' ? 'text-indigo-600 dark:text-indigo-400 bg-black/5' : ''
                  }`}
                  title="Inserir imagem"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Imagem</span>
                </button>
              </div>

              {/* Right actions: Color palette selection */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
                  Cor:
                </span>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] sm:max-w-none pr-1">
                  {COLORS.map((col) => (
                    <button
                      key={col.id}
                      id={`color-picker-btn-${col.id}`}
                      onClick={() => handleSelectColor(col)}
                      className={`relative w-6 h-6 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${col.dotClass} ${
                        color === col.id 
                          ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      title={col.name}
                    >
                      {/* Check indicator */}
                      {color === col.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
