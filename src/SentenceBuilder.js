
import { josa, getJosaPicker, makeJosaify } from 'josa';

import { Conjugator } from './Conjugator.js';

const PLACE_NOUNS = 'placeNouns';
const TIME_NOUNS = 'timeNouns';
const SUBJECT_ONLY_NOUNS = 'subjectOnlyNouns';
const NOUNS = 'nouns';
const PREPOSITIONS = 'prepositions';
const ADJECTIVES = 'adjectives';
const VERBS = 'verbs';
const PLACE_VERBS = 'placeVerbs';
const ADVERBS = 'adverbs';

export class SentenceBuilder {

  constructor(dictionary) {
    this.conjugator = new Conjugator();
    this.dictionary = dictionary;

    this.possibleSentenceStructures = this.getPossibleSentenceStructures();
    this.verbTenses = this.conjugator.getVerbTenses();
    this.adjectiveTenses = this.conjugator.getAdjectiveTenses();
    this.getDescriptiveAdj = this.conjugator.ㄴ은ifyAdjective;
  }

  getPossibleSentenceStructures = () => {
    const possible = [];

    // lessons 1-7
    possible.push(this.nounHasNoun);
    possible.push(this.nounIsPrepositionOtherNoun);
    possible.push(this.nounIsAdjective);
    possible.push(this.nounVerbs);
    possible.push(this.nounVerbsNoun);
    // lessons 8 and 9
    for (let i = 0; i < 2; ++i) {
      possible.push(this.nounVerbsAtPlace);
      possible.push(this.nounVerbsAtTime);
      possible.push(this.nounVerbsAdverbily);
      possible.push(this.nounIsNoun); // 이다
      possible.push(this.nounIsNotNoun); // 아니다
    }

    return possible;
  }

  chooseRandom = (arr) => { return arr[Math.floor(Math.random() * arr.length)]; }

  placeNoun = () => { return this.chooseRandom(this.dictionary.getVocab(PLACE_NOUNS)); }

  timeNoun = () => { return this.chooseRandom(this.dictionary.getVocab(TIME_NOUNS)); }

  subjectNoun = () => { return this.chooseRandom(this.dictionary.getVocab(SUBJECT_ONLY_NOUNS)); }

  subjectNounPlus = () => { return this.chooseRandom(this.dictionary.getVocab(NOUNS, SUBJECT_ONLY_NOUNS)); }

  noun = () => { return this.chooseRandom(this.dictionary.getVocab(NOUNS)); }

  preposition = () => { return this.chooseRandom(this.dictionary.getVocab(PREPOSITIONS)); }

  adjective = () => { return this.chooseRandom(this.dictionary.getVocab(ADJECTIVES)); }

  verb = () => { return this.chooseRandom(this.dictionary.getVocab(VERBS)); }

  placeVerb = () => { return this.chooseRandom(this.dictionary.getVocab(PLACE_VERBS)); }

  adverb = () => { return this.chooseRandom(this.dictionary.getVocab(ADVERBS)); }

  verbTense = () => { return this.chooseRandom(this.verbTenses); }

  adjectiveTense = () => { return this.chooseRandom(this.adjectiveTenses); }

  isPronoun = (noun) => {
    switch (noun) {
      case "오리":
      case "저":
      case "나":
      case "너":
      case "이것":
      case "그것":
      case "저것":
        return true;
      default:
        return false;
    }
  }
  possessNoun = (noun) => {
    //putting a descriptor in front of a pronoun sounds stupid
    if (this.isPronoun(noun[1])) {
      return noun;
    }

    const possessor = this.subjectNounPlus();
    const english = possessor[0] + "'s " + noun[0];

    let korean = possessor[1] + "의 ";
    //handle irregular possessive pronouns
    if (possessor[1] == "저")
      korean = "제 ";
    if (possessor[1] == "나")
      korean = "내 ";
    if (possessor[1] == "너")
      korean = "니 ";

    return [english, korean + noun[1]];
  }

