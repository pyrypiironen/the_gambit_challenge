const express = require('express');
const app = express();
const axios = require('axios');

const PORT = process.env.PORT || 8080;
const IP_ADDRESS = '0.0.0.0';

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

let buildArray = (response) => {
	const lines = response.data.split("\n");
	const dataArray = [];
		dataArray[0] = lines[0];
		for (let i = 1; i < lines.length; i++) {
			const parts = lines[i].split(':')
			dataArray[parts[0]] = parts[1];
		}
		return dataArray
	}

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
		'Current input at AI3 (a)' : convertFloat(dataArray[43], dataArray[44]) + ' mA',
		'Current input at AI3 (b)' : convertFloat(dataArray[45], dataArray[46]) + ' mA',
		'Current input at AI3 (c)' : convertFloat(dataArray[47], dataArray[48]) + ' mA',
		'System password' : convertBCD_2(dataArray[49], dataArray[50]),
		'Password for hardware' : convertBCD(dataArray[51]),
		'Calendar (date and time)' : convertBCDcal(dataArray[53], dataArray[54], dataArray[55]),
		'Day+Hour for Auto-Save' : convertBCD(dataArray[56]) + 'H',
		'Key to input' : dataArray[59],
		'Go to Window' : dataArray[60],
		'LCD Back-lit lights for number of seconds' : dataArray[61] + ' s',
		'Times for beeper' : convertLimitedInt(dataArray[62], 255),
		'Pulse left for OCT' : convertLimitedInt(dataArray[62], 65535),
		'Error code' : parseInt(dataArray[72]),
		'PT100 resistance of inlet' : convertFloat(dataArray[77], dataArray[78]) + ' Ohm',
		'PT100 resistanve of outlet' : convertFloat(dataArray[79], dataArray[80]) + ' Ohm',
		'Total travel time' : convertFloat(dataArray[81], dataArray[82]) + ' µs',
		'Delta travel time' : convertFloat(dataArray[83], dataArray[84]) + ' ns',
		'Upstream travel time' : convertFloat(dataArray[85], dataArray[86]) + ' µs',
		'Downstream travel time' : convertFloat(dataArray[87], dataArray[88]) + ' µs',
		'Output current' : convertFloat(dataArray[89], dataArray[90]) + ' mA',
		'Working step' : convertInt99(dataArray[92], 1),
		'Signal Quality' : convertInt99(dataArray[92], 2),
		'Upstream strength' : convertLimitedInt(dataArray[93], 2047),
		'Downstream strength' : convertLimitedInt(dataArray[94], 2047),
		'Language used in user interface' : setLanguage(dataArray[96]),
		'The rate of the measurement travel time by the calculated travel time' : convertFloat(dataArray[97], dataArray[98]),
		'Reynolds number' : convertFloat(dataArray[99], dataArray[100]),
	}
	return responseObject
}

let	convertLong = (reg1, reg2) => {
	return (reg2 << 16) | reg1
}

let	convertFloat = (reg1, reg2) => {
	let value = (reg2 << 16) | reg1;
	const buffer = new ArrayBuffer(4);
	const dataView = new DataView(buffer);
	dataView.setUint32(0, value, false);
	const floatValue = dataView.getFloat32(0, false);
	return floatValue
}

let convertInt99 = (reg, byte) => {
	if (byte == 1)
		reg = (reg & 65280) >> 8
	else if (byte == 2)
		reg = reg & 255
	else
		return 'Invalid use of convertInt99.'
	if (reg > 99)
		return 'Invalid value. Value is out of range (0-99).'
	return reg
}

let convertLimitedInt = (reg, limit) => {
	return reg & limit
}

let convertBCD = (reg) => {
	let value1 = (reg & 61440) >> 12;
	let value2 = (reg & 3840) >> 8;
	let value3 = (reg & 240) >> 4;
	let value4 = (reg & 15);
	const valueStr =	String(value1) +
						String(value2) +
						String(value3) +
						String(value4);
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
	let value10 = (reg1 & 3840) >> 8;
	let value11 = (reg1 & 240) >> 4;
	let value12 = (reg1 & 15);
	const calendar =	'20' +
						String(value1) +
						String(value2) +
						'-' +
						String(value3) +
						String(value4) +
						'-' +
						String(value5) +
						String(value6) +
						' ' +
						String(value7) +
						String(value8) +
						':' +
						String(value9) +
						String(value10) +
						':' +
						String(value11) +
						String(value12);
	return calendar
}

let setLanguage = (reg) => {
	if (reg == 0)
		return 'English'
	if (reg == 1)
		return 'Chinese'
	return 'The language is not recognized.'
}

app.listen(PORT, IP_ADDRESS, () => {
  console.log('Server is running on port 8080');
});
