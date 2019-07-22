import React, { Component } from 'react';
import './App.css';

//needs a dictionary to be passed into it
export class DictionaryComponent extends Component {

  constructor(props) {
    super(props);

    this.dictionary = props.dictionary;

    this.state = {
      newEngWord: "",
      newKorWord: "",
      newCategory: "adverbs",
    }
  }

  updateVocab = (category, english, korean) => {

    let updatedVocab = this.dictionary.addVocabWord(category, english, korean);
    if (!updatedVocab) {
      //no changes made
      return false;
    }

    fetch('https://api.jsonbin.io/b/5d0c50df84683733fbc7bab6', {
      "method": "PUT",
      body: JSON.stringify(updatedVocab),
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  onSubmitNewWordClick = () => {
    this.updateVocab(this.state.newCategory, this.state.newEngWord, this.state.newKorWord);
  }

  onNewEngWordTextChange = (event) => {
    this.setState({
      newEngWord: event.target.value
    });
  }

  onNewKorWordTextChange = (event) => {
    this.setState({
      newKorWord: event.target.value
    });
  }


  onNewCategoryDropdownChange = (event) => {
    this.setState({
      newCategory: event.target.value
    });
  }

  render() {
    return (
      <div>Add New Word
                <div>Category
                <select onChange={this.onNewCategoryDropdownChange} name="addWordDropdown">
            {this.dictionary.getVocabCategories().map((category) => {
              return <option value={category}>{category}</option>
            })}
          </select>
        </div>
        <div>Korean<input onChange={this.onNewKorWordTextChange} type="text" ></input></div>
        <div>English<input onChange={this.onNewEngWordTextChange} type="text" ></input></div>
        <button onClick={this.onSubmitNewWordClick}>submit</button>
      </div>
    )
  }
}