  describeNoun = (noun) => {
    //putting a descriptor in front of a pronoun sounds stupid
    if (this.isPronoun(noun[1])) {
      return noun;
    }

    const adj = this.adjective();
    const english = adj[0] + " " + noun[0];
    const korean = this.getDescriptiveAdj(adj[1]) + " " + noun[1];
    return [english, korean];
  }

  도ifyNoun = (noun) => {
    const english = noun[0] + ", too,";
    const korean = noun[1] + "도";
    return [english, korean, true];
  }

  addParticle = (noun, particle) => {
    if (noun.length > 2) {
      return noun[1];
    } else {
      return `${noun[1]}#{${particle}}`;
    }
  }

  decorateNoun = (noun) => {
    const num = Math.floor(Math.random() * 20) + 1;
    switch (num) {
      case 1:
        return this.possessNoun(noun);
      case 2:
        return this.도ifyNoun(noun);
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return this.describeNoun(noun);
      default:
        return noun;
    }
  }

  nounHasNoun = () => {
    const subj = this.decorateNoun(this.subjectNounPlus());
    const obj = this.decorateNoun(this.noun());

    const tense = this.adjectiveTense();

    subj[1] = this.addParticle(subj, '는');
    obj[1] = this.addParticle(obj, '가');

    if (Math.random() * 3 < 1) {
      return {
        eng: `the ${subj[0]} doesn't have (a) ${obj[0]} (${tense[0]})`,
        kor: josa(`${subj[1]} ${obj[1]} ${tense[1]("없다")}`)
      }
    } else {
      return {
        eng: `the ${subj[0]} has (a) ${obj[0]} (${tense[0]})`,
        kor: josa(`${subj[1]} ${obj[1]} ${tense[1]("있다")}`)
      }
    }
  }

  nounIsPrepositionOtherNoun = () => {
    const subj = this.decorateNoun(this.subjectNounPlus());
    const other = this.noun();
    const preposition = this.preposition();
    const tense = this.adjectiveTense();

    subj[1] = this.addParticle(subj, '는');

    return {
      eng: `(the) ${subj[0]} is ${preposition[0]} (the) ${other[0]} (${tense[0]})`,
      kor: josa(`${subj[1]} ${other[1]}${preposition[1]}에 ${tense[1]("있다")}`)
    }
  }

  nounIsAdjective = () => {
    const subj = this.decorateNoun(this.subjectNounPlus());
    const adjective = this.adjective();
    const tense = this.adjectiveTense();

    if (adjective[1] == "많다") {
      subj[1] = this.addParticle(subj, '이');
    } else {
      subj[1] = this.addParticle(subj, '는');
    }
    return {
      eng: `(the) ${subj[0]} is ${adjective[0]} (${tense[0]})`,
      kor: josa(`${subj[1]} ${tense[1](adjective[1])}`)
    }
  }

  nounVerbs = () => {
    const subj = this.decorateNoun(this.subjectNounPlus());
    const verb = this.verb();
    const tense = this.verbTense();

    subj[1] = this.addParticle(subj, '는');
    return {
      eng: `(the) ${subj[0]} ${verb[0]} (${tense[0]})`,
      kor: josa(`${subj[1]} ${tense[1](verb[1])}`)
    }
  }

  nounVerbsNoun = () => {
    const subj = this.decorateNoun(this.subjectNounPlus());
    const verb = this.verb();
    const obj = this.decorateNoun(this.noun());
    const tense = this.verbTense();

    subj[1] = this.addParticle(subj, '는');
    obj[1] = this.addParticle(obj, '를');
    return {
      eng: `(the) ${subj[0]} ${verb[0]} the ${obj[0]} (${tense[0]})`,
      kor: josa(`${subj[1]} ${obj[1]} ${tense[1](verb[1])}`)
    }
  }

