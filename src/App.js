import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Bills from './components/Bills';
import {BrowserRouter, Routes,  Route} from 'react-router-dom';

function App() {
  return (
  	<div className="App">
  		<AppBar position="static" style={{backgroundColor: "blue", color:"white"}}>
  			<Toolbar>
  				<Typography variant="h6" color="inherit">
  				Bill Manager
  				</Typography>
  			</Toolbar>
		</AppBar>
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Bills/>} />
			</Routes>
		</BrowserRouter>
	</div>
  );

 }

export default App;
