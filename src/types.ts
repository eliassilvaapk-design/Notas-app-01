export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type NoteType = 'text' | 'checklist' | 'image';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  checklist?: ChecklistItem[];
  imageUrl?: string;
  color: string; // Tailwind class or hex color
  isPinned: boolean;
  createdAt: string; // ISO string
  lifeDays: number; // Expiry days (1, 7, 30, or -1 for custom)
  expiresAt: string; // ISO string
  notified24h: boolean; // Flag to indicate if 24-hour expiration notice was shown
  folderId?: string; // Associated folder ID (null / empty for none)
  labelIds?: string[]; // Associated label IDs
}

export interface Folder {
  id: string;
  name: string;
  color?: string; // tailwind color class or name (e.g. 'indigo', 'rose', 'teal')
}

export interface Label {
  id: string;
  name: string;
  color?: string; // tailwind color class or name (e.g. 'purple', 'emerald', 'amber')
}

export interface TrashNote {
  id: string;
  note: Note;
  deletedAt: string; // ISO string
}

export interface AppNotification {
  id: string;
  noteId: string;
  noteTitle: string;
  message: string;
  expiresAt: string;
  type: 'expiring_soon' | 'expired' | 'system';
  createdAt: string;
  read: boolean;
}

export type UserPlan = 'free' | 'premium';

export interface UserProfile {
  plan: UserPlan;
  subscribedAt?: string;
  backupSyncedAt?: string;
  backupProvider?: 'local' | 'google_drive' | 'onedrive' | null;
}
