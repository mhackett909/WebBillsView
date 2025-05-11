import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Bills from './pages/Bills';
import Details from './pages/Details';
import NewUser from './pages/NewUser';
import NewInvoice from './pages/NewInvoice';
import Account from './pages/Account';
import RecycleBin from './pages/RecycleBin';
import Archives from './pages/Archives';

import AppToolbar from './components/toolbars/AppToolbar';

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <AppToolbar />
        <Routes>
          <Route path="/home" element={<Bills />} />
          <Route path="/details/:id" element={<Details />} />
          <Route path="/newuser" element={<NewUser />} />
          <Route path="/newinvoice" element={<NewInvoice />} />
          <Route path="/account" element={<Account />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/recyclebin" element={<RecycleBin />} />
          {/* Redirect to Login if no other route matches */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;