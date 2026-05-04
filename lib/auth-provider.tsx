import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext: AuthContextType = {
    user,
    isLoading,
    isSignedIn: !!user,
    signIn: async (email: string, password: string) => {
      // TODO: Implement Firebase authentication
      const mockUser: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0],
        email,
        phone: "+1234567890",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + email,
        status: "Hey there! I'm using Cool Messenger",
        isOnline: true,
      };
      setUser(mockUser);
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
    },
    signUp: async (name: string, email: string, phone: string, password: string) => {
      // TODO: Implement Firebase authentication
      const mockUser: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + email,
        status: "Hey there! I'm using Cool Messenger",
        isOnline: true,
      };
      setUser(mockUser);
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
    },
    signOut: async () => {
      setUser(null);
      await AsyncStorage.removeItem("user");
    },
    updateUser: async (updatedUser: User) => {
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    },
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
