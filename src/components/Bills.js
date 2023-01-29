import React from 'react';
import { Link } from 'react-router-dom';
import {DataGrid} from '@mui/x-data-grid';
import Cookies from 'js-cookie';
import {SERVER_URL} from '../constants.js';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
class Bills extends React.Component {
	   constructor(props) {
      		super(props);
      		this.state = {selected: 0, entries: []};
    	  };
	componentDidMount() { this.fetchEntries(); }
	
	fetchEntries = () => {
	
		//const token = Cookies.get('XSRF-TOKEN');
		//console.log("token "+token);
		
    		fetch(`${SERVER_URL}/api/v1/entries`, 
      			{  
        			method: 'GET', 
        			//headers: { 'X-XSRF-TOKEN': token }
      			})
    		.then((response) => response.json()) 
    		.then((responseData) => { 
      			if (Array.isArray(responseData)) {
        			this.setState({ entries: responseData.map((entry, index) => ( { id: index, ...entry } )) });
      			} 
      			else { console.log("Fetch empty.") }        
    		})
    		.catch(err => console.error(err)); 
	
	}
	onRadioClick = (event) => {
		console.log("Entry.onRadioClick " + event.target.value);
		this.setState({selected: event.target.value});
	}
	render() {
    		const columns = [
   		{
			field: 'name',
			headerName: 'Biller',
			width: 400,
			renderCell: (params) => (
	  			<div>
		  			<Radio
		    				checked={params.row.id == this.state.selected}
		    				onChange={this.onRadioClick}
		    				value={params.row.id}
		    				color="default"
		    				size="small"
		  			/>
		  			{params.value}
	  			</div>
			)
      		},
      		{ field: 'date', headerName: 'Date', width: 200 },
		{ field: 'amount', headerName: 'Amount', width: 200 },
      		{ field: 'status', headerName: 'Status', width: 200 },
      		{ field: 'services', headerName: 'Notes', width: 400 }
      		];
      
		const entrySelected = this.state.entries[this.state.selected];
      		return (
		  <div align="left" >
		      <div style={{ height: '80vh', width: '100%', align:"left"   }}>
			<DataGrid rows={this.state.entries} columns={columns} />
		      </div>                
		    <Button id="Details" component={Link} to={{pathname:'/Details',   entry: entrySelected }} 
			    variant="outlined" color="primary" disabled={this.state.entries.length===0}  style={{margin: 10}}>
		      Details
		    </Button>

		  </div>
      		)
  }


}

export default Bills;
