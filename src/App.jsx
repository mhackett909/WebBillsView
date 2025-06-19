import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, createContext, useContext, useEffect } from 'react';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Home from './pages/Home';
import Entity from './pages/Entity';
import EditEntity from './pages/EditEntity';
import Entries from './pages/Entries';
import NewUser from './pages/NewUser';
import NewInvoice from './pages/Invoice';
import Account from './pages/Account';
import RecycleBin from './pages/RecycleBin';
import Archives from './pages/Archives';
import Contact from './pages/Contact';
import AppToolbar from './components/toolbars/AppToolbar';
import { Navigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { jwt } = useContext(AuthContext);
  const location = useLocation();

  if (!jwt) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const [jwt, setJwt] = useState(localStorage.getItem('jwt') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [refresh, setRefresh] = useState(localStorage.getItem('refreshToken') || null);

  // Sync state changes to localStorage
  const setJwtAndStore = (token) => {
    setJwt(token);
    if (token) {
      localStorage.setItem('jwt', token);
    } else {
      localStorage.removeItem('jwt');
    }
  };
  const setUsernameAndStore = (name) => {
    setUsername(name);
    if (name) {
      localStorage.setItem('username', name);
    } else {
      localStorage.removeItem('username');
    }
  };
  const setRefreshAndStore = (token) => {
    setRefresh(token);
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  };

  // Cross-tab logout: listen for jwt removal in other tabs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'jwt' && event.oldValue && !event.newValue) {
        setJwtAndStore(null);
        setUsernameAndStore('');
        setRefreshAndStore(null);
        // Optionally, you can also force a reload or redirect here
        window.location.href = '/';
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const contactEnabled = process.env.REACT_APP_CONTACT_ME_ENABLED === 'true';

  return (
    <AuthContext.Provider value={{
      jwt,
      setJwt: setJwtAndStore,
      username,
      setUsername: setUsernameAndStore,
      refresh,
      setRefresh: setRefreshAndStore
    }}>
      <BrowserRouter>
        <div className="App">
          <AppToolbar />
          <Routes>
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/entries/:id" element={<ProtectedRoute><Entries /></ProtectedRoute>} />
            <Route path="/user" element={<NewUser />} />
            <Route path="/invoice" element={<ProtectedRoute><NewInvoice /></ProtectedRoute>} />
            <Route path="/invoice/:id" element={<ProtectedRoute><NewInvoice /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
            <Route path="/archives" element={<ProtectedRoute><Archives /></ProtectedRoute>} />
            <Route path="/recycle" element={<ProtectedRoute><RecycleBin /></ProtectedRoute>} />
            <Route path="/bills/:id" element={<ProtectedRoute><EditEntity /></ProtectedRoute>} />
            <Route path="/entities/:id" element={<ProtectedRoute><Entity /></ProtectedRoute>} />
            {contactEnabled && (
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            )}
            {/* Redirect to Login if no other route matches */}
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;