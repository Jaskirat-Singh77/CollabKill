import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professor';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'professor') => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'professor') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string, role: 'student' | 'professor') => {
    setIsLoading(true);
    try {
      // Only attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error('Invalid login credentials. Please check your email and password.');
      }

      if (data.user) {
        const loggedInUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: data.user.user_metadata?.role || role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        setUser(loggedInUser);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'student' | 'professor') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            name: name
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || name,
          role: data.user.user_metadata?.role || role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        setUser(newUser);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const existingUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'student',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        };
        setUser(existingUser);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const sessionUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'student',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        };
        setUser(sessionUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};