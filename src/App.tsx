import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar, Trash2, Settings, FileText, Bell, Sparkles, 
  Search, ShieldCheck, Heart, User, Clock, AlertTriangle, AlertCircle, X, ChevronRight, RefreshCw, Zap
} from 'lucide-react';
import { Note, TrashNote, AppNotification, UserProfile, UserPlan, Folder, Label } from './types';
import { 
  getNotes, saveNotes, getTrash, saveTrash, 
  getUserProfile, saveUserProfile, getNotifications, saveNotifications, 
  runBackgroundCheck, exportDataBackup, importDataBackup, COLORS,
  getFolders, saveFolders, getLabels, saveLabels
} from './utils/storage';

// Component Imports
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';
import TrashPanel from './components/TrashPanel';
import SettingsPanel from './components/SettingsPanel';
import NotificationCenter from './components/NotificationCenter';

// Initial Seed data (if local storage is empty)
const SEED_NOTES: Note[] = [
  {
    id: 'seed-1',
    title: '💡 Instruções de Autoexclusão',
    content: 'Bem-vindo ao Notas Autoexcluintes!\n\n1. Toque em "Criar Nota" para adicionar texto, checklists ou imagens.\n2. Escolha o prazo de validade (ex.: 1, 7 ou 30 dias).\n3. O motor em background (trabalhador) varre os prazos constantemente.\n4. Quando uma nota expira, ela vai para a lixeira automaticamente.\n5. Expirações geram notificações personalizadas (ex.: 24 horas antes do fim!).\n\n💡 Use a ferramenta de "Viagem Temporal" no cabeçalho ou nas Configurações para acelerar o tempo e ver como as notas somem!',
    type: 'text',
    color: 'default',
    isPinned: true,
    createdAt: new Date().toISOString(),
    lifeDays: 7,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notified24h: false
  },
  {
    id: 'seed-2',
    title: '🛒 Lista de Compras Express',
    content: '',
    type: 'checklist',
    checklist: [
      { id: 'c1', text: 'Leite desnatado', completed: true },
      { id: 'c2', text: 'Pão de fôrma integral', completed: false },
      { id: 'c3', text: 'Café moído premium', completed: false },
      { id: 'c4', text: 'Frutas e Hortaliças', completed: false }
    ],
    color: 'yellow',
    isPinned: true,
    createdAt: new Date().toISOString(),
    lifeDays: 1, // Quase expirando para testar notificações
    expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000 + 40 * 60 * 1000).toISOString(), // expira em 19h 40m
    notified24h: false
  },
  {
    id: 'seed-3',
    title: '⛰️ Viagem de Fim de Semana',
    content: 'Fazer as malas na quinta-feira à noite! Separar casacos pesados e câmera fotográfica de trilha.',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    color: 'green',
    isPinned: false,
    createdAt: new Date().toISOString(),
    lifeDays: 3,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    notified24h: false
  }
];

