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
    console.log('contact the author');
  }

  render() {
    const leftButtonText = this.state.showDictionary ? "Sentence Practice" : "Edit Dictionary";
    const editDictionaryFooter = this.makeFooterItem(leftButtonText, this._handleShowDictionaryClick);
    const contactMeFooter = this.makeFooterItem("Contact Me", this._handleContactMeClick);

    const contactMeText = `Thanks for helping me improve the site (and my Korean)! Please attach a screenshot of the problem and tell me what is wrong.`;
    const href = `mailto:deloris4@gmail.com?body=${contactMeText}`;
    // const href = "https://github.com/KendraCodes/korean-mad-libs/issues/new";

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
          {editDictionaryFooter}
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
