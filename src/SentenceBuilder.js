import * as vocab from './vocab.json';
import { josa, getJosaPicker, makeJosaify } from 'josa';
import * as hangul from 'hangul-js';

import { Conjugator } from './Conjugator.js';

export class SentenceBuilder {

  constructor() {
    let conjugator = new Conjugator();
    
    this.possibleSentenceStructures = this.getPossibleSentenceStructures();
    this.verbTenses = conjugator.getVerbTenses();
    this.adjectiveTenses = conjugator.getAdjectiveTenses();
    this.getDescriptiveAdj = conjugator.makeAdjectiveDescriptive;
    this.isPronoun = {
      "오리": true,
      "저": true,
      "나": true,
      "너": true,
      "이것": true,
      "그것": true,
      "저것": true,
    }
  }

  findWord = (searchTerm) => {
    if (searchTerm.length === 0) {
      return [];
    }
    searchTerm = searchTerm.toLowerCase();
    let results = [];
    let searchArray = (tuple) => {
      let engWord = tuple[0].toLowerCase();
      if (engWord.includes(searchTerm) || searchTerm.includes(engWord)) {
        results.push(`${tuple[1]} (${tuple[0]})`);
      }
      let korWord = tuple[1];
      if (korWord.includes(searchTerm) || searchTerm.includes(korWord)) {
        results.push(`${tuple[0]} (${tuple[1]})`);
      }
    };

    Object.keys(vocab).forEach(key => {
      if (key != "default") {
        vocab[key].forEach(searchArray);
      }
    });    

    return results;
  }

  conjugateAdjective = (adj) => {
    console.log("Adjective");
    console.log(adj);
    console.log("descriptive adjective Form:" + this.getDescriptiveAdj(adj));
    this.adjectiveTenses.forEach((tense) => {
      console.log(tense[0] + ": " + tense[1](adj));
    });
  }

  conjugateVerb = (verb) => {
    console.log("Verb");
    console.log(verb);
    this.verbTenses.forEach((tense) => {
      console.log(tense[0] + ": " + tense[1](verb));
    });
  }

  getPossibleSentenceStructures = () => {
    let possible = []

    for (let i = 0; i < 2; ++i) {
      possible.push(this.phrase);
    }
    for (let i = 0; i < 4; ++i) {
      possible.push(this.nounHasNoun);
      possible.push(this.nounVerbPlace);
      possible.push(this.nounIsPrepositionOtherNoun);
      possible.push(this.nounVerbs);
    }
    for (let i = 0; i < 8; ++i) {
      possible.push(this.nounIsAdjective);
    }
    for (let i = 0; i < 12; ++i) {
      possible.push(this.nounVerbsNoun);
    }

    return possible;
  }

  chooseRandom = (arr) => { return arr[Math.floor(Math.random() * arr.length)]; }

  placeNoun = () => { return this.chooseRandom(vocab.placeNouns); }

  timeNoun = () => { return this.chooseRandom(vocab.timeNoun); }

  subjectNoun = () => { return this.chooseRandom(vocab.subjectOnlyNouns); }

  subjectNounPlus = () => { return this.chooseRandom(vocab.nouns.concat(vocab.subjectOnlyNouns)); }

  noun = () => { return this.chooseRandom(vocab.nouns); }

  preposition = () => { return this.chooseRandom(vocab.prepositions); }

  adjective = () => { return this.chooseRandom(vocab.adjectives); }

  verb = () => { return this.chooseRandom(vocab.verbs); }

  placeVerb = () => { return this.chooseRandom(vocab.placeVerbs); }

  adverb = () => { return this.chooseRandom(vocab.adverbs); }

  verbTense = () => { return this.chooseRandom(this.verbTenses); }

  adjectiveTense = () => { return this.chooseRandom(this.adjectiveTenses); }


  possessNoun = (noun) => {
    //putting a descriptor in front of a pronoun sounds stupid
    if (this.isPronoun[noun[1]]) {
      return noun;
    }

    let possessor = this.subjectNounPlus();
    let english = possessor[0] + "'s " + noun[0];

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
    if (this.isPronoun[noun[1]]) {
      return noun;
    }

    let adj = this.adjective();
    let english = adj[0] + " " + noun[0];
    let korean = this.getDescriptiveAdj(adj[1]) + " " + noun[1];
    return [english, korean];
  }

