import { Note, TrashNote, AppNotification, UserPlan, UserProfile, Folder, Label } from '../types';

// Constants
const STORAGE_KEYS = {
  NOTES: 'notes_autoexpand_notes',
  TRASH: 'notes_autoexpand_trash',
  PROFILE: 'notes_autoexpand_profile',
  NOTIFICATIONS: 'notes_autoexpand_notifications',
  FOLDERS: 'notes_autoexpand_folders',
  LABELS: 'notes_autoexpand_labels',
};

// Colors definition
export interface ColorOption {
  id: string;
  name: string;
  class: string;
  dotClass: string;
  isPremium: boolean;
}

export const COLORS: ColorOption[] = [
  // All Colors completely unlocked and free
  { id: 'default', name: 'Padrão', class: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100', dotClass: 'bg-white border border-slate-300', isPremium: false },
  { id: 'red', name: 'Vermelho Pastel', class: 'bg-red-50/90 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-200', dotClass: 'bg-red-200', isPremium: false },
  { id: 'yellow', name: 'Amarelo Pastel', class: 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200', dotClass: 'bg-amber-200', isPremium: false },
  { id: 'green', name: 'Verde Pastel', class: 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200', dotClass: 'bg-emerald-200', isPremium: false },
  { id: 'blue', name: 'Azul Pastel', class: 'bg-blue-50/90 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200', dotClass: 'bg-blue-200', isPremium: false },
  { id: 'purple', name: 'Roxo Pastel', class: 'bg-purple-50/90 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40 text-purple-900 dark:text-purple-200', dotClass: 'bg-purple-200', isPremium: false },
  { id: 'pink', name: 'Rosa Pastel', class: 'bg-pink-50/90 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900/40 text-pink-900 dark:text-pink-200', dotClass: 'bg-pink-200', isPremium: false },
  { id: 'teal', name: 'Teal Pastel', class: 'bg-teal-50/90 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/40 text-teal-900 dark:text-teal-200', dotClass: 'bg-teal-200', isPremium: false },
  { id: 'indigo', name: 'Índigo', class: 'bg-indigo-50/90 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200', dotClass: 'bg-indigo-200', isPremium: false },
  { id: 'charcoal', name: 'Cinza Escuro', class: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100', dotClass: 'bg-slate-400', isPremium: false },
];

export const getNoteColorClass = (colorId: string): string => {
  const color = COLORS.find(c => c.id === colorId);
  return color ? color.class : COLORS[0].class;
};

// Local storage helper functions
export const getNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading notes', e);
    return [];
  }
};

export const saveNotes = (notes: Note[]): void => {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
};

export const getTrash = (): TrashNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRASH);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading trash', e);
    return [];
  }
};

export const saveTrash = (trash: TrashNote[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(trash));
};

export const getUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading profile', e);
  }
  // Default values
  return { plan: 'free' };
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading notifications', e);
    return [];
  }
};

export const saveNotifications = (notifications: AppNotification[]): void => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

export const getFolders = (): Folder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (raw) return JSON.parse(raw);
    
    // Default initial folders (Pessoal, Trabalho, Ideias)
    const defaults: Folder[] = [
      { id: 'f-personal', name: 'Pessoal', color: 'indigo' },
      { id: 'f-work', name: 'Trabalho', color: 'emerald' },
      { id: 'f-ideas', name: 'Ideias', color: 'amber' }
    ];
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(defaults));
    return defaults;
  } catch (e) {
    console.error('Error reading folders', e);
    return [];
  }
};

export const saveFolders = (folders: Folder[]): void => {
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
};

export const getLabels = (): Label[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LABELS);
    if (raw) return JSON.parse(raw);
    
    // Default initial labels (Urgente, Depois, Referência)
    const defaults: Label[] = [
      { id: 'l-urgent', name: 'Urgente', color: 'rose' },
      { id: 'l-later', name: 'Depois', color: 'indigo' },
      { id: 'l-ref', name: 'Referência', color: 'slate' }
    ];
    localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(defaults));
    return defaults;
  } catch (e) {
    console.error('Error reading labels', e);
    return [];
  }
};

export const saveLabels = (labels: Label[]): void => {
  localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
};

/**
 * Background Engine Simulator
 * Process expired notes, upcoming warnings, and trash cleaning.
 * Returns { expiredCount, warningCount, deletedTrashCount }
 */
