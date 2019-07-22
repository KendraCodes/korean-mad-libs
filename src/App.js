import React, { Component } from 'react';
import './App.css';

import { Dictionary } from './Dictionary';
import { HelpMeComponent } from './HelpMeComponent';
import { SentenceCardComponent } from './SentenceCardComponent';



class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dictionary: undefined
    }

  }

  componentDidMount = () => {
    Dictionary.create().then((dict) => {
      this.setState({
        dictionary: dict
      });
    });
  }

  render() {
    return (
      <div className="main">
        <h1>Korean Mad Libs</h1>
        <div className="contents">
          {this.state.dictionary &&
            <SentenceCardComponent
              dictionary={this.state.dictionary}
            />}
          {this.state.dictionary &&
            <HelpMeComponent
              dictionary={this.state.dictionary}
            />}
        </div>
      </div>
    );
  }
}

export default App;
