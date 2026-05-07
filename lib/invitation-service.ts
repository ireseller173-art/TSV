import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
// Crypto utilities for generating unique codes

export interface Invitation {
  id: string;
  code: string;
  invitedBy: string;
  invitedByName: string;
  invitedByAvatar: string;
  inviteeEmail?: string;
  inviteeSms?: string;
  createdAt: number;
  expiresAt: number; // 12 hours from creation
  status: 'pending' | 'accepted' | 'expired' | 'rejected';
  acceptedBy?: string;
  acceptedAt?: number;
  invitationLink: string;
}

const INVITATIONS_KEY = 'invitations';
const INVITATION_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

export class InvitationService {
  /**
   * Generate unique invitation code
   */
  private static generateUniqueCode(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomStr}`.toUpperCase();
  }

  /**
   * Create invitation link
   */
  private static createInvitationLink(code: string, appScheme: string = 'tsv-keeper'): string {
    return `${appScheme}://invite/${code}`;
  }

  /**
   * Create a new invitation
   */
  static async createInvitation(
    invitedBy: string,
    invitedByName: string,
    invitedByAvatar: string,
    inviteeEmail?: string,
    inviteeSms?: string
  ): Promise<Invitation | null> {
    try {
      const code = this.generateUniqueCode();
      const now = Date.now();
      const expiresAt = now + INVITATION_EXPIRY_MS;
      const invitationLink = this.createInvitationLink(code);

      const invitation: Invitation = {
        id: `inv_${code}_${now}`,
        code,
        invitedBy,
        invitedByName,
        invitedByAvatar,
        inviteeEmail,
        inviteeSms,
        createdAt: now,
        expiresAt,
        status: 'pending',
        invitationLink,
      };

      // Save to AsyncStorage
      try {
        const invitations = await this.getInvitationsByUser(invitedBy);
        invitations.push(invitation);
        await AsyncStorage.setItem(
          `${INVITATIONS_KEY}_${invitedBy}`,
          JSON.stringify(invitations)
        );
      } catch (storageError) {
        console.warn('AsyncStorage save failed:', storageError);
      }

      // Save to Firebase
      try {
        const db = getFirestore();
        const invRef = doc(db, 'invitations', invitation.id);
        await setDoc(invRef, invitation);
        console.log('✅ Invitation created in Firebase:', invitation.id);
      } catch (firebaseError) {
        console.warn('Firebase save failed, using local storage:', firebaseError);
      }

      console.log('✅ Invitation created successfully:', invitation.id);
      return invitation;
    } catch (error) {
      console.error('Error creating invitation:', error);
      return null;
    }
  }

  /**
   * Get invitation by code
   */
  static async getInvitationByCode(code: string): Promise<Invitation | null> {
    try {
      // Try Firebase first
      try {
        const db = getFirestore();
        const invRef = collection(db, 'invitations');
        const q = query(invRef, where('code', '==', code));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const invitation = snapshot.docs[0].data() as Invitation;
          return invitation;
        }
      } catch (firebaseError) {
        console.warn('Firebase query failed, checking local storage:', firebaseError);
      }

      // Fall back to local search
      const allInvitations = await this.getAllInvitations();
      return allInvitations.find((inv) => inv.code === code) || null;
    } catch (error) {
      console.error('Error getting invitation by code:', error);
      return null;
    }
  }

  /**
   * Validate invitation (check if not expired and not already used)
   */
  static async validateInvitation(code: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const invitation = await this.getInvitationByCode(code);

      if (!invitation) {
        return { valid: false, reason: 'Приглашение не найдено' };
      }

      if (invitation.status !== 'pending') {
        return { valid: false, reason: `Приглашение уже ${invitation.status}` };
      }

      const now = Date.now();
      if (now > invitation.expiresAt) {
        // Mark as expired
        await this.updateInvitationStatus(invitation.id, 'expired');
        return { valid: false, reason: 'Приглашение истекло' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating invitation:', error);
      return { valid: false, reason: 'Ошибка при валидации' };
    }
  }

  /**
   * Accept invitation
   */
  static async acceptInvitation(code: string, userId: string): Promise<Invitation | null> {
    try {
      const invitation = await this.getInvitationByCode(code);

      if (!invitation) {
        throw new Error('Приглашение не найдено');
      }

      const validation = await this.validateInvitation(code);
      if (!validation.valid) {
        throw new Error(validation.reason || 'Приглашение невалидно');
      }

      const updatedInvitation: Invitation = {
        ...invitation,
        status: 'accepted',
        acceptedBy: userId,
        acceptedAt: Date.now(),
      };

      // Update in AsyncStorage
      const invitations = await this.getInvitationsByUser(invitation.invitedBy);
      const index = invitations.findIndex((inv) => inv.id === invitation.id);
      if (index !== -1) {
        invitations[index] = updatedInvitation;
        await AsyncStorage.setItem(
          `${INVITATIONS_KEY}_${invitation.invitedBy}`,
          JSON.stringify(invitations)
        );
      }

      // Update in Firebase
      try {
        const db = getFirestore();
        const invRef = doc(db, 'invitations', invitation.id);
        await updateDoc(invRef, {
          status: 'accepted',
          acceptedBy: userId,
          acceptedAt: Date.now(),
        });
      } catch (firebaseError) {
        console.warn('Firebase update failed, using local storage:', firebaseError);
      }

      console.log('✅ Invitation accepted:', invitation.id);
      return updatedInvitation;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return null;
    }
  }

  /**
   * Reject invitation
   */
  static async rejectInvitation(code: string): Promise<boolean> {
    try {
      const invitation = await this.getInvitationByCode(code);

      if (!invitation) {
        return false;
      }

      await this.updateInvitationStatus(invitation.id, 'rejected');
      return true;
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      return false;
    }
  }

  /**
   * Update invitation status
   */
  private static async updateInvitationStatus(
    invitationId: string,
    status: 'pending' | 'accepted' | 'expired' | 'rejected'
  ): Promise<void> {
    try {
      // Update in Firebase
      try {
        const db = getFirestore();
        const invRef = doc(db, 'invitations', invitationId);
        await updateDoc(invRef, { status });
      } catch (firebaseError) {
        console.warn('Firebase update failed:', firebaseError);
      }

      // Update in all local storages (search and update)
      const allInvitations = await this.getAllInvitations();
      const invitation = allInvitations.find((inv) => inv.id === invitationId);
      if (invitation) {
        const userInvitations = await this.getInvitationsByUser(invitation.invitedBy);
        const index = userInvitations.findIndex((inv) => inv.id === invitationId);
        if (index !== -1) {
          userInvitations[index].status = status;
          await AsyncStorage.setItem(
            `${INVITATIONS_KEY}_${invitation.invitedBy}`,
            JSON.stringify(userInvitations)
          );
        }
      }
    } catch (error) {
      console.error('Error updating invitation status:', error);
    }
  }

  /**
   * Get invitations sent by user
   */
  static async getInvitationsByUser(userId: string): Promise<Invitation[]> {
    try {
      const invJson = await AsyncStorage.getItem(`${INVITATIONS_KEY}_${userId}`);
      return invJson ? JSON.parse(invJson) : [];
    } catch (error) {
      console.error('Error getting invitations by user:', error);
      return [];
    }
  }

  /**
   * Get all invitations (for admin/debug)
   */
  static async getAllInvitations(): Promise<Invitation[]> {
    try {
      // Try Firebase first
      try {
        const db = getFirestore();
        const invRef = collection(db, 'invitations');
        const snapshot = await getDocs(invRef);
        const invitations: Invitation[] = [];
        snapshot.forEach((doc) => {
          invitations.push(doc.data() as Invitation);
        });
        if (invitations.length > 0) {
          return invitations;
        }
      } catch (firebaseError) {
        console.warn('Firebase query failed:', firebaseError);
      }

      // Fall back to AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const invitationKeys = keys.filter((key) => key.startsWith(INVITATIONS_KEY));
      const allInvitations: Invitation[] = [];

      for (const key of invitationKeys) {
        const invJson = await AsyncStorage.getItem(key);
        if (invJson) {
          const invitations = JSON.parse(invJson);
          allInvitations.push(...invitations);
        }
      }

      return allInvitations;
    } catch (error) {
      console.error('Error getting all invitations:', error);
      return [];
    }
  }

  /**
   * Clean up expired invitations
   */
  static async cleanupExpiredInvitations(): Promise<number> {
    try {
      const allInvitations = await this.getAllInvitations();
      const now = Date.now();
      let cleanedCount = 0;

      for (const invitation of allInvitations) {
        if (invitation.status === 'pending' && now > invitation.expiresAt) {
          await this.updateInvitationStatus(invitation.id, 'expired');
          cleanedCount++;
        }
      }

      console.log(`✅ Cleaned up ${cleanedCount} expired invitations`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
      return 0;
    }
  }

  /**
   * Get invitation statistics
   */
  static async getInvitationStats(userId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    rejected: number;
  }> {
    try {
      const invitations = await this.getInvitationsByUser(userId);
      return {
        total: invitations.length,
        pending: invitations.filter((inv) => inv.status === 'pending').length,
        accepted: invitations.filter((inv) => inv.status === 'accepted').length,
        expired: invitations.filter((inv) => inv.status === 'expired').length,
        rejected: invitations.filter((inv) => inv.status === 'rejected').length,
      };
    } catch (error) {
      console.error('Error getting invitation stats:', error);
      return { total: 0, pending: 0, accepted: 0, expired: 0, rejected: 0 };
    }
  }
}
