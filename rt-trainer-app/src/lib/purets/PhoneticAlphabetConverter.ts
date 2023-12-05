// Function to convert text to NATO phonetic alphabet
export function convertToNATO(text:string) {
	const natoAlphabet = {
		A: 'Alpha',
		B: 'Bravo',
		C: 'Charlie',
		D: 'Delta',
		E: 'Echo',
		F: 'Foxtrot',
		G: 'Golf',
		H: 'Hotel',
		I: 'India',
		J: 'Juliet',
		K: 'Kilo',
		L: 'Lima',
		M: 'Mike',
		N: 'November',
		O: 'Oscar',
		P: 'Papa',
		Q: 'Quebec',
		R: 'Romeo',
		S: 'Sierra',
		T: 'Tango',
		U: 'Uniform',
		V: 'Victor',
		W: 'Whiskey',
		X: 'X-ray',
		Y: 'Yankee',
		Z: 'Zulu'
	};

	const natoNumbers = {
		'0': 'Zero',
		'1': 'One',
		'2': 'Two',
		'3': 'Three',
		'4': 'Four',
		'5': 'Five',
		'6': 'Six',
		'7': 'Seven',
		'8': 'Eight',
		'9': 'Niner'
	};

	const upperText = text.toUpperCase();

	let result = '';
	for (let i = 0; i < upperText.length; i++) {
		const char = upperText[i];

		if (/[A-Z]/.test(char)) {
			const natoWord = natoAlphabet[char];
			result += natoWord + ' ';
		} else if (/[0-9]/.test(char)) {
			const natoNumber = natoNumbers[char];
			result += natoNumber + ' ';
		} else {
			result += char + ' ';
		}
	}

	return result.trim();
}
