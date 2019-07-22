import React, { Component } from 'react';
import './App.css';
import { SentenceBuilder } from './SentenceBuilder';

export class HelpMeComponent extends Component {


  constructor(props) {
    super(props);

    this.dictionary = props.dictionary;
    // this.sentenceBuilder = new SentenceBuilder(this.dictionary);

    this.state = {
      currentAction: "search",
      currentText: "",
      displayResults: [],
    }
  }


  onBoxDropdownChange = (event) => {
    this.updateDisplayResults(event.target.value, this.state.currentText);
  }

  updateDisplayResults = (action, text) => {
    let results = []
    if (text.length > 0) {
      switch (action) {
        case "search":
          results = this.dictionary.findWord(text);
          break;
        case "verb":
          results = this.dictionary.conjugateVerb(text);
          break;
        case "adj":
          results = this.dictionary.conjugateAdjective(text);
          break;
        default:
          results = [];
          break;
      }
    }
    this.setState({
      currentAction: action,
      currentText: text,
      displayResults: results.map((term, index) => {
        return <p key={"searchResult" + index}>{term}</p>
      })
    });
  }


  onSearchTextChange = (event) => {
    this.updateDisplayResults(this.state.currentAction, event.target.value);
  }



  render() {
    // !!this.state.eng && !!this.state.kor && 
    return (
      <div className="help-me-bar">
        <div className="searchBox">Help Me:
                <select onChange={this.onBoxDropdownChange} name="helpMeDropdown">
            <option value="search">Search</option>
            <option value="verb">Conjugate Verb</option>
            <option value="adj">Conjugate Adjective</option>
          </select>
          <br />
          <input type="text" onChange={this.onSearchTextChange}></input>
          {this.state.displayResults}
        </div>
      </div>
    );
  }
}