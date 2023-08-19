# Gambit Challenge

This is my solution to [Gambit Challenge](https://github.com/gambit-labs/challenge) by [Atea](https://www.atea.fi/).

I chose option 1 to create an REST API that parses the data from [live text feed](http://tuftuf.gambitlabs.fi/feed.txt) to a readable form.
Check the more detailed information link above.


## The Program


### The Application

The application makes GET API call from [live text feed](http://tuftuf.gambitlabs.fi/feed.txt) given on the assignment,
creates a data array based on the response, and builds a response object using the data array.
After that, the application sent a response in JSON format.

<details>
<summary>Click here to see the code.</summary>
	
```javascript
// add code here
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
// add code here
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
// add code here
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
