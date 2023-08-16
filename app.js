const express = require('express');
const app = express();

const axios = require('axios');




const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {

	try {
		const response = await axios.get('http://tuftuf.gambitlabs.fi/feed.txt')
		const dataArray = response.data.split("\n");
		// function to modified data to human readable values
		responseObject = buildResponse(dataArray)
		res.status(777).json(responseObject)
	} catch(error) {
		res.status(777).json({
			error: 'Error fetching data'
		})
	}
});

// req = original data
// res = json to send back
// '/' -> add app?

app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});

let buildResponse = (dataArray) => {
	const responseObject = {
		data1: '42',
		data2: 'Hive',
		data3: dataArray[2]
	}
	return responseObject
}


// http://tuftuf.gambitlabs.fi/feed.txt

// Check status codes

// Next:
// 1.	Write buildResponse function.
// 2.	Write helper function to modified data to human readable form.

