import React, { Component } from 'react';
import './App.css';
import { Conjugator } from './Conjugator';

export class HelpMeComponent extends Component {

  constructor(props) {
    super(props);

    this.dictionary = props.dictionary;
    this.conjugator = new Conjugator();

    this.state = {
      action: "search",
      text: "",
      type: this.conjugator.DEFAULT_TYPE,
      tense: this.conjugator.DEFAULT_TENSE,
      level: this.conjugator.DEFAULT_LEVEL
    }
  }


  onActionsDropdownChange = (event) => {
    this.setState({
      action: event.target.value
    });
  }

  onTypeDropdownChange = (event) => {
    this.setState({
      type: event.target.value
    });
  }

  onTenseDropdownChange = (event) => {
    this.setState({
      tense: event.target.value
    });
  }

  onLevelDropdownChange = (event) => {
    this.setState({
      level: event.target.value
    });
  }

  onSearchTextChange = (event) => {
    if (event.target.value.includes('SASToken')) {
      const obj = JSON.parse(event.target.value);
      localStorage.setItem('SASToken', obj['SASToken']);
    }
    this.setState({
      text: event.target.value
    });
  }

  buildDisplayResults = () => {
    let textItems = [];
    if (this.state.text.length > 0) {
      switch (this.state.action) {
        case "search":
          textItems = this.dictionary.findWord(this.state.text);
          break;
        case "conjugate":
          const func = this.conjugator.buildConjugator(this.state.tense, this.state.level, this.state.type);
          textItems = [func[1](this.state.text)]
          break;
        default:
          textItems = [];
          break;
      }
    }
    return (
      <div className="display-results">
        {textItems.map((term, index) => {
          return <p className="search-result" key={"searchResult" + index}>{term}</p>
        })}
      </div>
    );
  }

  buildConjugationDropdowns = () => {
    if (this.state.action === 'conjugate') {
      const buildOptions = (optionsList) => {
        return optionsList.map((option) => {
          return (
            <option key={option} value={option}>{option}</option>
          );
        });
      }
      return (
        <div className="dropdown-container">
          <select onChange={this.onTypeDropdownChange} value={this.state.type} name="typeDropdown">
            <option value={'verb'}>a verb</option>
            <option value={'adjective'}>an adjective</option>
          </select>
          <span> in </span>
          <select onChange={this.onTenseDropdownChange} value={this.state.tense} name="tenseDropdown">
            {buildOptions(this.conjugator.TENSES)}
          </select>
          <span> tense and </span>
          <select onChange={this.onLevelDropdownChange} value={this.state.level} name="levelDropdown">
            {buildOptions(this.conjugator.LEVELS)}
          </select>
          <span> form.</span>
        </div>
      );
    } else {
      return undefined;
    }
  }

  render() {
    return (
      <div className="center-container" style={this.props.show ? {} : { display: 'none' }}>
        <div className="help-me-section">
          <div className="dropdown-container">
            <span>Help me </span>
            <select onChange={this.onActionsDropdownChange} name="actionsDropdown" value={this.state.action}>
              <option value="search">Find a Word</option>
              <option value="conjugate">Conjugate</option>
            </select>
          </div>
          {this.buildConjugationDropdowns()}
          <div className="help-me-input-container">
            <input type="text" onChange={this.onSearchTextChange}></input>
          </div>
          {this.buildDisplayResults()}
        </div>
      </div>
    );
  }
}