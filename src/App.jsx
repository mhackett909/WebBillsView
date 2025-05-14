import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Bills from './pages/Bills';
import Details from './pages/Details';
import NewUser from './pages/NewUser';
import NewInvoice from './pages/NewInvoice';
import Account from './pages/Account';
import RecycleBin from './pages/RecycleBin';
import Archives from './pages/Archives';
import Contact from './pages/Contact';
import AppToolbar from './components/toolbars/AppToolbar';
import { Navigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { loggedIn } = useContext(AuthContext);
  const location = useLocation();
  if (!loggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
      <BrowserRouter>
        <div className="App">
          <AppToolbar />
          <Routes>
            <Route path="/home" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
            <Route path="/details/:id" element={<ProtectedRoute><Details /></ProtectedRoute>} />
            <Route path="/user" element={<NewUser />} />
            <Route path="/invoice" element={<ProtectedRoute><NewInvoice /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
            <Route path="/archives" element={<ProtectedRoute><Archives /></ProtectedRoute>} />
            <Route path="/recycle" element={<ProtectedRoute><RecycleBin /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            {/* Redirect to Login if no other route matches */}
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;