  도ifyNoun = (noun) => {
    let english = noun[0] + ", too,";
    let korean = noun[1] + "도";
    return [english, korean, true];
  }

  decorateNoun = (noun) => {
    let num = Math.floor(Math.random() * 20) + 1;
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

  phrase = () => {
    let phrase = this.chooseRandom(vocab.phrases);
    return {
      eng: phrase[0],
      kor: phrase[1]
    }
  }

  nounHasNoun = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let obj = this.decorateNoun(this.noun());

    let tense = this.adjectiveTense();

    let sp = "#{는}";
    //more than two things means decorateNoun already put a particle on it
    if (subj.length > 2) {
      sp = "";
    }
    let op = "#{가}";
    if (obj.length > 2) {
      op = "";
    }
    return {
      eng: `the ${subj[0]} has (a) ${obj[0]} (${tense[0]})`,
      kor: josa(`${subj[1]}${sp} ${obj[1]}${op} ${tense[1]("있다")}`)
    }
  }

  nounVerbPlace = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let place = this.decorateNoun(this.placeNoun());

    let verb, tense;
    let num = Math.floor(Math.random() * 2);
    if (num > 0) {
      verb = this.placeVerb();
      tense = this.verbTense();
    } else {
      verb = ["is at", "있다"];
      tense = this.adjectiveTense();
    }

    let sp = "#{는}";
    //more than two things means decorateNoun already put a particle on it
    if (subj.length > 2) {
      sp = "";
    }
    return {
      eng: `(the) ${subj[0]} ${verb[0]} (the) ${place[0]} (${tense[0]})`,
      kor: josa(`${subj[1]}${sp} ${place[1]}에 ${tense[1](verb[1])}`)
    }
  }

  nounIsPrepositionOtherNoun = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let other = this.decorateNoun(this.noun());
    let preposition = this.preposition();

    let tense = this.adjectiveTense();
    let sp = "#{는}";
    //more than two things means decorateNoun already put a particle on it
    if (subj.length > 2) {
      sp = "";
    }
    return {
      eng: `(the) ${subj[0]} is ${preposition[0]} (the) ${other[0]} (${tense[0]})`,
      kor: josa(`${subj[1]}${sp} ${other[1]}${preposition[1]}에 ${tense[1]("있다")}`)
    }
  }
  
  nounVerbs = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let verb = this.verb();
    let tense = this.verbTense();
    
    let sp = "#{는}";
    //more than two things means decorateNoun already put a particle on it
    if (subj.length > 2) {
      sp = "";
    }
    return {
      eng: `(the) ${subj[0]} ${verb[0]} (${tense[0]})`,
      kor: josa(`${subj[1]}${sp} ${tense[1](verb[1])}`)
    }
  }
  nounIsAdjective = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let adjective = this.adjective();
    let tense = this.adjectiveTense();

    let sp = "#{는}";
    if (adjective[1] == "많다") {
      sp = "${이}";
    }
    return {
      eng: `(the) ${subj[0]} is ${adjective[0]} (${tense[0]})`,
      kor: josa(`${subj[1]}${sp} ${tense[1](adjective[1])}`)
    }
  }
  
  nounVerbsNoun = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let verb = this.verb();
    let obj = this.decorateNoun(this.noun());
    let tense = this.verbTense();
    
    let sp = "#{는}";
    //more than two things means decorateNoun already put a particle on it
    if (subj.length > 2) {
      sp = "";
    }
    let op = "#{를}";
    if (obj.length > 2) {
      op = "";
    }
    return {
      eng: `(the) ${subj[0]} ${verb[0]} the ${obj[0]} (${tense[0]})`,
      kor: josa(`${subj[1]}${sp} ${obj[1]}${op} ${tense[1](verb[1])}`)
    }
  }

  makeSentence = () => {
    let func = this.chooseRandom(this.possibleSentenceStructures);
    return func();
  }

}