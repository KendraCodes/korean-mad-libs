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
      secretkey: ""
    }
  }

  updateVocab = (category, english, korean, secretKey) => {

    let updatedVocab = this.dictionary.addVocabWord(category, english, korean);
    if (!updatedVocab) {
      //no changes made
      return false;
    }

    fetch(
      // 'https://api.jsonbin.io/b/5d0c50df84683733fbc7bab6'
      'https://api.jsonbin.io/b/5d35fa4b820de330bab37ab5'
      , {
      "method": "PUT",
      body: JSON.stringify(updatedVocab),
      headers: {
        "Content-Type": "application/json",
        "secret-key": secretKey
      }
    });
  }

  onSubmitNewWordClick = () => {
    this.updateVocab(this.state.newCategory, this.state.newEngWord, this.state.newKorWord, this.state.secretKey);
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

  onSecretKeyBlur = (event) => {
    this.setState({
      secretKey: event.target.value 
    });
  }

  updateWordInList = (event) => {
    //get the index of hte words delete from list and then add it into that same position??
    console.log("pair " + event.target.dataset.pair + ", " + event.target.value + " " );
  }

  render() {
    return (
      <div style={this.props.show ? {} : {display: 'none'}}>Add New Word
                <div>Category
                <select onChange={this.onNewCategoryDropdownChange} name="addWordDropdown">
            {this.dictionary.getVocabCategories().map((category) => {
              return <option key={category} value={category}>{category}</option>
            })}
          </select>
        </div>

        <div>Secret key(JSONbin.io) <input type="text" onBlur={this.onSecretKeyBlur}></input></div>

        <div>
          {this.dictionary.getVocab(this.state.newCategory).map((term, index) =>{
            if(term !== undefined){
              console.log(term + " " + index);
              return <p> 
                  <input type="text" data-pair={index} onBlur={this.updateWordInList} defaultValue={term[0]}></input>
                  <input type="text" data-pair={index} onBlur={this.updateWordInList} defaultValue={term[1]}></input>  
              </p> }
            return 
          })}
        </div>
        <button onClick={this.dosomething}>Edit Existing Words</button>

        <div>Korean<input onChange={this.onNewKorWordTextChange} type="text" ></input></div>
        <div>English<input onChange={this.onNewEngWordTextChange} type="text" ></input></div>
         
        <button onClick={this.onSubmitNewWordClick}>Add New Word</button>
      </div>
    )
  }
}