import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { fetchEntries } from '../utils/BillsApiUtil';

const Bills = () => {
    const [selected] = useState(0);
    const [entries, setEntries] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);

    useEffect(() => {
        const loadEntries = async () => {
            const fetchedEntries = await fetchEntries();
            setEntries(fetchedEntries);
        };

        loadEntries();
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
      <div>
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
        		to={{pathname:'/details',   entry: entrySelected }} 
            variant="outlined" 
            color="primary" 
            disabled={selectionModel.length === 0}  
            style={{margin: 10}}>
          		Details
        	</Button>
        	<Button id="Stats" 
        		variant="outlined" 
        		color="primary" 
        		style={{margin: 10, float: 'right'}}>
      		Stats
      	</Button>
      </div>
    );
};

export default Bills;