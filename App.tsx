import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { StorageService } from './services/storage';
import { getAccountStatus } from './lib/accountLifecycle';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import NewAd from './pages/NewAd';
import Profile from './pages/Profile';
import AdDetails from './pages/AdDetails';
import AdminDashboard from './pages/AdminDashboard';
import ContactUs from './pages/ContactUs';
import SafetyGuide from './pages/SafetyGuide';
import { RulesPage, PrivacyPage, BannedItemsPage } from './pages/LegalPages';
import Layout from './components/Layout';
import { ToastProvider } from './components/ui/Toast';
import PageLoader from './components/ui/PageLoader';

// Theme Context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType>(null!);
export const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bazaar_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('bazaar_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    StorageService.processExpiredAds();
    StorageService.processPendingAccountDeletions();
    const storedUser = StorageService.getCurrentUser();
    if (storedUser) {
      const fresh = StorageService.getUserById(storedUser.id);
      if (fresh) {
        setUser(fresh);
        StorageService.setCurrentUser(fresh);
      } else {
        setUser(null);
        StorageService.setCurrentUser(null);
      }
    }
  }, []);

  const login = (userData: User) => {
    const fresh = StorageService.getUserById(userData.id) || userData;
    setUser(fresh);
    StorageService.setCurrentUser(fresh);
  };

  const logout = () => {
    setUser(null);
    StorageService.setCurrentUser(null);
  };

  const refreshUser = () => {
    const current = StorageService.getCurrentUser();
    if (!current) {
      setUser(null);
      return;
    }
    const fresh = StorageService.getUserById(current.id);
    if (fresh) {
      setUser(fresh);
      StorageService.setCurrentUser(fresh);
    } else {
      setUser(null);
      StorageService.setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// City Context
interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  setCity: (city: string) => void;
  cities: string[];
  refreshCities: () => void;
}

const CityContext = createContext<CityContextType>(null!);
export const useCity = () => useContext(CityContext);

const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>('ALL');
  const [cities, setCities] = useState<string[]>([]);

  const refreshCities = () => {
    setCities(StorageService.getCities());
  };

  useEffect(() => {
    refreshCities();
    const savedCity = localStorage.getItem('bazaar_viewing_city');
    if (savedCity) {
      setSelectedCityState(savedCity);
    }
  }, []);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('bazaar_viewing_city', city);
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, setCity: setSelectedCity, cities, refreshCities }}>
      {children}
    </CityContext.Provider>
  );
};

// Route Protection
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

/** Requires ACTIVE account (blocks pending deletion / deactivated / banned from posting) */
const ActiveAccountRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (getAccountStatus(user) !== 'ACTIVE') {
    return <Navigate to="/profile?tab=settings" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const canAccess = user && (user.role === UserRole.ADMIN || user.role === UserRole.EDITOR);
  return canAccess ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    (async () => {
      StorageService.processExpiredAds();
      StorageService.processPendingAccountDeletions();
      try {
        const { isPostgresApiEnabled, pullFromPostgres } = await import('./services/postgresSync');
        if (isPostgresApiEnabled()) {
          const result = await pullFromPostgres();
          if (!result.ok) {
            console.warn('[postgres] pull failed, using localStorage:', result.error);
          } else {
            console.info('[postgres] bootstrap pulled into localStorage');
          }
        }
      } catch (e) {
        console.warn('[postgres] sync unavailable', e);
      }
      if (!cancelled) {
        timer = window.setTimeout(() => setIsReady(true), 200);
      }
    })();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!isReady) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <CityProvider>
          <ToastProvider>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ad/:id" element={<AdDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/safety" element={<SafetyGuide />} />
                <Route path="/scam-guide" element={<SafetyGuide />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/banned" element={<BannedItemsPage />} />
                
                {/* Support both /new and /new-ad routes */}
                <Route path="/new-ad" element={
                  <PrivateRoute>
                    <ActiveAccountRoute>
                      <NewAd />
                    </ActiveAccountRoute>
                  </PrivateRoute>
                } />
                <Route path="/new" element={
                  <PrivateRoute>
                    <ActiveAccountRoute>
                      <NewAd />
                    </ActiveAccountRoute>
                  </PrivateRoute>
                } />
                <Route path="/edit/:id" element={
                  <PrivateRoute>
                    <ActiveAccountRoute>
                      <NewAd />
                    </ActiveAccountRoute>
                  </PrivateRoute>
                } />
                
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />

                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </HashRouter>
          </ToastProvider>
        </CityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
