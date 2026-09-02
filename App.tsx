import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { StorageService } from './services/storage';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import NewAd from './pages/NewAd';
import Profile from './pages/Profile';
import AdDetails from './pages/AdDetails';
import AdminDashboard from './pages/AdminDashboard';
import ContactUs from './pages/ContactUs';
import SafetyGuide from './pages/SafetyGuide';
import Layout from './components/Layout';
import { ToastProvider } from './components/ui/Toast';

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
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = StorageService.getCurrentUser();
    if (storedUser) setUser(storedUser);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    StorageService.setCurrentUser(userData);
  };

  const logout = () => {
    setUser(null);
    StorageService.setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const canAccess = user && (user.role === UserRole.ADMIN || user.role === UserRole.EDITOR);
  return canAccess ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
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
                
                {/* Support both /new and /new-ad routes */}
                <Route path="/new-ad" element={
                  <PrivateRoute>
                    <NewAd />
                  </PrivateRoute>
                } />
                <Route path="/new" element={
                  <PrivateRoute>
                    <NewAd />
                  </PrivateRoute>
                } />
                <Route path="/edit/:id" element={
                  <PrivateRoute>
                    <NewAd />
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
