import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Login from './pages/Login';
import Bills from './pages/Bills';
import Details from './pages/Details';
import NewUser from './pages/NewUser';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div className="App">
      <AppBar position="static" style={{ backgroundColor: "blue", color: "white" }}>
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Bill Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <BrowserRouter>
        <Routes>
		  <Route path="/bills" element={<Bills />} />
          <Route path="/details" element={<Details />} />
		  <Route path="/newuser" element={<NewUser />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;