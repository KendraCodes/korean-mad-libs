import React, { Component } from 'react';
import './App.css';

import { Dictionary } from './Dictionary';
import { HelpMeComponent } from './HelpMeComponent';
import { SentenceCardComponent } from './SentenceCardComponent';
import { DictionaryComponent } from './DictionaryComponent';


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dictionary: undefined,
      showDictionary: false
    }

    Dictionary.create().then((dict) => {

      this.setState({
        dictionary: dict
      });
    });

  }

  _handleShowDictionaryClick = () => {
    this.setState({
      showDictionary: !this.state.showDictionary
    });
  }

  _handleContactMeClick = () => {
    window.open('https://www.linkedin.com/in/kendra-graham-b23a8b47/', '_blank');
  }

  _handleGoToSource = () => {
    window.open('https://github.com/kendracodes/korean-mad-libs', '_blank');
  }


  render() {
    let leftFooter = undefined;
    if (localStorage.getItem('SASToken')) {
      // if  a token exists in localStorage, give user the option to edit the dictionary
      const leftButtonText = this.state.showDictionary ? "Sentence Practice" : "Edit Dictionary";
      leftFooter = this.makeFooterItem(leftButtonText, this._handleShowDictionaryClick);
    } else {
      // otherwise, give them a link to the github project
      leftFooter = this.makeFooterItem('Source Code', this._handleGoToSource);
    }
    const contactMeFooter = this.makeFooterItem("Contact Me", this._handleContactMeClick);

    const href = `https://docs.google.com/forms/d/e/1FAIpQLSePQrM36HZAQl6X9FbQRXiU3Z3gCqBIh5spNpH432POYr8xng/viewform?usp=sf_link`;

    return (
      <div className="main">
        <h1>한국어 Mad Libs</h1>
        {this.state.dictionary &&
          <div className="contents">
            <SentenceCardComponent
              dictionary={this.state.dictionary}
              show={!this.state.showDictionary}
            />
            {!this.state.showDictionary &&
              <div className="center-container fix-my-grammar">
                <a href={href} target="_blank">Report a grammar or spelling mistake</a>
              </div>
            }
            <HelpMeComponent
              dictionary={this.state.dictionary}
              show={!this.state.showDictionary}
            />
            <DictionaryComponent
              dictionary={this.state.dictionary}
              show={this.state.showDictionary}
            />
          </div>
        }
        <div className="footer">
          {contactMeFooter}
          {leftFooter}
        </div>
      </div>
    );
  }

  makeFooterItem = (text, onClick) => {
    const onKeyPress = (event) => {
      if (event.nativeEvent.keyCode === 13) {
        onClick();
      }
    }
    return (
      <span tabIndex={0} onKeyPress={onKeyPress} onClick={onClick}>{text}</span>
    )
  }
}

export default App;
