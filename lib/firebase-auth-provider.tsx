/**
 * Firebase Authentication Provider
 * 
 * Provides real Firebase authentication with email/password
 * Stores user profiles in Firestore
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
  lastSeen?: number;
  createdAt?: number;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          // User is signed in, fetch their profile from Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            setUser(userData);
            setFirebaseUser(fbUser);
          } else {
            // User document doesn't exist, create it
          const newUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || 'User',
            email: fbUser.email || '',
            phone: '',
            avatar: fbUser.photoURL || undefined,
              status: 'Hey there! I am using TSV Keeper',
              isOnline: true,
              lastSeen: Date.now(),
              createdAt: Date.now(),
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
            setFirebaseUser(fbUser);
          }
        } else {
          // User is signed out
          setUser(null);
          setFirebaseUser(null);
        }
      } catch (err) {
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, phone: string, password: string) => {
      try {
        setError(null);
        setIsLoading(true);

        // Create user with Firebase Authentication
        const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with name
        await updateProfile(fbUser, {
          displayName: name,
        });

        // Create user document in Firestore
        const newUser: User = {
          id: fbUser.uid,
          name,
          email,
          phone,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          status: 'Hey there! I am using TSV Keeper',
          isOnline: true,
          lastSeen: Date.now(),
          createdAt: Date.now(),
        };

        const userDocRef = doc(db, 'users', fbUser.uid);
        await setDoc(userDocRef, newUser);

        setUser(newUser);
        setFirebaseUser(fbUser);
      } catch (err) {
        const authError = err as AuthError;
        
        // Handle specific Firebase errors
        if (authError.code === 'auth/email-already-in-use') {
          setError('Email already in use');
        } else if (authError.code === 'auth/weak-password') {
          setError('Password is too weak (min 6 characters)');
        } else if (authError.code === 'auth/invalid-email') {
          setError('Invalid email address');
        } else {
          setError(authError.message || 'Sign up failed');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setIsLoading(true);

        const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);

        // Update last seen and online status
        const userDocRef = doc(db, 'users', fbUser.uid);
        await updateDoc(userDocRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });

        // Fetch updated user data
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User;
          setUser(userData);
          setFirebaseUser(fbUser);
        }
      } catch (err) {
        const authError = err as AuthError;

        // Handle specific Firebase errors
        if (authError.code === 'auth/user-not-found') {
          setError('User not found');
        } else if (authError.code === 'auth/wrong-password') {
          setError('Wrong password');
        } else if (authError.code === 'auth/invalid-email') {
          setError('Invalid email address');
        } else if (authError.code === 'auth/user-disabled') {
          setError('User account has been disabled');
        } else {
          setError(authError.message || 'Sign in failed');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Update user status to offline
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userDocRef, {
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      }

      // Sign out from Firebase
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Sign out failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser]);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      try {
        setError(null);

        if (!firebaseUser) {
          throw new Error('No user signed in');
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);

        // Update Firestore document
        await updateDoc(userDocRef, {
          ...updates,
          lastSeen: serverTimestamp(),
        });

        // Update local state
        setUser((prevUser) => {
          if (!prevUser) return null;
          return { ...prevUser, ...updates };
        });

        // Update Firebase Auth profile if name or avatar changed
        if (updates.name || updates.avatar) {
          await updateProfile(firebaseUser, {
            displayName: updates.name || firebaseUser.displayName || undefined,
            photoURL: updates.avatar || firebaseUser.photoURL || undefined,
          });
        }
      } catch (err) {
        const authError = err as AuthError;
        setError(authError.message || 'Failed to update profile');
        throw err;
      }
    },
    [firebaseUser]
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Failed to send reset email');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isSignedIn: !!user,
    signUp,
    signIn,
    signOut,
    updateUser,
    resetPassword,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}
