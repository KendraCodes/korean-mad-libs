import React, { Component } from 'react';

import { SentenceBuilder } from './SentenceBuilder';
import './App.css';

const FULL_SENTENCES = "Full Sentences";
const CONJUGATION = "Conjugation";
const VOCAB = "Vocab";

export class SentenceCardComponent extends Component {


  constructor(props) {
    super(props);

    this.dictionary = props.dictionary;
    this.sentenceBuilder = new SentenceBuilder(this.props.dictionary);
    this.textInput = React.createRef();
    const firstSentence = this.sentenceBuilder.makeSentence();
    this.state = {
      eng: firstSentence.eng,
      kor: firstSentence.kor,
      practiceMode: FULL_SENTENCES,
      allowInput: true,
      userSentence: '',
      showKorean: false
    };
  }

  getNextItem = (practiceMode) => {
    switch (practiceMode) {
      case FULL_SENTENCES:
        return this.sentenceBuilder.makeSentence();
      case CONJUGATION:
        return this.sentenceBuilder.makeConjugation();
      case VOCAB:
        return this.sentenceBuilder.makeVocabWord();
      default:
        return {
          eng: 'Something went wrong',
          kor: '아아아아아아아아아'
        }
    }
  }

  onShowAnswerClick = () => {
    this.setState({
      showKorean: true
    });
  }

  onNextButtonClick = () => {
    const nextItem = this.getNextItem(this.state.practiceMode);
    this.textInput.current.focus();
    this.setState({
      eng: nextItem.eng,
      kor: nextItem.kor,
      userSentence: '',
      showKorean: false
    });
  }

  onTextChange = (event) => {
    this.setState({
      userSentence: event.target.value
    });
  }

  onPracticeModeChange = (event) => {
    const nextItem = this.getNextItem(event.target.value);
    this.setState({
      practiceMode: event.target.value,
      showKorean: false,
      allowInput: true,
      eng: nextItem.eng,
      kor: nextItem.kor
    });
  }

  render() {
    return (
      <div className="center-container" style={this.props.show ? {} : { display: 'none' }}>
        <div className="practice-mode">
          <select onChange={this.onPracticeModeChange} value={this.state.practiceMode} name="practiceModeDropdown">
            <option value={FULL_SENTENCES}>Practice Complete Sentences</option>
            <option value={CONJUGATION}>Practice Conjugation</option>
            <option value={VOCAB}>Practice Vocab</option>
          </select>
        </div>
        <div className="card">
          <p>{this.state.eng}</p>
          {this.state.allowInput &&
            <div className="user-input-container" >
              <input ref={this.textInput} type="text" onChange={this.onTextChange} value={this.state.userSentence} />
            </div>
          }
          {this.state.showKorean ?
            <p>{this.state.kor}</p> :
            <p><button className="show-answer-button" onClick={this.onShowAnswerClick}>Show answer</button></p>
          }
          <div className="next-button-container">
            <button className="next-button" onClick={this.onNextButtonClick}>Next</button>
          </div>
        </div>
      </div>
    );
  }
}