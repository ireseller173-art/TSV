/**
 * Sound Service
 * Manages notification sounds and ringtones
 */

export interface SoundPreference {
  userId: string;
  messageSound: string;
  callRingtone: string;
  incomingCallSound: string;
  outgoingMessageSound: string;
  volume: number;
  vibration: boolean;
  muteNotifications: boolean;
  updatedAt: number;
}

export interface Sound {
  id: string;
  name: string;
  url: string;
  duration: number;
  category: 'message' | 'call' | 'ringtone' | 'outgoing';
}

/**
 * Default sounds library
 */
const DEFAULT_SOUNDS: Record<string, Sound[]> = {
  message: [
    {
      id: 'msg_default',
      name: 'Стандартный звук',
      url: 'https://example.com/sounds/message-default.mp3',
      duration: 0.5,
      category: 'message',
    },
    {
      id: 'msg_bell',
      name: 'Колокольчик',
      url: 'https://example.com/sounds/message-bell.mp3',
      duration: 0.8,
      category: 'message',
    },
    {
      id: 'msg_pop',
      name: 'Звук "Поп"',
      url: 'https://example.com/sounds/message-pop.mp3',
      duration: 0.4,
      category: 'message',
    },
    {
      id: 'msg_chime',
      name: 'Звон',
      url: 'https://example.com/sounds/message-chime.mp3',
      duration: 1.0,
      category: 'message',
    },
  ],
  call: [
    {
      id: 'call_default',
      name: 'Стандартный рингтон',
      url: 'https://example.com/sounds/call-default.mp3',
      duration: 30,
      category: 'call',
    },
    {
      id: 'call_classic',
      name: 'Классический звонок',
      url: 'https://example.com/sounds/call-classic.mp3',
      duration: 30,
      category: 'call',
    },
    {
      id: 'call_modern',
      name: 'Современный звонок',
      url: 'https://example.com/sounds/call-modern.mp3',
      duration: 30,
      category: 'call',
    },
    {
      id: 'call_digital',
      name: 'Цифровой звонок',
      url: 'https://example.com/sounds/call-digital.mp3',
      duration: 30,
      category: 'call',
    },
  ],
  ringtone: [
    {
      id: 'ring_default',
      name: 'Стандартный рингтон',
      url: 'https://example.com/sounds/ringtone-default.mp3',
      duration: 30,
      category: 'ringtone',
    },
    {
      id: 'ring_melodic',
      name: 'Мелодичный',
      url: 'https://example.com/sounds/ringtone-melodic.mp3',
      duration: 30,
      category: 'ringtone',
    },
    {
      id: 'ring_upbeat',
      name: 'Энергичный',
      url: 'https://example.com/sounds/ringtone-upbeat.mp3',
      duration: 30,
      category: 'ringtone',
    },
  ],
  outgoing: [
    {
      id: 'out_default',
      name: 'Стандартный звук',
      url: 'https://example.com/sounds/outgoing-default.mp3',
      duration: 0.5,
      category: 'outgoing',
    },
    {
      id: 'out_whoosh',
      name: 'Звук "Вуш"',
      url: 'https://example.com/sounds/outgoing-whoosh.mp3',
      duration: 0.6,
      category: 'outgoing',
    },
  ],
};

/**
 * Sound Service
 */
export const soundService = {
  /**
   * Get default sound preferences
   */
  getDefaultPreferences(userId: string): SoundPreference {
    return {
      userId,
      messageSound: 'msg_default',
      callRingtone: 'call_default',
      incomingCallSound: 'ring_default',
      outgoingMessageSound: 'out_default',
      volume: 0.8,
      vibration: true,
      muteNotifications: false,
      updatedAt: Date.now(),
    };
  },

  /**
   * Get all available sounds by category
   */
  getSoundsByCategory(category: 'message' | 'call' | 'ringtone' | 'outgoing'): Sound[] {
    return DEFAULT_SOUNDS[category] || [];
  },

  /**
   * Get sound by ID
   */
  getSoundById(soundId: string): Sound | undefined {
    for (const category of Object.values(DEFAULT_SOUNDS)) {
      const sound = category.find((s) => s.id === soundId);
      if (sound) return sound;
    }
    return undefined;
  },

  /**
   * Update sound preference
   */
  updateSoundPreference(
    preferences: SoundPreference,
    updates: Partial<SoundPreference>
  ): SoundPreference {
    return {
      ...preferences,
      ...updates,
      updatedAt: Date.now(),
    };
  },

  /**
   * Validate sound ID
   */
  validateSoundId(soundId: string): boolean {
    return this.getSoundById(soundId) !== undefined;
  },

  /**
   * Get sound URL
   */
  getSoundUrl(soundId: string): string | undefined {
    const sound = this.getSoundById(soundId);
    return sound?.url;
  },

  /**
   * Get sound name
   */
  getSoundName(soundId: string): string {
    const sound = this.getSoundById(soundId);
    return sound?.name || 'Unknown Sound';
  },

  /**
   * Add custom sound
   */
  addCustomSound(sound: Sound): Sound {
    // In production, this would save to database
    return sound;
  },

  /**
   * Delete custom sound
   */
  deleteCustomSound(soundId: string): boolean {
    // In production, this would delete from database
    return true;
  },

  /**
   * Export preferences as JSON
   */
  exportPreferences(preferences: SoundPreference): string {
    return JSON.stringify(preferences, null, 2);
  },

  /**
   * Import preferences from JSON
   */
  importPreferences(jsonString: string): SoundPreference | null {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return null;
    }
  },

  /**
   * Reset to default preferences
   */
  resetToDefaults(userId: string): SoundPreference {
    return this.getDefaultPreferences(userId);
  },

  /**
   * Validate volume level
   */
  validateVolume(volume: number): boolean {
    return volume >= 0 && volume <= 1;
  },

  /**
   * Format sound duration
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Get sound category label
   */
  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      message: 'Звук сообщения',
      call: 'Звук звонка',
      ringtone: 'Рингтон входящего звонка',
      outgoing: 'Звук исходящего сообщения',
    };
    return labels[category] || category;
  },

  /**
   * Check if notifications are muted
   */
  isNotificationsMuted(preferences: SoundPreference): boolean {
    return preferences.muteNotifications;
  },

  /**
   * Toggle notifications mute
   */
  toggleMute(preferences: SoundPreference): SoundPreference {
    return this.updateSoundPreference(preferences, {
      muteNotifications: !preferences.muteNotifications,
    });
  },

  /**
   * Toggle vibration
   */
  toggleVibration(preferences: SoundPreference): SoundPreference {
    return this.updateSoundPreference(preferences, {
      vibration: !preferences.vibration,
    });
  },

  /**
   * Set volume
   */
  setVolume(preferences: SoundPreference, volume: number): SoundPreference {
    if (!this.validateVolume(volume)) {
      return preferences;
    }
    return this.updateSoundPreference(preferences, { volume });
  },

  /**
   * Get volume label
   */
  getVolumeLabel(volume: number): string {
    if (volume === 0) return 'Без звука';
    if (volume < 0.33) return 'Тихо';
    if (volume < 0.66) return 'Нормально';
    return 'Громко';
  },
};
