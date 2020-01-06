import * as hangul from 'hangul-js';

export class Conjugator {

  LEVELS = [
    // '하소서체', //하나이다 archaic highest form used to address kings and queens or God
    '합쇼체', //합니다 most common polite form
    // '하요체', //하오 archaic formal neutral, sometimes used on internet
    // '하게체', //하네 archaic formal netural, used by old people mostly
    '해라체', //한다 plain form, used in writing or quoting
    '해요체', //해요 informal polite
    '해체', //해/해여 least polite and formal
  ];

  DEFAULT_LEVEL = '해라체';

  TENSES = [
    'past',
    'present',
    'future (겠다)',
    'future (을 거야)'
  ];

  DEFAULT_TENSE = 'present';

  TYPES = [
    'verb',
    'adjective'
  ];

  DEFAULT_TYPE = 'verb';

  CONSTRUCTIONS = [
    ['ㄴ/은ify adjective', this.ㄴ은ifyAdjective]
  ];

  conjugate아니다 = (tense, level) => {
    if (tense !== 'past' && tense !== 'present') {
      return "I can't conjugate that one"
    }
    const endings = {
      'present': {
        '합쇼체': '아닙니다',
        '해라체': '아니다',
        '해요체': '아니에요',
        '해체': '아니야'
      },
      'past': {
        '합쇼체': '아니었습니다',
        '해라체': '아니었다',
        '해요체': '아니었어요',
        '해체': '아니었어'
      }
    }
    return endings[tense][level];
  }

  append이다 = (word, tense, level) => {
    if (tense !== 'past' && tense !== 'present') {
      return "I can't conjugate that one"
    }
    const endsVowel = !hangul.endsWithConsonant(this.kor_getLast(word));
    const endings = {
      'present': {
        '합쇼체': '입니다',
        '해라체': endsVowel ? '다' : '이다',
        '해요체': endsVowel ? '예요' : '이에요',
        '해체': endsVowel ? '야' : '이야',
      },
      'past': {
        '합쇼체': endsVowel ? '였습니다' : '이었습니다',
        '해라체': endsVowel ? '였다' : '이었다',
        '해요체': endsVowel ? '였어요' : '이었어요',
        '해체': endsVowel ? '였어' : '이었어'
      }
    }
    return `${word}${endings[tense][level]}`
  }

  conjugate = (word, tense, level, type) => {
    if (word === '이다' || word === '아니다' || word.slice(-1) !== '다') {
      return "I can't conjugate that one";
    }

    if (tense === 'past') {
      const pastPrinciples = {
        '합쇼체': 'ㅆ습니다',
        '해라체': 'ㅆ다',
        '해요체': 'ㅆ어요',
        '해체': 'ㅆ어'
      }
      return this.kor_append어아principle(this.kor_stripLast(word), pastPrinciples[level], type);
    }
    else if (tense === 'present') {
      switch (level) {
        case '합쇼체':
          return this.kor_addVC(this.kor_stripLast(word), "ㅂ니다", "습니다", type);
        case '해라체':
          if (type === 'verb') {
            return this.kor_addVC(this.kor_stripLast(word), "ㄴ다", "는다", type);
          } else {
            return word;
          }
        case '해요체':
        case '해체':
          return this.kor_append어아principle(this.kor_stripLast(word), level === '해요체' ? '요' : '', type);
        default:
          return word;
      }
    }
    else if (tense === 'future (겠다)') {
      const 겠다Principles = {
        '합쇼체': '겠습니다',
        '해라체': '겠다',
        '해요체': '겠어요',
        '해체': '겠어'
      }
      return this.kor_stripLast(word) + 겠다Principles[level];
    }
    else if (tense === 'future (을 거야)') {
      const verb = this.kor_addVC(this.kor_stripLast(word), 'ㄹ', '을', type);
      const 이다Principles = {
        '합쇼체': '것입니다',
        '해라체': '것이다',
        '해요체': '거예요',
        '해체': '거야'
      }
      return `${verb} ${이다Principles[level]}`
    }
  }

  buildConjugator = (tense, level, type) => {
    return [`${tense} ${level}`, (rawWord) => {
      const word = rawWord.trim();
      return this.conjugate(word, tense, level, type);
    }];
  }

  getVerbTenses = () => {
    const verbTenses = [];
    this.TENSES.forEach((tense) => {
      this.LEVELS.forEach((level) => {
        verbTenses.push(this.buildConjugator(tense, level, 'verb'));
      });
    });
    return verbTenses;
  }

  getAdjectiveTenses = () => {
    const adjTenses = [];
    this.TENSES.forEach((tense) => {
      this.LEVELS.forEach((level) => {
        adjTenses.push(this.buildConjugator(tense, level, 'adjective'));
      });
    });
    return adjTenses;
  }

  ㄴ은ifyAdjective = (adj) => {
    if (adj.slice(-2) === "있다") {
      return this.kor_stripLast(adj) + "는";
    }

    let stem = this.kor_stripLast(adj);
    if (this.kor_getClosingConsonant(stem) === "ㅂ" && !this.kor_isㅂexception(adj)) {
      stem = this.kor_replaceFinalConsonant(stem, "우");
    }
    if (this.kor_getClosingConsonant(stem) === "ㅅ" && !this.kor_isㅅexception(adj)) {
      stem = this.kor_replaceFinalConsonant(stem, "");
      return stem + "은";
    }

    return this.kor_addVC(stem, "ㄴ", "은", 'adjective');
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
  //handles the ㄹ irregular and ㅂ irregular depending on the ending
  kor_addVC = (word, vEnding, cEnding, type) => {
    if (vEnding.slice(0, 1) === 'ㄹ' && cEnding.slice(0, 1) === '을') {
      switch (this.kor_getClosingConsonant(word)) {
        case 'ㅅ':
          word = this.kor_replaceFinalConsonant(word, "");
          return this.kor_concat(word, '을');
        case "ㄷ":
          word = this.kor_replaceFinalConsonant(word, "ㄹ");
          return this.kor_concat(word, '을');
        case 'ㅂ':
          word = this.kor_replaceFinalConsonant(word, '우');
          break;

      }
    }
    if (type === 'verb' || type === 'adjective') {
      //handle ㄹ irregular
      if (this.kor_getClosingConsonant(word) === "ㄹ") {
        word = this.kor_replaceFinalConsonant(word, "");
      }
    }

    if (hangul.endsWithConsonant(this.kor_getLast(word))) {
      return this.kor_concat(word, cEnding);
    } else {
      return this.kor_concat(word, vEnding);
    }
  }

  //verbs/adjectives must remove 다 before calling this
  kor_append어아principle = (word, principle, type) => {
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
        if (type === 'verb' && !this.kor_verbIsㄷexception(word + "다")) {
          word = this.kor_replaceFinalConsonant(word, "ㄹ");
        }
        break;
      case "ㅂ":
        if (!this.kor_isㅂexception(word + "다")) {
          let ending = "우";
          if (this.kor_isㅂ오exception(word + "다"))
            ending = "오";
          word = this.kor_replaceFinalConsonant(word, ending);
        }
        break;
      default:
        break;
    }

    //handle cases where it ends with consonant
    if (hangul.endsWithConsonant(this.kor_getLast(word))) {

      //deal with all the consonant irregulars that don't result in merges
      switch (this.kor_getClosingConsonant(word)) {
        case "ㅅ":
          if (type === 'adjective' || !this.kor_isㅅexception(word + "다")) {
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