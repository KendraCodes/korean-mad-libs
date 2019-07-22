

export class Dictionary {

  static create = () => {
    return fetch('https://api.jsonbin.io/b/5d0c50df84683733fbc7bab6/latest').then((response) => {
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

  conjugateAdjective = (adj) => {
    let forms = [];
    forms.push("Descriptive form: " + this.getDescriptiveAdj(adj));
    this.adjectiveTenses.forEach((tense) => {
      forms.push(tense[0] + ": " + tense[1](adj));
    });
    return forms;
  }

  conjugateVerb = (verb) => {
    let forms = [];
    this.verbTenses.forEach((tense) => {
      forms.push(tense[0] + ": " + tense[1](verb));
    });
    return forms;
  }

  addVocabWord = (category, english, korean) => {
    console.log(category)
    console.log(this.vocab)
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

  getVocab = (category) => {
    return this.vocab[category];
  }

  getVocab = (cat1, cat2) => {
    return this.vocab[cat1].concat(this.vocab[cat2])
  }

  makeQuizletFile = () => {
    let output = "";
    this.getVocabCategories().forEach((category) => {
      this.vocab[category].forEach((item) => {
        let line = item[0] + "\t" + item[1] + "\n";
        output = output + line;
      });
    });
    console.log(output);

  }
}