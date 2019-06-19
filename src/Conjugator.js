import * as hangul from 'hangul-js';

export class Conjugator {


	makeAdjectiveDescriptive = (adj) => {
		if (adj.slice(-2) === "있다") {
			return this.kor_stripLast(adj) + "는";
		}

		let isVerb = false;
		let stem = this.kor_stripLast(adj);
		if (this.kor_getClosingConsonant(stem) === "ㅂ" && !this.kor_isㅂexception(adj)) {
			stem = this.kor_replaceFinalConsonant(stem, "우");
		}
		if (this.kor_getClosingConsonant(stem) === "ㅅ" && !this.kor_isㅅexception(adj)) {
			stem = this.kor_replaceFinalConsonant(stem, "");
			return stem + "은";
		}

		return this.kor_addVC(stem, "ㄴ", "은", isVerb);
	}

	getVerbTenses = () => {
		let isVerb = true;
		return [
			["plain past", (verb) => {
				return this.kor_append어아principle(this.kor_stripLast(verb), "ㅆ다", isVerb);
			}],
			["plain present", (verb) => {
				return this.kor_addVC(this.kor_stripLast(verb), "ㄴ다", "는다", isVerb);
			}],
			["plain future", (verb) => {
				return this.kor_stripLast(verb) + "겠다";
			}],
			["formal polite past", (verb) => {
				return this.kor_append어아principle(this.kor_stripLast(verb), "ㅆ습니다", isVerb);
			}],
			["formal polite present", (verb) => {
				return this.kor_addVC(this.kor_stripLast(verb), "ㅂ니다", "습니다", isVerb);
			}],
			["formal polite future", (verb) => {
				return this.kor_stripLast(verb) + "겠습니다";
			}],
			["informal polite past", (verb) => {
				return this.kor_append어아principle(this.kor_stripLast(verb), "ㅆ어요", isVerb);
			}],
			["informal polite present", (verb) => {
				return this.kor_append어아principle(this.kor_stripLast(verb), "요", isVerb);
			}],
			["informal polite future", (verb) => {
				return this.kor_stripLast(verb) + "겠어요";
			}]
		];
	}

	getAdjectiveTenses = () => {
		let isVerb = false;
		return [
			["plain past", (adj) => {
				return this.kor_append어아principle(this.kor_stripLast(adj), "ㅆ다", isVerb);
			}],
			["plain present", (adj) => {
				return adj;
			}],
			["plain future", (adj) => {
				return this.kor_stripLast(adj) + "겠다";
			}],
			["formal polite past", (adj) => {
				return this.kor_append어아principle(this.kor_stripLast(adj), "ㅆ습니다", isVerb);
			}],
			["formal polite present", (adj) => {
				return this.kor_addVC(this.kor_stripLast(adj), "ㅂ니다", "습니다", isVerb);
			}],
			["formal polite future", (adj) => {
				return this.kor_stripLast(adj) + "겠습니다";
			}],
			["informal polite past", (adj) => {
				return this.kor_append어아principle(this.kor_stripLast(adj), "ㅆ어요", isVerb);
			}],
			["informal polite present", (adj) => {
				return this.kor_append어아principle(this.kor_stripLast(adj), "요", isVerb);
			}],
			["informal polite future", (adj) => {
				return this.kor_stripLast(adj) + "겠어요";
			}]
		];
	}

	kor_concat = (...items) => {
		let letters = [];
		for (let i = 0; i < items.length; i++) {
			letters = letters.concat(hangul.d(items[i]));
		}
		return hangul.a(letters);
	}

	kor_isㅅexception = (word) => {
		return word === "웃다" || word === "벗다" || word === "씻다";
	}

	kor_verbIsㄷexception = (word) => {
		return word === "받다" || word === "묻다" || word === "닫다";
	}

	kor_isㅂexception = (word) => {
		return word === "좁다" || word === "입다" || word === "씹다" || word === "잡다" || word === "넓다";
	}

	kor_is르exception = (word) => {
		return word === "따르다";
	}

	kor_isㅂ오exception = (word) => {
		return word === "돕다" || word === "곱다";
	}

	kor_replaceFinalConsonant = (stem, newEnding) => {
		let letters = hangul.d(stem);
		//pull consonants off the end until we get to a vowel, and then stop
		while (hangul.isConsonant(letters[letters.length - 1])) {
			letters = letters.slice(0, -1);
		}
		return hangul.a(letters.concat(hangul.d(newEnding)));
	}

	//verbs/adjectives must remove 다 before calling this
	//handles the ㄹ irregular but not the ㅂ irregular
	kor_addVC = (word, vEnding, cEnding) => {
		//handle ㄹ irregular
		if (this.kor_getClosingConsonant(word) === "ㄹ" && !this.kor_isㅂexception(word + "다")) {
			word = this.kor_replaceFinalConsonant(word, "");
		}

		if (hangul.endsWithConsonant(this.kor_getLast(word))) {
			return this.kor_concat(word, cEnding);
		} else {
			return this.kor_concat(word, vEnding);
		}
	}

