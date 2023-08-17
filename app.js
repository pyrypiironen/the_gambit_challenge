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



// Bit conversions:

// LONG 32 bits (this should be -56)
// Decimal to binary (65480 and 65535)
// First reg					1111 1111 1100 1000
// Second reg					1111 1111 1111 1111
// Combined (2nd + 1st)			1111 1111 1111 1111 1111 1111 1100 1000
//	-->							-56 (decimal from signed 2's complement)

// REAL4 (this should be 7.101173400878906)
// Decimal to binary (15568 and 16611)
// First reg					0011 1100 1101 0000
// Second reg					0100 0000 1110 0011
// Combined (2nd + 1st)			0100 0000 1110 0011 0011 1100 1101 0000
// -->							7.101173400878906 (float)

// INTEGER 16 bits (this should be 38)
// Decimal to binary (806)
// First reg					0000 0011 0010 0110
// First byte					0000 0011
// Second byte					0010 0110
// Second byte					38 (for Signal quality)
