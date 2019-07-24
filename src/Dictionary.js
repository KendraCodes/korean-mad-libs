import { Conjugator } from "./Conjugator";


export class Dictionary {
  
  static STORAGE_SITE = 'https://koreanmadlibs.blob.core.windows.net/koreanvocab/vocab.json';

  static create = () => {
    return fetch(Dictionary.STORAGE_SITE).then((response) => {
      return response.json();
    }).then((vocab) => {
      return new Dictionary(vocab);
    });

  }

  constructor(vocab) {
    if (!vocab) {
      throw new Error("Cannot construct Dictionary with empty arguments, call Dictionary.create() instead.");
    }

    this.vocab = vocab;
    const conjugator = new Conjugator();
    this.verbTenses = conjugator.getVerbTenses();
    this.adjectiveTenses = conjugator.getAdjectiveTenses();
  }

  pushChanges = () => {

    return fetch(
      `${Dictionary.STORAGE_SITE}?${localStorage.getItem('SASToken')}`,
      {
        "method": "PUT",
        body: JSON.stringify(this.vocab),
        headers: {
          "Content-Type": "application/json",
          "x-ms-blob-type": "BlockBlob"
        }
      });
  }


  findWord = (searchTerm) => {
    searchTerm = searchTerm.toLowerCase();
    let results = [];
    let searchArray = (tuple) => {
      let engWord = tuple[0].toLowerCase();
      if (engWord.includes(searchTerm) || searchTerm.includes(engWord)) {
        results.push(`${tuple[1]} (${tuple[0]})`);
      }
      let korWord = tuple[1];
      if (korWord.includes(searchTerm) || searchTerm.includes(korWord)) {
        results.push(`${tuple[0]} (${tuple[1]})`);
      }
    };

    Object.keys(this.vocab).forEach(key => {
      if (key != "default") {
        this.vocab[key].forEach(searchArray);
      }
    });

    return results;
  }

  editVocabWords = (category, workItems) => {

    workItems.forEach((item) => {
      this.vocab[category][item.index] = item.tuple;
    });
    
    //only keep terms that have something in them
    this.vocab[category] = this.vocab[category].filter((item) => {
      return item[0].length > 0 || item[1].length > 0
    });

  }

  addVocabWord = (category, english, korean) => {
    //if both parts match an existing entry, don't add it
    if (this.vocab[category].some(tuple => tuple[0] == english && tuple[1] == korean)) {
      return false;
    }
    this.vocab[category].push([english, korean]);
    return this.vocab;
  }

  getVocabCategories = () => {
    return Object.keys(this.vocab);
  }

  getVocab = (...categories) => {
    let combined = [];
    for (let i = 0; i < categories.length; i++) {
      combined = combined.concat(this.vocab[categories[i]]);
    }
    return JSON.parse(JSON.stringify(combined));
  }

  makeQuizletFile = () => {
    let output = "";
    this.getVocabCategories().forEach((category) => {
      this.vocab[category].forEach((item) => {
        let line = item[0] + "\t" + item[1] + "\n";
        output = output + line;
      });
    });
  }
}