	//verbs/adjectives must remove 다 before calling this
	kor_append어아principle = (word, principle, isVerb) => {
		//special 하 case
		if (this.kor_getLast(word) === "하") {
			return this.kor_concat(this.kor_stripLast(word), "해", principle);
		}

		//special 르 case
		if (this.kor_getLast(word) === "르" && !this.kor_is르exception(word + "다")) {
			let stem = this.kor_concat(this.kor_stripLast(word), "ㄹ");
			if (this.kor_is와(word)) {
				return this.kor_concat(stem, "라", principle);
			} else {
				return this.kor_concat(stem, "러", principle);
			}
		}

		//first handle consonant irregulars that can cause mergers
		switch (this.kor_getClosingConsonant(word)) {
			case "ㄷ":
				if (isVerb && !this.kor_verbIsㄷexception(word + "다")) {
					word = this.kor_replaceFinalConsonant(word, "ㄹ");
				}
				break;
			case "ㅂ":
				if (!this.kor_isㅂexception(word + "다")) {
					let ending = "우";
					if (this.kor_isㅂ오exception(word + "다"))
						ending = "오";
					word = this.kor_replaceFinalConsonant(word, ending);
					break;
				}
			default:
				break;
		}

		//handle cases where it ends with consonant
		if (hangul.endsWithConsonant(this.kor_getLast(word))) {

			//deal with all the consonant irregulars that don't result in merges
			switch (this.kor_getClosingConsonant(word)) {
				case "ㅅ":
					if (!isVerb || !this.kor_isㅅexception(word + "다")) {
						word = this.kor_replaceFinalConsonant(word, "");
					}
					break;
			}

			//choose betwen 어/아 for the middle bit   
			let middle = "어";
			if (this.kor_is와(word)) {
				middle = "아";
			}

			return this.kor_concat(word, middle, principle);
		}

		//ends with a vowel, so we need to handle potential mergers
		let letters = hangul.d(word);
		//get the full vowel to check conjugation though
		let fullVowel = this.kor_getFullVowel(this.kor_getLast(word));
		switch (fullVowel) {
			case "ㅏ": //would be adding a duplicate, so leave it alone
			case "ㅑ":
				break;
			case "ㅗ":
				letters.push("ㅏ");
				break;
			case "ㅜ":
				letters.push("ㅓ");
				break;
			case "ㅣ":
				letters[letters.length - 1] = "ㅕ";
				break;
			case "ㅓ": //would be adding a duplicate, leave it alone
			case "ㅕ":
				break;
			case "ㅡ":
				if (this.kor_is와(word)) {
					letters[letters.length - 1] = "ㅏ";
				}
				else {
					letters[letters.length - 1] = "ㅓ";
				}
				break;
			default:
				//for anything else, just add 어 so it doesn't merge
				letters.push("ㅇ");
				letters.push("ㅓ");
				break;
		}
		return hangul.a(letters.concat(hangul.d(principle)));

	}

	//returns the specified word with the last syllable removed
	kor_stripLast = (word) => {
		if (word.length >= 1)
			return word.slice(0, -1);
		else
			return "";
	}

	//returns the last syllable of the specified word
	kor_getLast = (word) => {
		if (word.length >= 1)
			return word[word.length - 1];
		else
			return "";
	}

	//returns a one or two letter character of a syllable's vowel
	kor_getFullVowel = (c) => {
		let letters = hangul.d(c);
		let vowelBits = [];
		letters.forEach((letter) => {
			if (hangul.isVowel(letter)) {
				vowelBits.push(letter);
			}
		});
		return hangul.a(vowelBits);
	}

	//returns a one or two letter character of a syllable's closing consonant
	kor_getClosingConsonant = (c) => {
		let letters = hangul.d(c);
		let consonant = [];
		for (let i = letters.length - 1; i >= 0; --i) {
			if (hangul.isConsonant(letters[i])) {
				consonant.unshift(letters[i])
			}
			if (hangul.isVowel(letters[i])) {
				break;
			}
		}
		return hangul.a(consonant);
	}

	kor_is와 = (word) => {
		//다 has already been removed for us, so check verb/adj exceptions against their stems
		if (word === "만들") {
			return false;
		}
		let lastVowel = this.kor_getFullVowel(this.kor_getLast(word));
		if (lastVowel === "ㅡ") {
			//if there's only one syllable and the vowel is ㅡ, it's not 와
			if (word.length === 1) {
				return false;
			} else { //recursively search the rest of the word
				return this.kor_is와(this.kor_stripLast(word));
			}
		}
		let vowelBits = hangul.d(lastVowel);
		return vowelBits.includes("ㅗ") || vowelBits.includes("ㅏ") || vowelBits.includes("ㅛ") || vowelBits.includes("ㅑ");
	}

}