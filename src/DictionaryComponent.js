import React, { Component } from 'react';
import './App.css';

//needs a dictionary to be passed into it
export class DictionaryComponent extends Component {

  DEFAULT_CATEGORY = 'nouns';

  constructor(props) {
    super(props);

    this.dictionary = props.dictionary;

    this.state = {
      curCategory: this.DEFAULT_CATEGORY,
      curVocabList: this.dictionary.getVocab(this.DEFAULT_CATEGORY)
    }
  }

  onCategoryDropdownChange = (event) => {
    this.setState({
      curCategory: event.target.value,
      curVocabList: this.dictionary.getVocab(event.target.value),
      unsavedWork: false
    });
  }

  onSaveButtonClick = () => {
    this.dictionary.editVocabWords(this.state.curCategory,
      this.state.curVocabList.map((tuple, index) => {
        return {
          index,
          tuple
        }
      }));

    this.dictionary.pushChanges().then(() => {
      this.setState({
        unsavedWork: false,
        curVocabList: this.dictionary.getVocab(this.state.curCategory)
      });
    });
  }

  onNewItemButtonClick = () => {
    const newVocab = this.state.curVocabList;
    newVocab.push(['', '']);
    this.setState({
      curVocabList: newVocab
    });
  }
  
  buildOnChange = (itemIdx, tuplePos) => {
    return (event) => {
      const newVocab = this.state.curVocabList;
      newVocab[itemIdx][tuplePos] = event.target.value;
      this.setState({
        curVocabList: newVocab,
        unsavedWork: true
      });
    }
  }

  render() {
    const vocabCategoriesDropdown = (
      <select onChange={this.onCategoryDropdownChange} name="addWordDropdown" defaultValue={this.DEFAULT_CATEGORY}>
        {this.dictionary.getVocabCategories().map((category) => {
          return <option key={category} value={category}>{category}</option>
        })}
      </select>
    );

    const vocabItems = this.state.curVocabList.map((term, index) => {
      return (
        <p key={'vocabEntry' + index}>
          <input type="text" onChange={this.buildOnChange(index, 0)} value={this.state.curVocabList[index][0]}></input>
          <input type="text" onChange={this.buildOnChange(index, 1)} value={this.state.curVocabList[index][1]}></input>
        </p>
      );
    });

    return (
      <div style={this.props.show ? {} : { display: 'none' }}>
        <div>
          <span>Category</span>
          {vocabCategoriesDropdown}
        </div>
        <div>
          {vocabItems}
        </div>
        <button onClick={this.onNewItemButtonClick}>New Word</button>
        <button disabled={!this.state.unsavedWork} onClick={this.onSaveButtonClick}>Save Changes</button>
      </div >
    )
  }
}