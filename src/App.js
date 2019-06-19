import React, { Component } from 'react';
import './App.css';
import * as vocab from './vocab.json';

import { SentenceBuilder } from './SentenceBuilder';

class App extends Component {

  constructor(props) {
    super(props);

    this.sentenceBuilder = new SentenceBuilder();
    let sentence = this.sentenceBuilder.makeSentence();
    this.state = {
      searchResults: [],
      eng: sentence.eng,
      kor: sentence.kor,
      showKorean: false
    };

  }
  
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

  onShowAnswerClick = () => {
    this.setState({
      showKorean: true
    });
  }

  onNewSentenceClick = () => {
    let newSentence = this.sentenceBuilder.makeSentence();
    this.setState({
      eng: newSentence.eng,
      kor: newSentence.kor,
      showKorean: false
    });
  }

  onSearchTextChange = (event) => {
    this.sentenceBuilder.conjugateAdjective(event.target.value);
    this.sentenceBuilder.conjugateVerb(event.target.value);
    let results = this.sentenceBuilder.findWord(event.target.value);
    this.setState({
      searchResults: results.map((term, index) => {
        return <p key={"searchResult" + index}>{term}</p>
      })
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Korean Mad Libs</h1>
        </div>
        <p>{this.state.eng}</p>
        {this.state.showKorean ?
          <p>{this.state.kor}</p> :
          <p><button onClick={this.onShowAnswerClick}>Show answer</button></p>}
          <button onClick={this.onNewSentenceClick}>New Sentence</button>
          <div className="searchBox">
            <input type="text" onChange={this.onSearchTextChange}></input>
            {this.state.searchResults}
          </div>
      </div>
    );
  }
}

export default App;
