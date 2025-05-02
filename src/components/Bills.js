import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
function Bills() {
	const [selected, setSelected] = useState(0);
	const [entries, setEntries] = useState([]);
	const [selectionModel, setSelectionModel] = useState([]);
	const SERVER_API = process.env.REACT_APP_SERVER_URL;
	useEffect(() => {
		fetch(`${SERVER_API}/v1/entries`, 
      			{  
        			method: 'GET', 
      			})
    		.then((response) => response.json()) 
    		.then((responseData) => { 
      			if (Array.isArray(responseData)) {
        			setEntries(responseData.map((entry, index) => ( { id: index, ...entry } )) );
      			} 
      			else { console.log("Fetch empty.") }        
    		})
    		.catch(err => console.error(err)); 
	}, []);
	const columns = [
		{ field: 'id', headerName: 'Invoice #', width: 100 },			
   		{ field: 'name', headerName: 'Biller', width: 300 },
      		{ field: 'date', headerName: 'Date', width: 200 },
		{ field: 'amount', headerName: 'Amount', width: 200 },
      		{ field: 'status', headerName: 'Status', width: 200 },
      		{ field: 'services', headerName: 'Notes', width: 400 }
	];
	const entrySelected = entries[selected];
	return (
	  <div >
	  	<Button id="New" 
	  		variant="outlined" 
	  		color="primary" 
	  		style={{margin: 10}}>
	  		New Invoice
	  	</Button>
	  	<Button id="Reset" 
	  		variant="outlined" 
  			color="primary" 
  			style={{margin: 10, float: 'right'}}>
	  		Reset
	  	</Button>
	  	<Button id="Search" 
	  		variant="outlined" 
	  		color="primary" 
	  		style={{margin: 10, float: 'right'}}>
	  		Search
	  	</Button>
	  	<div style={{ height: '75vh', width: '100%'  }}>
			<DataGrid 
				rows={entries}
				columns={columns} 
				checkboxSelection
				selectionModel={selectionModel}
				onSelectionModelChange={(selection) => {
					const selectionSet = new Set(selectionModel);
    					const result = selection.filter((s) => !selectionSet.has(s));
    					setSelectionModel(result);
				}}
			/>
	      	</div>                
	    	<Button id="Details" 
	    		component={Link} 
	    		to={{pathname:'/Details',   entry: entrySelected }} 
			variant="outlined" 
			color="primary" 
			disabled={selectionModel.length == 0}  
			style={{margin: 10}}>
	      		Details
	    	</Button>
	    	<Button id="Stats" 
	    		variant="outlined" 
	    		color="primary" 
	    		style={{margin: 10, float: 'right'}}>
	  		Statistics
	  	</Button>
	  </div>
	)
}
export default Bills;
