import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
  loading: boolean;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Google Sign-In
    const initializeGoogleAuth = async () => {
      try {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });

        // Initialize Google Identity Services
        window.google?.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
          callback: handleCredentialResponse,
        });

        // Check if user is already signed in
        const savedUser = localStorage.getItem('gaiamaps_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeGoogleAuth();
  }, []);

  const handleCredentialResponse = (response: any) => {
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const userData: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      
      setUser(userData);
      localStorage.setItem('gaiamaps_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to process credential response:', error);
    }
  };

  const login = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        window.google?.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup
            window.google?.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              { theme: 'outline', size: 'large' }
            );
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gaiamaps_user');
    localStorage.removeItem('gaiamaps_saved_stars');
    window.google?.accounts.id.disableAutoSelect();
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="google-signin-button" style={{ display: 'none' }}></div>
    </AuthContext.Provider>
  );
};

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement | null, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
