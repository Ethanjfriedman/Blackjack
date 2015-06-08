console.log('cards.js loaded')

var cards = {
  cardSuits: ["spades", "hearts", "diamonds", "clubs"],
  cardValues: ["ace", "2", "3", "4", "5", "6", "7", "8",
  "9", "10", "J", "Q", "K"],
  longCardValues: ['ace','two','three','four','five','six','seven','eight','nine','ten','jack','queen','king'],
  deck: [],

  makeDeck: function() {
    var Card = function(suitIndex, valueIndex) { //Card constructor function
      this.suit = cards.cardSuits[suitIndex];
      this.value = cards.cardValues[valueIndex];
      this.longValue = cards.longCardValues[valueIndex];  //for use in css classes
      this.points = cards.getPoints(valueIndex);
      //this.isDealt = false; commenting this out; I didn't end up using it -- yet.
      this.handInWhich= '';
    };
    for (var i = 0, slen = this.cardSuits.length; i < slen; i++) {
      for (var j = 0, vlen = this.cardValues.length; j < vlen; j++) {
        this.deck.push(new Card(i,j));
      }
    }
  },

  getPoints: function(valueIndex) {
    if (valueIndex === 0) {
      return 11;
    } else if (valueIndex < 9) {
      return (valueIndex + 1);
    } else {
      return 10;
    }
  },

  shuffle: function(numberOfShuffles) { //TODO: how many card movements ensures a truly random deck?
    for (var i = 0; i < numberOfShuffles; i++) {
      this.moveACard();
    }
  },

  moveACard: function() {
    var firstPosition = this.randCard(); //position in cards.deck of card to remove
    var secondPosition = this.randCard(); //position at which it will be inserted
    while (secondPosition === firstPosition) { //checking to make sure the two positions are different!
      secondPosition = this.randCard();
    }
    var tempCard = this.deck.splice(firstPosition, 1)[0]; //removing the card...
    this.deck.splice(secondPosition, 0, tempCard); //...and inserting it at the new position
  },

  randCard: function() { //picks a random number between 0 and 51 to use as an index in cards.deck
    return Math.floor(Math.random() * 52);
  },

  initializeDeck: function() {
    this.makeDeck();
    this.shuffle(200);
  }
};
