import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

const NOTES_STORAGE_KEY = 'tsv_keeper_notes';

export class NotesService {
  /**
   * Create a new note
   */
  static async createNote(
    title: string,
    content: string,
    date: string,
    time: string
  ): Promise<Note> {
    const note: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      date,
      time,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const notes = await this.getAllNotes();
    notes.push(note);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));

    return note;
  }

  /**
   * Get all notes sorted by date and time (newest first)
   */
  static async getAllNotes(): Promise<Note[]> {
    try {
      const data = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (!data) return [];

      const notes = JSON.parse(data) as Note[];
      return notes.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  /**
   * Get notes for a specific date
   */
  static async getNotesByDate(date: string): Promise<Note[]> {
    const notes = await this.getAllNotes();
    return notes.filter((note) => note.date === date);
  }

  /**
   * Update a note
   */
  static async updateNote(
    id: string,
    updates: Partial<Omit<Note, 'id' | 'createdAt'>>
  ): Promise<Note | null> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((note) => note.id === id);

    if (index === -1) return null;

    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return notes[index];
  }

  /**
   * Delete a note
   */
  static async deleteNote(id: string): Promise<boolean> {
    const notes = await this.getAllNotes();
    const filteredNotes = notes.filter((note) => note.id !== id);

    if (filteredNotes.length === notes.length) return false;

    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
    return true;
  }

  /**
   * Search notes by title or content
   */
  static async searchNotes(query: string): Promise<Note[]> {
    const notes = await this.getAllNotes();
    const lowerQuery = query.toLowerCase();

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all notes
   */
  static async clearAllNotes(): Promise<void> {
    await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
  }

  /**
   * Export notes as JSON
   */
  static async exportNotes(): Promise<string> {
    const notes = await this.getAllNotes();
    return JSON.stringify(notes, null, 2);
  }

  /**
   * Import notes from JSON
   */
  static async importNotes(jsonData: string): Promise<boolean> {
    try {
      const notes = JSON.parse(jsonData) as Note[];
      if (!Array.isArray(notes)) return false;

      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      return true;
    } catch (error) {
      console.error('Error importing notes:', error);
      return false;
    }
  }
}
