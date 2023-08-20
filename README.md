# Gambit Challenge

This is my solution to [Gambit Challenge](https://github.com/gambit-labs/challenge) by [Atea](https://www.atea.fi/).

I chose option 1 to create an REST API that parses the data from [live text feed](http://tuftuf.gambitlabs.fi/feed.txt) to a readable form.
Check the more detailed information from the link above.


## The Application

The application makes GET API call from [live text feed](http://tuftuf.gambitlabs.fi/feed.txt) given on the assignment,
creates a data array based on the response, and builds a response object using the data array.
After that, the application sent a response in JSON format.

<details>
<summary>Click here to see the code.</summary>
	
```javascript
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
```
</details>


### Build Array

This function takes the response data in as a parameter and builds a data array for later use. Data arrays index 0 is for the time stamp,
which comes from the first line of the response data.

After that function reads lines of the response data and saves the value to the index
given as the first parameter of the line. That makes it possible to read the array using registries as index numbers even 
if the input data doesn't include all the numbers on the range.

<details>
<summary>Click here to see the code.</summary>
	
```javascript
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
```
</details>


### Build Response

This function builds the response object in JSON format. The function has a JSON schema written on it and it uses helper functions to convert values
to a human-readable form. The values include units of them if there is one. It would also be justifiable to use only raw values to make it
easier to edit for the next user, but I ended up using units because the task was to parse the data to readable form. So now many values are in
string format, which isn't the most sophisticated way.

<details>
<summary>Click here to see the code.</summary>
	
```javascript
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
```
</details>


### Convert Long

This function combines two 16-bit values, the lower byte first, into a single 32-bit value using bitwise operations shift (<<) and OR (|).

<details>
<summary>Click here to see the code.</summary>
	
```javascript
let	convertLong = (reg1, reg2) => {
	return (reg2 << 16) | reg1
}
```
</details>


### Convert Float (REAL4)

This function combines two 16-bit values just like convertLong and then gets a float value from created 32-bit binary.
The function builds and uses a 32-bit data view object to get the float value.

<details>
<summary>Click here to see the code.</summary>
	
```javascript
let	convertFloat = (reg1, reg2) => {
	let value = (reg2 << 16) | reg1;
	const buffer = new ArrayBuffer(4);
	const dataView = new DataView(buffer);
	dataView.setUint32(0, value, false);
	const floatValue = dataView.getFloat32(0, false);
	return floatValue
}
```
</details>


### Convert INT

I am not sure how I should deal with integers, but here is how I did it.
I start by dividing them into five different types, which can be seen in the table below.

| Type | Regs | Function | Limit by bits (bitmask) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Writable | 59, 60, 61 | - | - | |
| Max. 255 | 62 | convertLimitedInt | 8-bits | Two values in the same bytes. |
| Max. 65 535 | 62 | convertLimitedInt | 16-bits | Two values in the same bytes. |
| Range 0-99 | 92 | convertInt99 | No exact amount of bits. | Two values in one reg, but different bytes. |
| Range 0-2047 | 93, 94 | convertLimitedInt | 11-bits | |

- For `Writable`s I used directly the original value.
- For `Max. 255`, `Max. 65 535`, and `Range 0-2047` I used as many bits on the right as needed to reach the maximum.
  - This was possible because every value can be used as a bitmask.
    - For example 255 = `0000 0000 1111 1111`.
  - `convertLimitedInt` takes the register value and the maximum value of range (limit) as parameters so all of these types of integers can be handled by the same function. 
- For `Range 0-99` I created the function `convertInt99` which also takes a significant byte as a parameter.
  - 1 is for the first byte (first 8 bits)
  - 2 is for the second byte (last 8 bits).
  - The function uses either the first or the second byte and checks that the value is on the range.
- It is also notable that two different variables use the same register 62. I ended up just using the same register value for both without better information.

<details>
<summary>Click here to see the code of convertLimitedInt.</summary>
	
```javascript
let convertLimitedInt = (reg, limit) => {
	return reg & limit
}
```
</details>

<details>
<summary>Click here to see the code of convertInt99.</summary>
	
```javascript
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
```
</details>


### Convert BCD

BCD stands for Binary-Coded Decimal. Each decimal digit is represented by a 4-bit binary code.

I use bit masking and shifting to build the decimal digits as strings and combine the strings at the end. I left the decimal numbers in string format to avoid losing zeroes beginning of the digits.

It is also notable that conversions aren't protected against double digits (10-15 are possible in 4-bit binary).

Bit masks:
```
61 440        1111 0000 0000 0000
 3 840        0000 1111 0000 0000
   240        0000 0000 1111 0000
    15        0000 0000 0000 1111
```

What comes to Calendar(reg 0053-0055), TUF-2000 User Manual says `6 Bytes of BCD stands SMHDMY，lower byte first` but I ended up changing it in reverse order to get the correct date.

<details>
<summary>Click here to see the code of convertBCD.</summary>
	
```javascript
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
```
</details>

<details>
<summary>Click here to see the code of convertBCD_2.</summary>
	
```javascript
let convertBCD_2 = (reg1, reg2) => {
	return convertBCD(reg2) + convertBCD(reg1)
}
```
</details>

<details>
<summary>Click here to see the code of convertBCDcal.</summary>
	
```javascript
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
```
</details>
