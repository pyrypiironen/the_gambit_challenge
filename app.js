// Importing modules
const express = require('express');
const app = express();
const axios = require('axios');

// Setting up the port. Local port 3000 for now.
const PORT = process.env.PORT || 3000;

//The application
app.get('/', async (req, res) => {
	try {
		const response = await axios.get('http://tuftuf.gambitlabs.fi/feed.txt')
		dataArray = buildArray(response);
		responseObject = buildResponse(dataArray)
		res.status(200).json(responseObject)
	} catch(error) {
		res.status(400).json({
			error: 'Error fetching data'
		})
	}
});

// Build the data array for later use.
let buildArray = (response) => {
	const lines = response.data.split("\n");
	const dataArray = [];
	 	// Index 0 for the date
		dataArray[0] = lines[0];
		// Save the value to index given before that.
		for (let i = 1; i < lines.length; i++) {
			const parts = lines[i].split(':')
			dataArray[parts[0]] = parts[1];
		}
		return dataArray;
	}

// Build the response for later use.
let buildResponse = (dataArray) => {
	const responseObject = {
		// Date
		'Flowrate' : 99999999,
		'Energy Flow Rate' : 99999999,
		'Velocity' : 99999999,
		'Fluit sound speed' : 99999999,
		'Positive accumulator' : 99999999,
		'Positive decimal fractation' : 99999999,
		'Negative accumulator' : 99999999,
		'Negative decimal fractation' : 99999999,
		'Positive energy accumulatro' : 99999999,
		'Positive energy decimal fractation' : 99999999,
		
		// 21-22 (Should be -56)
		'Negative energy accumulator' : convertLong(dataArray[21], dataArray[22]),

		'Negative energy decimal fractation' : 99999999,
		'Net accumulator' : 99999999,
		'Net decimal fractation' : 99999999,
		'Net energy accumulator' : 99999999,
		'Net energy decimal fractation' : 99999999,

		'Temperature #1/inlet' : 99999999,

		'Temperature #2/inlet' : 99999999,
		'Analog input AI3' : 99999999,
		'Analog input AI4' : 99999999,
		'Analog input AI5' : 99999999,
		'Current input at AI3' : 99999999,
		// Duplicates may result unexpected behavior.
		//'Current input at AI3' : 99999999,
		//'Current input at AI3' : 99999999,
		'System password' : 99999999,
		'Password for hardware' : 99999999,
		'Calendar (date and time)' : 99999999,
		'Day+Hour for Auto-Save' : 99999999,
		'Key to input' : 99999999,
		'Go to Window' : 99999999,
		'LCD Back-lit lights for number of seconds' : 99999999,
		'Times for beeper' : 99999999,
		'Pulse left for OCT' : 99999999,
		'Error code' : 99999999,
		'PT100 resistance of inlet' : 99999999,
		'PT100 resistanve of outlet' : 99999999,
		'Total travel time' : 99999999,
		'Delta travel time' : 99999999,
		'Upstream travel time' : 99999999,
		'Downstream travel time' : 99999999,
		'Output current' : 99999999,
		'Working step' : 99999999,
		'Signal Quality' : 99999999,
		'Upstream strength' : 99999999,
		'Downstream strength' : 99999999,
		'Language used in user interface' : 99999999,
		'The rate of the measurement travel time by the calculated travel time' : 99999999,
		'Reynolds number' : 99999999,
		'**** Data array***' : dataArray
	}
	return responseObject
}
// Combine two 16-bit values into a single 32-bit value.
let convertLong = (reg1, reg2) => {
	// Convert registry values to int and swap their order.
	let num1 = parseInt(reg2);
	let num2 = parseInt(reg1);
	// Modified to 16 bits long binary. Radix 2 is for binary.
	// 16 is minimum length and '0' is for zero padding.
	num1 = num1.toString(2).padStart(16, '0');
	num2 = num2.toString(2).padStart(16, '0');
	// Connect the binarys.
	let binary = num1 + num2;
	// Parse the the binary into int.
	value = parseInt(binary, 2);
	return num2;
}











app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});


// http://tuftuf.gambitlabs.fi/feed.txt


// Next:
// 1.	Write buildResponse function.
// 2.	Write helper function to modified data to human readable form.



// Bit conversions:

// LONG 32 bits (this should be -56)
// Decimal to binary (65480 and 65535)
// First reg					1111 1111 1100 1000 (2017 text file)
// Second reg					1111 1111 1111 1111
// Combined (2nd + 1st)			1111 1111 1111 1111 1111 1111 1100 1000 (2017 text file)
// convertLong for now			1111 1111 1111 1111 1111 1011 1011 0000 (2018 text file)
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
