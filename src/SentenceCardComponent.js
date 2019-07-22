import React, { Component } from 'react';

import { SentenceBuilder } from './SentenceBuilder';
import './App.css';

export class SentenceCardComponent extends Component {


  constructor(props) {
    super(props);

    this.dictionary = props.dictionary;
    this.sentenceBuilder = new SentenceBuilder(this.props.dictionary);
    // this.dictionary.makeQuizletFile();
    const firstSentence = this.sentenceBuilder.makeSentence();
    this.state = {
      eng: firstSentence.eng,
      kor: firstSentence.kor,
      showKorean: false
    };
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


  render() {
    return (
      <div className="center-container" style={this.props.show ? {} : { display: 'none' }}>
        <div className="card">
          <p>{this.state.eng}</p>
          {this.state.showKorean ?
            <p>{this.state.kor}</p> :
            <p><button className="show-answer-button" onClick={this.onShowAnswerClick}>Show answer</button></p>}
          <div className="new-sentence-button-container">
            <button className="new-sentence-button" onClick={this.onNewSentenceClick}>New Sentence</button>
          </div>
        </div>
      </div>
    );
  }
}