  nounVerbsAtPlace = () => {
    const subj = this.decorateNoun(this.subjectNounPlus());
    const place = this.placeNoun();

    let verb, tense;
    const num = Math.floor(Math.random() * 3);
    if (num > 2) {
      verb = this.placeVerb();
      tense = this.verbTense();
    } else if (num > 1) {
      verb = ["is not at", "없다"];
      tense = this.adjectiveTense();
    } else {
      verb = ["is at", "있다"];
      tense = this.adjectiveTense();
    }

    subj[1] = this.addParticle(subj, '는');
    return {
      eng: `(the) ${subj[0]} ${verb[0]} (the) ${place[0]} (${tense[0]})`,
      kor: josa(`${subj[1]} ${place[1]}에 ${tense[1](verb[1])}`)
    }
  }

  nounVerbsAtTime = () => {
    const subj = this.decorateNoun(this.subjectNounPlus());
    const time = this.timeNoun();
    const verb = this.verb();
    const tense = this.verbTense();

    subj[1] = this.addParticle(subj, '는');
    return {
      eng: `(the) ${subj[0]} ${verb[0]} (at/on/in the) ${time[0]} (${tense[0]})`,
      kor: josa(`${subj[1]} ${time[1]}에 ${tense[1](verb[1])}`)
    }
  }

  nounVerbsAdverbily = () => {
    const subj = this.decorateNoun(this.subjectNounPlus());
    const verb = this.verb();
    const adverb = this.adverb();
    const tense = this.verbTense();

    subj[1] = this.addParticle(subj, '는');
    return {
      eng: `(the) ${subj[0]} ${verb[0]} ${adverb[0]} (${tense[0]})`,
      kor: josa(`${subj[1]} ${adverb[1]} ${tense[1](verb[1])}`)
    }
  }

  nounIsNoun = () => {
    const thingA = this.decorateNoun(this.subjectNounPlus());
    const thingB = this.noun();
    const tense = this.chooseRandom(['past', 'present']);
    const level = this.chooseRandom(this.conjugator.LEVELS);

    thingA[1] = this.addParticle(thingA, '는');
    thingB[1] = this.conjugator.append이다(thingB[1], tense, level);
    return {
      eng: `(the) ${thingA[0]} is (a) ${thingB[0]} (${tense} ${level})`,
      kor: josa(`${thingA[1]} ${thingB[1]}`)
    }
  }

  nounIsNotNoun = () => {
    const thingA = this.decorateNoun(this.subjectNounPlus());
    const thingB = this.noun();
    const tense = this.chooseRandom(['past', 'present']);
    const level = this.chooseRandom(this.conjugator.LEVELS);

    thingA[1] = this.addParticle(thingA, '는');
    thingB[1] = this.addParticle(thingB, '이');
    return {
      eng: `(the) ${thingA[0]} is not (a) ${thingB[0]} (${tense} ${level})`,
      kor: josa(`${thingA[1]} ${thingB[1]} ${this.conjugator.conjugate아니다(tense, level)}`)
    }
  }

  nounVerbsAtTime = () => {
    return {
      eng: 'not implemented yet',
      kor: '안 끝내다'
    }

  }



  makeSentence = () => {
    const func = this.chooseRandom(this.possibleSentenceStructures);
    return func();
  }

  makeConjugation = () => {
    const verbs = this.dictionary.getVocab(VERBS);
    const adjectives = this.dictionary.getVocab(ADJECTIVES);
    const random = Math.random() * (verbs.length + adjectives.length);
    let word, tense;
    if (random < verbs.length) {
      word = this.chooseRandom(verbs);
      tense = this.verbTense();
    } else {
      word = this.chooseRandom(adjectives);
      tense = this.adjectiveTense();
    }
    return {
      eng: `${word[0]} (${tense[0]})`,
      kor: tense[1](word[1])
    }
  }

  makeVocabWord = () => {
    const words = this.dictionary.getVocab(
      PLACE_NOUNS,
      TIME_NOUNS,
      SUBJECT_ONLY_NOUNS,
      NOUNS,
      PREPOSITIONS,
      ADJECTIVES,
      VERBS,
      PLACE_VERBS,
      ADVERBS
    );
    const word = this.chooseRandom(words);
    return {
      eng: word[0],
      kor: word[1]
    }
  }



}