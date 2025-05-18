import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Home from './pages/Home';
import Party from './pages/Party';
import Payments from './pages/Payments';
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
  const [jwt, setJwt] = useState(sessionStorage.getItem('jwt') || null);
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '');
  const [refresh, setRefresh] = useState(sessionStorage.getItem('refreshToken') || null);

  const contactEnabled = process.env.REACT_APP_CONTACT_ME_ENABLED === 'true';

  return (
    <AuthContext.Provider value={{ jwt, setJwt, username, setUsername, refresh, setRefresh }}>
      <BrowserRouter>
        <div className="App">
          <AppToolbar />
          <Routes>
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/entries/:id" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/user" element={<NewUser />} />
            <Route path="/invoice" element={<ProtectedRoute><NewInvoice /></ProtectedRoute>} />
            <Route path="/invoice/:id" element={<ProtectedRoute><NewInvoice /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
            <Route path="/archives" element={<ProtectedRoute><Archives /></ProtectedRoute>} />
            <Route path="/recycle" element={<ProtectedRoute><RecycleBin /></ProtectedRoute>} />
            <Route path="/bills/:id" element={<ProtectedRoute><Party /></ProtectedRoute>} />
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