export default function App() {
  // App States
  const [activeTab, setActiveTab] = useState<'notes' | 'trash' | 'settings'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [trash, setTrash] = useState<TrashNote[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ plan: 'free' });
  const [folders, setFolders] = useState<Folder[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);

  // Modal Controllers
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'checklist' | 'image'>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  // Inline forms state inside sidebar
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('indigo');
  
  const [showAddLabelInput, setShowAddLabelInput] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('rose');

  // Simulated Time Engine State (for demonstrational purposes)
  const [timeOffsetDays, setTimeOffsetDays] = useState(0);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Load Initial setup and seed data if needed
  useEffect(() => {
    let localNotes = getNotes();
    let localTrash = getTrash();
    let localProfile = getUserProfile();
    let localNotifs = getNotifications();

    if (localNotes.length === 0 && localTrash.length === 0 && localNotifs.length === 0) {
      // First boot: write seed notes
      saveNotes(SEED_NOTES);
      localNotes = SEED_NOTES;
    }

    setNotes(localNotes);
    setTrash(localTrash);
    setProfile(localProfile);
    setNotifications(localNotifs);
    setFolders(getFolders());
    setLabels(getLabels());
  }, []);

  // Periodic Background Expiration Checks
  useEffect(() => {
    // Run initial on mount
    const checkEngine = () => {
      const result = runBackgroundCheck();
      
      // If any notes actually expired or notifications triggered, update local reactant state
      if (result.expiredCount > 0 || result.warningsGenerated > 0 || result.trashCleaned > 0) {
        setNotes(result.notesUpdated);
        setTrash(result.trashUpdated);
        setNotifications(result.notificationsUpdated);

        if (result.expiredCount > 0) {
          triggerToast(`${result.expiredCount} nota(s) expiraram e foram enviadas para a Lixeira!`);
        }
        if (result.warningsGenerated > 0) {
          triggerToast(`${result.warningsGenerated} aviso(s) de expiração pendente gerados nas notificações!`);
        }
      }
    };

    checkEngine();

    // Check every 8 seconds for real-time reactivity simulation
    const interval = setInterval(checkEngine, 8000);
    return () => clearInterval(interval);
  }, [timeOffsetDays]);

  // Toast Banner helper
  const triggerToast = (msg: string) => {
    setAlertBanner(msg);
    setTimeout(() => {
      setAlertBanner(null);
    }, 4500);
  };

  // Time Travel Simulator Logic:
  // Offset actual dates of all entities to test expiration engine easily. "Time warp"!
  const handleTimeTravelOffset = (days: number) => {
    setTimeOffsetDays(prev => prev + days);
    
    // Decrease remaining life on active notes by modifying expiration timestamp or creation timestamp
    const updatedNotes = notes.map(note => {
      const origExpiry = new Date(note.expiresAt);
      const newExpiry = new Date(origExpiry.getTime() - days * 24 * 60 * 60 * 1000);
      return {
        ...note,
        expiresAt: newExpiry.toISOString()
      };
    });

    // Also adjust deleted timestamps of trash list to test auto hard-delete cycle (7 vs 30 days)
    const updatedTrash = trash.map(item => {
      const origDeleted = new Date(item.deletedAt);
      const newDeleted = new Date(origDeleted.getTime() - days * 24 * 60 * 60 * 1000);
      return {
        ...item,
        deletedAt: newDeleted.toISOString()
      };
    });

    // Also shift notifications dates for accuracy
    const updatedNotifs = notifications.map(n => {
      const origCreated = new Date(n.createdAt);
      const newCreated = new Date(origCreated.getTime() - days * 24 * 60 * 60 * 1000);
      return {
        ...n,
        createdAt: newCreated.toISOString()
      };
    });

    // Write back to local storage and refresh state
    saveNotes(updatedNotes);
    saveTrash(updatedTrash);
    saveNotifications(updatedNotifs);

    setNotes(updatedNotes);
    setTrash(updatedTrash);
    setNotifications(updatedNotifs);

    triggerToast(`Calendário do App avançado em +${days} dia(s)! Rodando checagem de segundo plano...`);

    // Immediate calculation run
    setTimeout(() => {
      const checkRes = runBackgroundCheck();
      setNotes(checkRes.notesUpdated);
      setTrash(checkRes.trashUpdated);
      setNotifications(checkRes.notificationsUpdated);
      
      if (checkRes.expiredCount > 0) {
        triggerToast(`${checkRes.expiredCount} notas expiraram com a viagem temporal e foram enviadas para a lixeira!`);
      }
    }, 500);
  };

  // Reset to original Demo Seed Notes
  const handleResetToDemoData = () => {
    if (confirm('Deseja reinicializar o banco de dados com as notas demo de instruções?')) {
      saveNotes(SEED_NOTES);
      saveTrash([]);
      saveNotifications([]);
      setTimeOffsetDays(0);
      
      setNotes(SEED_NOTES);
      setTrash([]);
      setNotifications([]);
      triggerToast('Banco de dados redefinido para as notas demo com sucesso!');
    }
  };

  // Delete all app data physically
  const handleClearAllAppData = () => {
    saveNotes([]);
    saveTrash([]);
    saveNotifications([]);
    saveFolders([]);
    saveLabels([]);
    setTimeOffsetDays(0);

    setNotes([]);
    setTrash([]);
    setNotifications([]);
    setFolders([]);
    setLabels([]);
    triggerToast('Banco de dados completamente apagado!');
  };

  // Import Backup logic
  const handleImportBackup = (jsonStr: string): boolean => {
    const success = importDataBackup(jsonStr);
    if (success) {
      setNotes(getNotes());
      setTrash(getTrash());
      setProfile(getUserProfile());
      setNotifications(getNotifications());
      setFolders(getFolders());
      setLabels(getLabels());
      triggerToast('Backup importado com sucesso!');
    }
    return success;
  };

  // Export Backup trigger
  const handleExportBackup = () => {
    const backupText = exportDataBackup();
    const blob = new Blob([backupText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_notas_autoexcluintes_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Download do backup gerado com sucesso!');
  };

  // Update User Profile
  const handleUpdateProfile = (newProfile: UserProfile) => {
    saveUserProfile(newProfile);
    setProfile(newProfile);
    triggerToast('Configurações salvas com sucesso.');
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      color
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    saveFolders(updated);
    triggerToast(`Pasta "${name}" criada com sucesso!`);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updated = folders.filter(f => f.id !== folderId);
    setFolders(updated);
    saveFolders(updated);
    
    // Dissociate from existing notes
    const updatedNotes = notes.map(n => n.folderId === folderId ? { ...n, folderId: undefined } : n);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
    triggerToast('Pasta removida.');
  };

  const handleCreateLabel = (name: string, color: string) => {
    const newLabel: Label = {
      id: `label-${Date.now()}`,
      name: name.trim(),
      color
    };
    const updated = [...labels, newLabel];
    setLabels(updated);
    saveLabels(updated);
    triggerToast(`Etiqueta "#${name}" criada com sucesso!`);
  };

  const handleDeleteLabel = (labelId: string) => {
    const updated = labels.filter(l => l.id !== labelId);
    setLabels(updated);
    saveLabels(updated);
    
    // Dissociate from existing notes
    const updatedNotes = notes.map(n => {
      if (n.labelIds && n.labelIds.includes(labelId)) {
        return { ...n, labelIds: n.labelIds.filter(id => id !== labelId) };
      }
      return n;
    });
    setNotes(updatedNotes);
    saveNotes(updatedNotes);

    if (selectedLabelId === labelId) {
      setSelectedLabelId(null);
    }
    triggerToast('Etiqueta removida.');
  };

  // Create or Update Note Action handler
  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'expiresAt' | 'notified24h'>) => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + noteData.lifeDays * 24 * 60 * 60 * 1000);

    if (editingNote) {
      // Editing existing note
      const updated = notes.map(n => {
        if (n.id === editingNote.id) {
          return {
            ...n,
            ...noteData,
            // Recalculate expiry based on new lifeDays if edited, else preserve original
            expiresAt: noteData.lifeDays !== editingNote.lifeDays 
              ? expiryDate.toISOString() 
              : n.expiresAt,
            notified24h: noteData.lifeDays !== editingNote.lifeDays ? false : n.notified24h
          };
        }
        return n;
      });
      saveNotes(updated);
      setNotes(updated);
      triggerToast('Nota atualizada com sucesso.');
    } else {
      // Create new note
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
        notified24h: false
      };
      
      const updatedList = [newNote, ...notes];
      saveNotes(updatedList);
      setNotes(updatedList);
      triggerToast('Nova nota com validade criada!');
    }
    setEditingNote(null);
  };

  // Soft delete (moves to trash)
  const handleDeleteNote = (noteId: string) => {
    const targetNote = notes.find(n => n.id === noteId);
    if (!targetNote) return;

    // Remove from active notes
    const remainingNotes = notes.filter(n => n.id !== noteId);
    saveNotes(remainingNotes);
    setNotes(remainingNotes);

    // Create trash item
    const newTrashItem: TrashNote = {
      id: `trash-${targetNote.id}-${Date.now()}`,
      note: { ...targetNote, isPinned: false }, // Unpin automatically on deletion
      deletedAt: new Date().toISOString()
    };

    const updatedTrash = [newTrashItem, ...trash];
    saveTrash(updatedTrash);
    setTrash(updatedTrash);

    triggerToast(`Nota "${targetNote.title || 'Sem Título'}" enviada para a Lixeira!`);
  };

  // Toggle Pinned Status (unlimited for all users)
  const handleTogglePin = (noteId: string) => {
    const targetNote = notes.find(n => n.id === noteId);
    if (!targetNote) return;

    const updatedNotes = notes.map(n => {
      if (n.id === noteId) {
        return { ...n, isPinned: !n.isPinned };
      }
      return n;
    });

    saveNotes(updatedNotes);
    setNotes(updatedNotes);
  };

  // Toggle checklist item status right on the card preview
  const handleToggleChecklistItem = (noteId: string, itemId: string) => {
    const updatedNotes = notes.map(n => {
      if (n.id === noteId && n.checklist) {
        const updatedChecklist = n.checklist.map(item => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        return { ...n, checklist: updatedChecklist };
      }
      return n;
    });
    saveNotes(updatedNotes);
    setNotes(updatedNotes);
  };

  // Restore note from trash
  const handleRestoreTrashNote = (trashId: string) => {
    const trashItem = trash.find(t => t.id === trashId);
    if (!trashItem) return;

    // Filter trash list
    const remainingTrash = trash.filter(t => t.id !== trashId);
    saveTrash(remainingTrash);
    setTrash(remainingTrash);

    // Re-insert into active notes list
    const originalNote = { ...trashItem.note };
    
    // If restore after expiration date has passed, reset the life time of the note to default (1 day) to prevent immediate auto-deletion!
    const expiryTime = new Date(originalNote.expiresAt).getTime();
    if (expiryTime <= Date.now()) {
      originalNote.lifeDays = 2; // grant 2 fresh days
      originalNote.expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      originalNote.notified24h = false;
    }

    const updatedNotes = [originalNote, ...notes];
    saveNotes(updatedNotes);
    setNotes(updatedNotes);

    triggerToast(`Nota "${originalNote.title || 'Sem Título'}" restaurada com sucesso!`);
  };

  // Permanently destroy trash note
  const handleHardDeleteTrashNote = (trashId: string) => {
    const remainingTrash = trash.filter(t => t.id !== trashId);
    saveTrash(remainingTrash);
    setTrash(remainingTrash);
    triggerToast('Nota excluída permanentemente.');
  };

  // Esvaziar lixeira completamente
  const handleClearAllTrash = () => {
    saveTrash([]);
    setTrash([]);
    triggerToast('Lixeira esvaziada completamente.');
  };

  // Notifications manipulation
  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifications(updated);
  };

  const handleToggleNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    saveNotifications(updated);
    setNotifications(updated);
  };

  const handleRemoveNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
    setNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    saveNotifications([]);
    setNotifications([]);
  };

  // Search Filter evaluations
  const filteredNotes = notes.filter(n => {
    const matchesSearch = (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (n.checklist && n.checklist.some(item => item.text.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesType = typeFilter === 'all' ? true : n.type === typeFilter;
    const matchesFolder = selectedFolderId ? n.folderId === selectedFolderId : true;
    const matchesLabel = selectedLabelId ? (n.labelIds && n.labelIds.includes(selectedLabelId)) : true;
    return matchesSearch && matchesType && matchesFolder && matchesLabel;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans relative antialiased transition-colors duration-250">
      
      {/* 1. Global Alert Banner / Toast notification indicator */}
      <AnimatePresence>
        {alertBanner && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 inset-x-4 mx-auto max-w-md z-50 bg-indigo-600 dark:bg-indigo-700 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between border border-indigo-400"
          >
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
              <span className="text-xs font-bold leading-tight">{alertBanner}</span>
            </div>
            <button 
              id="dismiss-toast-btn"
              onClick={() => setAlertBanner(null)} 
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Primary Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          {/* Logo element */}
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/15">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 dark:from-white dark:via-indigo-200 dark:to-purple-200">
              Notas Autoexcluintes
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">BGP Worker: Ativo • Local Storage</p>
          </div>
        </div>

        {/* Global Toolbar and Time traveler widget info */}
        <div className="flex items-center space-x-2">
          
          {/* Time warp badge overview header */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Calendário: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{timeOffsetDays === 0 ? 'Tempo Real' : `+ ${timeOffsetDays} dias`}</strong>
            </span>
          </div>

          {/* Expira Notification bell trigger button */}
          <div className="relative">
            <button
              id="notif-dropdown-trigger"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors relative"
              title="Avisos de Expiração"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            {/* Dropdown element */}
            <AnimatePresence>
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 z-50 shadow-2xl">
                  {/* Backdrop Overlay for mobile clickaway clickers */}
                  <div 
                    onClick={() => setShowNotificationDropdown(false)} 
                    className="fixed inset-0 z-40"
                  />
                  <div className="relative z-50">
                    <NotificationCenter
                      notifications={notifications}
                      onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                      onClearAll={handleClearAllNotifications}
                      onToggleRead={handleToggleNotificationRead}
                      onRemove={handleRemoveNotification}
                      onClose={() => setShowNotificationDropdown(false)}
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Free & Complete Status Badge */}
          <div
            id="app-status-badge"
            className="py-1.5 px-3 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm shrink-0 border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Versão Gratuita & Completa</span>
            <span className="sm:hidden">Gratuito</span>
          </div>
        </div>
      </header>

      {/* 3. Primary Workspace Area Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav section */}
        <aside className="w-full md:w-56 shrink-0 flex md:flex-col gap-1.5">
          
          {/* Notes Tab Button */}
          <button
            id="tab-btn-notes"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/10'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Minhas Notas</span>
          </button>

          {/* Trash Tab Button */}
          <button
            id="tab-btn-trash"
            onClick={() => setActiveTab('trash')}
            className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'trash'
                ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/10'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Lixeira</span>
            {trash.length > 0 && (
              <span className={`ml-auto font-mono text-[9px] font-extrabold aspect-square h-4 w-4 bg-rose-500 text-white rounded-full flex items-center justify-center ${activeTab === 'trash' ? 'bg-white text-indigo-600' : ''}`}>
                {trash.length}
              </span>
            )}
          </button>

          {/* Settings Tab Button */}
          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/10'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Sincronização & Backup</span>
          </button>

          {/* FOLDERS SECTION */}
          <div className="hidden md:block border-t border-slate-200 dark:border-slate-800 pt-3 mt-1.5 text-xs space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                Pastas
              </span>
              <button
                id="add-folder-toggle-btn"
                onClick={() => {
                  setShowAddFolderInput(!showAddFolderInput);
                  setShowAddLabelInput(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Criar Nova Pasta"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Add Folder Input Form */}
            {showAddFolderInput && (
              <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 space-y-2 ml-1">
                <input
                  id="new-folder-name"
                  type="text"
                  placeholder="Nome da pasta..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-md outline-none text-[11px] font-medium"
                />
                
                {/* Minimal Folder Color Picker */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex gap-1 flex-wrap">
                    {['indigo', 'emerald', 'amber', 'rose', 'purple', 'teal'].map(col => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewFolderColor(col)}
                        className={`w-3 h-3 rounded-full border transition-transform ${
                          newFolderColor === col ? 'scale-125 ring-1 ring-indigo-500' : ''
                        } ${
                          col === 'indigo' ? 'bg-indigo-500' :
                          col === 'emerald' ? 'bg-emerald-500' :
                          col === 'amber' ? 'bg-amber-500' :
                          col === 'rose' ? 'bg-rose-500' :
                          col === 'purple' ? 'bg-purple-500' : 'bg-teal-500'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    id="save-new-folder-btn"
                    onClick={() => {
                      if (!newFolderName.trim()) return;
                      handleCreateFolder(newFolderName, newFolderColor);
                      setNewFolderName('');
                      setShowAddFolderInput(false);
                    }}
                    className="py-0.5 px-2 bg-indigo-500 text-white rounded-md font-bold text-[10px] hover:bg-indigo-600 shadow shrink-0"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}

            {/* Folder list */}
            <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
              <button
                id="folder-filter-all"
                onClick={() => setSelectedFolderId(null)}
                className={`flex items-center justify-between w-full py-1 px-3 rounded-lg text-[11px] font-bold transition-all ${
                  selectedFolderId === null
                    ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>📂 Todas as Pastas</span>
              </button>
              {folders.map(folder => {
                const isSelected = selectedFolderId === folder.id;
                const notesInFolder = notes.filter(n => n.folderId === folder.id).length;
                return (
                  <div key={folder.id} className="flex items-center group/folder">
                    <button
                      id={`folder-filter-${folder.id}`}
                      onClick={() => setSelectedFolderId(isSelected ? null : folder.id)}
                      className={`flex-1 flex items-center justify-between py-1 px-3 rounded-lg text-[11px] font-bold transition-all text-left ${
                        isSelected
                          ? 'bg-slate-200/55 dark:bg-slate-800/60 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          folder.color === 'indigo' ? 'bg-indigo-500' :
                          folder.color === 'emerald' ? 'bg-emerald-500' :
                          folder.color === 'amber' ? 'bg-amber-500' :
                          folder.color === 'rose' ? 'bg-rose-500' :
                          folder.color === 'purple' ? 'bg-purple-500' : 'bg-teal-500'
                        }`} />
                        {folder.name}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-550 font-mono font-bold">
                        {notesInFolder}
                      </span>
                    </button>
                    <button
                      id={`delete-folder-btn-${folder.id}`}
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="opacity-0 group-hover/folder:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 transition-opacity ml-1"
                      title="Excluir Pasta"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LABELS SECTION */}
          <div className="hidden md:block border-t border-slate-200 dark:border-slate-800 pt-3 mt-1.5 text-xs space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                Etiquetas
              </span>
              <button
                id="add-label-toggle-btn"
                onClick={() => {
                  setShowAddLabelInput(!showAddLabelInput);
                  setShowAddFolderInput(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Criar Nova Etiqueta"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Add Label Input Form */}
            {showAddLabelInput && (
              <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 space-y-2 ml-1">
                <input
                  id="new-label-name"
                  type="text"
                  placeholder="Nome de etiqueta..."
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-md outline-none text-[11px] font-medium"
                />
                
                {/* Minimal Label Color Picker */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex gap-1 flex-wrap">
                    {['rose', 'indigo', 'emerald', 'amber', 'purple', 'teal'].map(col => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewLabelColor(col)}
                        className={`w-3 h-3 rounded-full border transition-transform ${
                          newLabelColor === col ? 'scale-125 ring-1 ring-indigo-500' : ''
                        } ${
                          col === 'rose' ? 'bg-rose-500' :
                          col === 'indigo' ? 'bg-indigo-500' :
                          col === 'emerald' ? 'bg-emerald-500' :
                          col === 'amber' ? 'bg-amber-500' :
                          col === 'purple' ? 'bg-purple-500' : 'bg-teal-500'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    id="save-new-label-btn"
                    onClick={() => {
                      if (!newLabelName.trim()) return;
                      handleCreateLabel(newLabelName, newLabelColor);
                      setNewLabelName('');
                      setShowAddLabelInput(false);
                    }}
                    className="py-0.5 px-2 bg-indigo-500 text-white rounded-md font-bold text-[10px] hover:bg-indigo-600 shadow shrink-0"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}

            {/* Label list */}
            <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
              <button
                id="label-filter-all"
                onClick={() => setSelectedLabelId(null)}
                className={`flex items-center justify-between w-full py-1 px-3 rounded-lg text-[11px] font-bold transition-all ${
                  selectedLabelId === null
                    ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-805 dark:hover:text-slate-200'
                }`}
              >
                <span># Todas as Etiquetas</span>
              </button>
              {labels.map(label => {
                const isSelected = selectedLabelId === label.id;
                const notesWithLabel = notes.filter(n => n.labelIds && n.labelIds.includes(label.id)).length;
                return (
                  <div key={label.id} className="flex items-center group/label">
                    <button
                      id={`label-filter-${label.id}`}
                      onClick={() => setSelectedLabelId(isSelected ? null : label.id)}
                      className={`flex-1 flex items-center justify-between py-1 px-3 rounded-lg text-[11px] font-bold transition-all text-left ${
                        isSelected
                          ? 'bg-slate-200/55 dark:bg-slate-800/60 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 hover:text-slate-805 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          label.color === 'rose' ? 'bg-rose-500' :
                          label.color === 'indigo' ? 'bg-indigo-500' :
                          label.color === 'emerald' ? 'bg-emerald-500' :
                          label.color === 'amber' ? 'bg-amber-500' :
                          label.color === 'purple' ? 'bg-purple-500' : 'bg-teal-500'
                        }`} />
                        #{label.name}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-550 font-mono font-bold">
                        {notesWithLabel}
                      </span>
                    </button>
                    <button
                      id={`delete-label-btn-${label.id}`}
                      onClick={() => handleDeleteLabel(label.id)}
                      className="opacity-0 group-hover/label:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 transition-opacity ml-1"
                      title="Excluir Etiqueta"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual indicator of full access inside Sidebar */}
          <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-950 mt-auto text-xs space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
              Status do Aplicativo:
            </span>
            <div className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Acesso Gratuito e Completo</span>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 space-y-1">
              <p>• Notas fixadas ilimitadas</p>
              <p>• Todas as cores liberadas</p>
              <p>• Pastas e etiquetas sem limites</p>
              <p>• 100% sem anúncios</p>
            </div>
          </div>
        </aside>

        {/* Content switchboards */}
        <section className="flex-1 min-w-0" id="main-content-section">
          {activeTab === 'notes' && (
            <div className="space-y-6">
              
              {/* Toolbar Control Card - Google Keep inspiration */}
              <div className="bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                
                {/* Search query box */}
                <div className="relative flex-1">
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="search-notes-input"
                    type="text"
                    placeholder="Pesquisar nas suas notas autoexcluintes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                  />
                </div>

                {/* Sub filter tabs */}
                <div className="flex items-center gap-1 overflow-x-auto shrink-0 pb-1 md:pb-0">
                  {/* Add creation button */}
                  <button
                    id="create-note-floating-btn"
                    onClick={() => {
                      setEditingNote(null);
                      setIsNoteModalOpen(true);
                    }}
                    className="mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1.5 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-500/10 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Nota</span>
                  </button>

                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mr-1.5 hidden sm:inline">
                    Filtrar:
                  </span>
                  {[
                    { id: 'all', label: 'Tudo' },
                    { id: 'text', label: 'Texto' },
                    { id: 'checklist', label: 'Checklist' },
                    { id: 'image', label: 'Imagens' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      id={`filter-tabs-${filter.id}`}
                      onClick={() => setTypeFilter(filter.id as any)}
                      className={`text-[11px] py-1.5 px-3 rounded-lg font-bold transition-all ${
                        typeFilter === filter.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/60'
                          : 'bg-transparent text-slate-500 hover:text-slate-800 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filter Indicators Bar */}
              {(selectedFolderId || selectedLabelId) && (
                <div className="flex flex-wrap items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2.5 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl text-xs font-semibold">
                  <span className="text-slate-400 font-bold">Filtros ativos:</span>
                  {selectedFolderId && (() => {
                    const f = folders.find(folder => folder.id === selectedFolderId);
                    if (!f) return null;
                    return (
                      <span key={f.id} className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 shadow-sm font-bold">
                        📁 Pasta: {f.name}
                        <button onClick={() => setSelectedFolderId(null)} className="text-slate-400 hover:text-rose-500 font-bold ml-1 text-sm">×</button>
                      </span>
                    );
                  })()}
                  {selectedLabelId && (() => {
                    const l = labels.find(label => label.id === selectedLabelId);
                    if (!l) return null;
                    return (
                      <span key={l.id} className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 shadow-sm font-bold">
                        # {l.name}
                        <button onClick={() => setSelectedLabelId(null)} className="text-slate-400 hover:text-rose-500 font-bold ml-1 text-sm">×</button>
                      </span>
                    );
                  })()}
                  <button
                    onClick={() => {
                      setSelectedFolderId(null);
                      setSelectedLabelId(null);
                    }}
                    className="text-xs text-indigo-500 dark:text-indigo-450 hover:underline ml-auto font-bold"
                  >
                    Limpar Todos
                  </button>
                </div>
              )}

              {/* Warnings representation banner for simulation checks */}
              {timeOffsetDays > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-indigo-200/60 dark:border-indigo-900/70 py-2.5 px-4 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                  <span>
                    ⏰ Você viajou <strong className="font-bold">{timeOffsetDays} dias</strong> no futuro. As datas de autoexclusão aproximadas estão modificadas de acordo.
                  </span>
                  <button
                    id="reset-time-warp-toolbar"
                    onClick={() => {
                      setTimeOffsetDays(0);
                      saveNotes(getNotes()); // Trigger reload standard dates from localStorage
                      window.location.reload();
                    }}
                    className="text-xs bg-white dark:bg-slate-800 border py-1 px-2.5 rounded-lg font-semibold hover:border-indigo-500"
                  >
                    Resetar Tempo
                  </button>
                </div>
              )}

              {/* No notes placeholder */}
              {filteredNotes.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3 animate-pulse" />
                  <h3 className="font-bold text-base tracking-tight text-slate-500">Nenhuma nota encontrada</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchQuery || typeFilter !== 'all' 
                      ? 'Não há notas correspondentes ao filtro ativo atualmente.' 
                      : 'Crie uma nota contendo prazos e veja ela desaparecer no tempo informado!'}
                  </p>
                  <button
                    id="reset-filter-or-create-btn"
                    onClick={() => {
                      if (searchQuery || typeFilter !== 'all' || selectedFolderId || selectedLabelId) {
                        setSearchQuery('');
                        setTypeFilter('all');
                        setSelectedFolderId(null);
                        setSelectedLabelId(null);
                      } else {
                        setIsNoteModalOpen(true);
                      }
                    }}
                    className="mt-4 text-xs font-bold bg-indigo-500 text-white py-2 px-4 rounded-xl shadow hover:bg-indigo-600 transition-all inline-block"
                  >
                    {searchQuery || typeFilter !== 'all' || selectedFolderId || selectedLabelId ? 'Limpar Filtros' : 'Criar Primeira Nota'}
                  </button>
                </div>
              )}

              {/* Grid lists */}
              <div className="space-y-6">
                
                {/* 1. PINNED NOTES */}
                {pinnedNotes.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                      Notas Fixadas ({pinnedNotes.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onEdit={(n) => {
                            setEditingNote(n);
                            setIsNoteModalOpen(true);
                          }}
                          onDelete={handleDeleteNote}
                          onTogglePin={handleTogglePin}
                          onToggleChecklistItem={handleToggleChecklistItem}
                          folders={folders}
                          labels={labels}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. GENERAL NOTES */}
                {unpinnedNotes.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {pinnedNotes.length > 0 && (
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
                        Outras Notas Recentes ({unpinnedNotes.length})
                      </span>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unpinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onEdit={(n) => {
                            setEditingNote(n);
                            setIsNoteModalOpen(true);
                          }}
                          onDelete={handleDeleteNote}
                          onTogglePin={handleTogglePin}
                          onToggleChecklistItem={handleToggleChecklistItem}
                          folders={folders}
                          labels={labels}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trash' && (
            <TrashPanel
              trash={trash}
              userPlan={profile.plan}
              onRestore={handleRestoreTrashNote}
              onDeletePermanently={handleHardDeleteTrashNote}
              onClearAll={handleClearAllTrash}
              onTriggerTimeTravel={handleTimeTravelOffset}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onClearAllAppData={handleClearAllAppData}
              onTriggerTimeTravel={handleTimeTravelOffset}
              onResetToDemoData={handleResetToDemoData}
            />
          )}
        </section>
      </main>

      {/* 4. Modals and Dialog attachments */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        noteToEdit={editingNote}
        onSave={handleSaveNote}
        folders={folders}
        labels={labels}
      />

      {/* Elegant Footer attribution */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-4 mt-12 text-center text-[10px] text-slate-400">
        <p>Notas Autoexcluintes • 100% Gratuito e Sem Anúncios • Todas as funções liberadas</p>
      </footer>
    </div>
  );
}
