import React, { Component } from 'react';

import { SentenceBuilder } from './SentenceBuilder';
import './App.css';

export class SentenceCardComponent extends Component {


  constructor(props) {
    super(props);

    this.dictionary = props.dictionary;
    this.sentenceBuilder = new SentenceBuilder(this.props.dictionary);
    const firstSentence = this.sentenceBuilder.makeSentence();
    this.textInput = React.createRef();
    this.state = {
      eng: firstSentence.eng,
      kor: firstSentence.kor,
      userSentence: '',
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
    this.textInput.current.focus();
    this.setState({
      eng: newSentence.eng,
      kor: newSentence.kor,
      userSentence: '',
      showKorean: false
    });
  }

  onTextChange = (event) => {
    this.setState({
      userSentence: event.target.value
    });
  }

  render() {
    return (
      <div className="center-container" style={this.props.show ? {} : { display: 'none' }}>
        <div className="card">
          <p>{this.state.eng}</p>
          <div className="user-input-container" >
            <input ref={this.textInput} type="text" onChange={this.onTextChange} value={this.state.userSentence} />
          </div>
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