export const runBackgroundCheck = (): {
  expiredCount: number;
  warningsGenerated: number;
  trashCleaned: number;
  notesUpdated: Note[];
  trashUpdated: TrashNote[];
  notificationsUpdated: AppNotification[];
} => {
  const notes = getNotes();
  const trash = getTrash();
  const profile = getUserProfile();
  const notifications = getNotifications();

  const now = new Date();
  const activeNotes: Note[] = [];
  const newlyExpiredNotes: Note[] = [];
  let warningsGenerated = 0;
  const newNotifications: AppNotification[] = [...notifications];

  // 1. Process Notes Expiration
  notes.forEach((note) => {
    const expiresAt = new Date(note.expiresAt);
    const msLeft = expiresAt.getTime() - now.getTime();
    
    if (msLeft <= 0) {
      // NOTE EXPIRED!
      newlyExpiredNotes.push(note);
      
      // Create Expired Notification
      const systemNotif: AppNotification = {
        id: `notif-exp-${note.id}-${Date.now()}`,
        noteId: note.id,
        noteTitle: note.title || 'Nota Sem Título',
        message: `A nota "${note.title || 'Sem Título'}" expirou e foi enviada para a lixeira.`,
        expiresAt: note.expiresAt,
        type: 'expired',
        createdAt: now.toISOString(),
        read: false,
      };
      
      // Remove any pending warning notifications for this note to keep inbox clean
      const filteredNotifs = newNotifications.filter(n => !(n.noteId === note.id && n.type === 'expiring_soon'));
      newNotifications.length = 0;
      newNotifications.push(...filteredNotifs, systemNotif);
    } else {
      // Note is still active. Check if it's expiring in < 24 hours (86400000 ms) and not yet notified.
      let updatedNote = { ...note };
      
      if (msLeft <= 24 * 60 * 60 * 1000 && !note.notified24h) {
        updatedNote.notified24h = true;
        warningsGenerated++;

        // Calculate hours/minutes remaining for friendly message
        const hoursLeft = Math.max(1, Math.round(msLeft / (60 * 60 * 1000)));
        
        const warningNotif: AppNotification = {
          id: `notif-warn-${note.id}-${Date.now()}`,
          noteId: note.id,
          noteTitle: note.title || 'Nota Sem Título',
          message: `Aviso: "${note.title || 'Sem Título'}" vai expirar em aproximadamente ${hoursLeft}h!`,
          expiresAt: note.expiresAt,
          type: 'expiring_soon',
          createdAt: now.toISOString(),
          read: false,
        };
        
        newNotifications.push(warningNotif);
      }
      activeNotes.push(updatedNote);
    }
  });

  // 2. Add newly expired notes to trash
  const newTrashItems: TrashNote[] = newlyExpiredNotes.map(note => ({
    id: `trash-${note.id}-${Date.now()}`,
    note: { ...note, isPinned: false }, // Unpin on trash
    deletedAt: now.toISOString(),
  }));
  const updatedTrash = [...trash, ...newTrashItems];

  // 3. Clean up old Trash items
  // Keep trash files for up to 30 days for all users
  const trashDaysLimit = 30;
  const msTrashLimit = trashDaysLimit * 24 * 60 * 60 * 1000;
  
  const finalTrash: TrashNote[] = [];
  let trashCleaned = 0;

  updatedTrash.forEach(item => {
    const deletedTime = new Date(item.deletedAt).getTime();
    const ageMs = now.getTime() - deletedTime;
    
    if (ageMs > msTrashLimit) {
      trashCleaned++;
      // Hard delete
    } else {
      finalTrash.push(item);
    }
  });

  // Save everything back if changes occurred
  if (newlyExpiredNotes.length > 0 || warningsGenerated > 0 || trashCleaned > 0 || notes.length !== activeNotes.length) {
    saveNotes(activeNotes);
    saveTrash(finalTrash);
    saveNotifications(newNotifications);
  }

  return {
    expiredCount: newlyExpiredNotes.length,
    warningsGenerated,
    trashCleaned,
    notesUpdated: activeNotes,
    trashUpdated: finalTrash,
    notificationsUpdated: newNotifications,
  };
};

/**
 * Sync logic: Import & Export
 */
export const exportDataBackup = (): string => {
  const data = {
    notes: getNotes(),
    trash: getTrash(),
    profile: getUserProfile(),
    notifications: getNotifications(),
    folders: getFolders(),
    labels: getLabels(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importDataBackup = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.notes)) saveNotes(parsed.notes);
      if (Array.isArray(parsed.trash)) saveTrash(parsed.trash);
      if (parsed.profile && typeof parsed.profile === 'object') {
        // preserve some local profile properties or take plan if imported
        saveUserProfile(parsed.profile);
      }
      if (Array.isArray(parsed.notifications)) saveNotifications(parsed.notifications);
      if (Array.isArray(parsed.folders)) saveFolders(parsed.folders);
      if (Array.isArray(parsed.labels)) saveLabels(parsed.labels);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to parse backup string', e);
    return false;
  }
};
