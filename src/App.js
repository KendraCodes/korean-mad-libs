import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as vocab from './vocab.json';
import * as hangul from 'hangul-js';
import { josa, getJosaPicker, makeJosaify } from 'josa';

class App extends Component {

  makeQuizletFile = () => {
    let output = "";
    let allTheCategories = [
      vocab["phrases"],
      vocab["subjectOnlyNouns"],
      vocab["placeNouns"],
      vocab["timeNouns"],
      vocab["nouns"],
      vocab["prepositions"],
      vocab["adjectives"],
      vocab["placeVerbs"],
      vocab["verbs"],
      vocab["adverbs"],
    ];
    allTheCategories.forEach((category) => {
      category.forEach((item) => {
        let line = item[0] + "\t" + item[1] + "\n";
        output = output + line;
      });
    });
    console.log(output);
  }

  constructor(props) {
    super(props);

    this.makeQuizletFile();

    this.possibleSentenceStructures = this.getPossibleSentenceStructures(5);
    this.verbTenses = this.getVerbTenses();
    this.adjectiveTenses = this.getAdjectiveTenses();
    this.isPronoun = { 
      "오리": true,
      "저": true,
      "나": true,
      "너": true,
      "이것": true,
      "그것": true,
      "저것": true,
     }

    let sentence = this.makeSentence();
    this.state = {
      eng: sentence.eng,
      kor: sentence.kor,
      showKorean: false
    };
  }

  getPossibleSentenceStructures = (maxGrammarLevel) => {
    let possible = []

    for (let i = 0; i < 2; ++i) {
      possible.push(this.phrase);
    }
    for (let i = 0; i < 3; ++i) {
      possible.push(this.nounIsAtPlace);
      possible.push(this.nounIsPrepositionOtherNoun);
    }
    for (let i = 0; i < 4; ++i) {
      possible.push(this.nounIsNoun);
      possible.push(this.nounHasNoun);
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

  getVerbTenses = () => {
    return [
      [ "plain present", (verb) => {
        let stem = this.kor_getStem(verb);
        console.log(stem)
        return this.kor_addToEnd(stem, "는다", "ㄴ다");
      } ],
      [ "plain past", (verb) => {
        return verb;
      } ],
      [ "plain future", (verb) => {
        return verb;
      } ],
      [ "formal polite past", (verb) => {
        return verb;
      } ],
      [ "formal polite present", (verb) => {
        return verb;
      } ],
      [ "formal polite future", (verb) => {
        return verb;
      } ],
      [ "informal polite past", (verb) => {
        return verb;
      } ],
      [ "informal polite present", (verb) => {
        return verb;
      } ],
      [ "informal polite future", (verb) => {
        return verb;
      } ]
    ];
  }
  
  getAdjectiveTenses = () => {
    return [
      [ "plain past", (adj) => {
        return adj;
      } ],
      [ "plain present", (adj) => {
        return adj;
      } ],
      [ "plain future", (adj) => {
        return adj;
      } ],
      [ "formal polite past", (adj) => {
        return adj;
      } ],
      [ "formal polite present", (adj) => {
        return adj;
      } ],
      [ "formal polite future", (adj) => {
        return adj;
      } ],
      [ "informal polite past", (adj) => {
        return adj;
      } ],
      [ "informal polite present", (adj) => {
        return adj;
      } ],
      [ "informal polite future", (adj) => {
        return adj;
      } ]
    ]
  }

  onShowAnswerClick = () => {
    this.setState({
      showKorean: true
    });
  }

  onNewSentenceClick = () => {
    let newSentence = this.makeSentence();
    this.setState({
      eng: newSentence.eng,
      kor: newSentence.kor,
      showKorean: false
    });
  }

  chooseRandom = (arr) => { return arr[Math.floor(Math.random()*arr.length)]; }

  
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
  
  kor_getStem = (verbOrAdj) => {
    return verbOrAdj.slice(0, -1);
  }

  kor_addToEnd = (word, ifCons, ifVowel) => {
    //add one of two endings based on whether the word engs in a consonant or vowel
    let endChar = word.slice(-1);
    if (hangul.endsWithConsonant(endChar)) {
      let letters = hangul.disassemble(word).concat(hangul.disassemble(ifCons));
      return hangul.assemble(letters);
    } else {
      let letters = hangul.disassemble(word).concat(hangul.disassemble(ifVowel));
      return hangul.assemble(letters);
    }
    
  }

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

    return [ english, korean + noun[1] ];
  }
  
  describeNoun = (noun) => {
    //putting a descriptor in front of a pronoun sounds stupid
    if (this.isPronoun[noun[1]]) {
      return noun;
    }

    let adj = this.adjective();
    let english = adj[0] + " " + noun[0];
    let korean = this.kor_addToEnd(this.kor_getStem(adj[1]), "은", "ㄴ") + " " + noun[1];
    return [ english, korean ];
  }

  도ifyNoun = (noun) => {
    let english = noun[0] + ", too,";
    let korean = noun[1] + "도";
    return [ english, korean, true ];
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
  
  //TODO let this have different conjugations of 이다
  nounIsNoun = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let obj = this.noun();

    let sp = "#{는}";
    //more than two things means decorateNoun already put a particle on it
    if (subj.length > 2) {
      sp = "";
    }
    return {
      eng: `the ${subj[0]} is (a) ${obj[0]}`,
      kor: josa(`${subj[1]}${sp} ${obj[1]}입니다`)
    };
  }

  //TODO let this have different conjugations of 있다
  nounHasNoun = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let obj = this.decorateNoun(this.noun());

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
      eng: `the ${subj[0]} has (a) ${obj[0]}`,
      kor: josa(`${subj[1]}${sp} ${obj[1]}${op} 있어요`)
    }
  }

  //TODO replace this with noun verb place, using different conjugations
  nounIsAtPlace = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let place = this.decorateNoun(this.placeNoun());
    let sp = "#{는}";
    //more than two things means decorateNoun already put a particle on it
    if (subj.length > 2) {
      sp = "";
    }
    return {
      eng: `(the) ${subj[0]} is at (the) ${place[0]}`,
      kor: josa(`${subj[1]}${sp} ${place[1]}에 있어요`)
    }
  }

  //TODO let this have different conjugations of 있다
  nounIsPrepositionOtherNoun = () => {
    let subj = this.decorateNoun(this.subjectNounPlus());
    let other = this.decorateNoun(this.noun());
    let preposition = this.preposition();
    let sp = "#{는}";
    //more than two things means decorateNoun already put a particle on it
    if (subj.length > 2) {
      sp = "";
    }
    return {
      eng: `(the) ${subj[0]} is ${preposition[0]} (the) ${other[0]}`, 
      kor: josa(`${subj[1]}${sp} ${other[1]}${preposition[1]}에 있어요`)
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

  makeSentence = () => {
    let func = this.chooseRandom(this.possibleSentenceStructures);
    return func();
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1> 안녕하세요 </h1>
        </div>
        <p>{this.state.eng}</p>
        {this.state.showKorean ? 
          <p>{this.state.kor}</p> : 
          <p><button onClick={this.onShowAnswerClick}>Show answer</button></p>}
        
        <button onClick={this.onNewSentenceClick}>New Sentence</button>
      </div>
    );
  }
}

export default App;
