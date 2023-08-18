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
		// Just for testing program with 2017 data
		dataArray[21] = 65480;
		dataArray[22] = 65535;
		dataArray[33] = 15568;
		dataArray[34] = 16611;
		dataArray[51] = 20690; // password
		dataArray[92] = 806;
		// Testing part ends
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
		return dataArray
	}

// Build the response for later use.
let	buildResponse = (dataArray) => {
	const responseObject = {
		'Time stamp' : dataArray[0],
		'Flowrate' : convertFloat(dataArray[1], dataArray[2]) + ' m3/h',
		'Energy Flow Rate' : convertFloat(dataArray[3], dataArray[4]) + ' GJ/h',
		'Velocity' : convertFloat(dataArray[5], dataArray[6]) + ' m/s',
		'Fluit sound speed' : convertFloat(dataArray[7], dataArray[8]) + ' m/s',
		'Positive accumulator' : convertLong(dataArray[9], dataArray[10]),
		'Positive decimal fractation' : convertFloat(dataArray[11], dataArray[12]),
		'Negative accumulator' : convertLong(dataArray[13], dataArray[14]),
		'Negative decimal fractation' : convertFloat(dataArray[15], dataArray[16]),
		'Positive energy accumulator' : convertLong(dataArray[17], dataArray[18]),
		'Positive energy decimal fractation' : convertFloat(dataArray[19], dataArray[20]),
		'Negative energy accumulator' : convertLong(dataArray[21], dataArray[22]),
		'Negative energy decimal fractation' : convertFloat(dataArray[23], dataArray[24]),
		'Net accumulator' : convertLong(dataArray[25], dataArray[26]),
		'Net decimal fractation' : convertFloat(dataArray[27], dataArray[28]),
		'Net energy accumulator' : convertLong(dataArray[29], dataArray[30]),
		'Net energy decimal fractation' : convertFloat(dataArray[31], dataArray[32]),
		'Temperature #1/inlet' : convertFloat(dataArray[33], dataArray[34]) + ' C',
		'Temperature #2/inlet' : convertFloat(dataArray[35], dataArray[36]) + ' C',
		'Analog input AI3' : convertFloat(dataArray[37], dataArray[38]),
		'Analog input AI4' : convertFloat(dataArray[39], dataArray[40]),
		'Analog input AI5' : convertFloat(dataArray[41], dataArray[42]),
		// Duplicates may result unexpected behavior --> added (a) to (c) to make difference.
		'Current input at AI3 (a)' : convertFloat(dataArray[43], dataArray[44]) + ' mA',
		'Current input at AI3 (b)' : convertFloat(dataArray[45], dataArray[46]) + ' mA',
		'Current input at AI3 (c)' : convertFloat(dataArray[47], dataArray[48]) + ' mA',
		//All good so far
		
		// BCD
		'System password' : convertBCD_2(dataArray[49], dataArray[50]),
		'Password for hardware' : convertBCD(dataArray[51]),
		'Calendar (date and time)' : 99999999,
		'Day+Hour for Auto-Save' : convertBCD(dataArray[56]) + 'H',
		
		
		'Key to input' : 99999999,
		'Go to Window' : 99999999,
		'LCD Back-lit lights for number of seconds' : 99999999,
		'Times for beeper' : 99999999,
		'Pulse left for OCT' : 99999999,
		// No need to protection.
		'Error code' : parseInt(dataArray[72]),

		'PT100 resistance of inlet' : convertFloat(dataArray[77], dataArray[78]) + ' Ohm',
		'PT100 resistanve of outlet' : convertFloat(dataArray[79], dataArray[80]) + ' Ohm',
		'Total travel time' : convertFloat(dataArray[81], dataArray[82]) + ' µs',
		'Delta travel time' : convertFloat(dataArray[83], dataArray[84]) + ' ns',
		'Upstream travel time' : convertFloat(dataArray[85], dataArray[86]) + ' µs',
		'Downstream travel time' : convertFloat(dataArray[87], dataArray[88]) + ' µs',
		'Output current' : convertFloat(dataArray[89], dataArray[90]) + ' mA',

		'Working step' : 99999999,
		'Signal Quality' : convertInt(dataArray[92]),
		'Upstream strength' : convertLimitedInt(dataArray[93]),
		'Downstream strength' : convertLimitedInt(dataArray[94]),
		// Not protected to keep possible add languages.
		'Language used in user interface' : parseInt(dataArray[96]),

		'The rate of the measurement travel time by the calculated travel time' : convertFloat(dataArray[97], dataArray[98]),
		'Reynolds number' : convertFloat(dataArray[99], dataArray[100]),
	}
	return responseObject
}

// Combine two 16-bit values into a single 32-bit value.
let	convertLong = (reg1, reg2) => {
	let value = (reg2 << 16) | reg1;
	return value
}

let	convertFloat = (reg1, reg2) => {
	let value = (reg2 << 16) | reg1;
	// Build dataview object for later use.
	const buffer = new ArrayBuffer(4);
	const dataView = new DataView(buffer);
	dataView.setUint32(0, value, false);
	// Use dataview object to get float value.
	const floatValue = dataView.getFloat32(0, false);
	return floatValue
}

let convertInt = (reg) => {
	let value = reg & 255
	// Protected against values which is not in the range (0-99).
	// Protection against negative values is handled by masking with 255.
	if (value > 99)
		return 'Invalid value. Value is out of range (0-99).'
	return value
}

// Using last 11 bits of the integer. That limit value to range 0-2047.
let convertLimitedInt = (reg) => {
	let value = reg & 2047
	return value
}


// Masks
	// 61 440		1111 0000 0000 0000
	// 3 840		0000 1111 0000 0000
	// 240			0000 0000 1111 0000
	// 15			0000 0000 0000 1111

let convertBCD = (reg) => {
	let value1 = (reg & 61440) >> 12;
	let value2 = (reg & 3840) >> 8;
	let value3 = (reg & 240) >> 4;
	let value4 = (reg & 15);
	const valueStr =	String(value1).padStart(2, '0') +
						String(value2).padStart(2, '0') +
						String(value3).padStart(2, '0') +
						String(value4).padStart(2, '0');
	return valueStr
}


let convertBCD_2 = (reg1, reg2) => {
	return convertBCD(reg2) + convertBCD(reg1)
}

let convertBCDcal = (reg1, reg2, reg3) => {
	let value1 = (reg3 & 61440) >> 12;
	let value2 = (reg3 & 3840) >> 8;
	let value3 = (reg3 & 240) >> 4;
	let value4 = (reg3 & 15);
	let value5 = (reg2 & 61440) >> 12;
	let value6 = (reg2 & 3840) >> 8;
	let value7 = (reg2 & 240) >> 4;
	let value8 = (reg2 & 15);
	let value9 = (reg1 & 61440) >> 12;
	let value10 = (reg2 & 3840) >> 8;
	let value11 = (reg3 & 240) >> 4;
	let value12 = (reg4 & 15);
	const calendar =	String(value1).padStart(2, '0') +
						String(value2).padStart(2, '0') +
						String(value3).padStart(2, '0') +
						String(value4).padStart(2, '0');

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
