console.log('game.js loaded');

var game = {
  player: {
    name: "player",
    bankroll: 1500,
    currentBet: 100, //TODO: CHANGE THIS TO ZERO AT THE START!
    cardTotal: 0,
    blackjack: false,
    hand: []
  },

  dealer: {
    name: "dealer",
    cardTotal: 0,
    blackjack: false,
    hand: []
  },

  dealACard: function(person) { //'person' will be 'player' or 'dealer' accordingly
    var dealtCard = cards.deck.splice(0,1)[0]; //removes card from the deck
    //note that this removes the TOPMOST card of the deck which means deck MUST be shuffled before calling this!
    dealtCard.isDealt = true;
    dealtCard.handInWhich = person;
    person.hand.push(dealtCard); //puts the dealt card into the person's hand
    this.updateTotal(person); //will update the total score of the person's hand
  },

  updateTotal: function(person) { //'person' will be 'player' or 'dealer' accordingly
      person.cardTotal = 0; //resets the total to zero
      var acesInHand = 0; //counter for number of aces in hand
      for (var i = 0; i < person.hand.length; i++) { //loops through each card in the hand
        var currentCard = person.hand[i];
        if (currentCard.points === 11) { //i.e., you've got an ace
          acesInHand++
        }
        person.cardTotal += currentCard.points;//increments the total up by the pointvalue of the card
      }
      for (var i = 0; i < acesInHand; i++) { //should only run if you have one or more aces
        if (person.currentTotal > 21) { //if having ace busts you, subtract 10; if you have more than one
          person.currentTotal -= 10; //ace this loop should run multiple times, once per ace
        }
      }
  },

  views: {
    cardViews: [],
    CardView: function(cardID) {
      this.card = cards.deck[cardID];
      this.$el = $('<div>');
      this.$el.addClass(this.card.suit);
      this.$el.addClass(this.card.longValue);
    },

    addcardView: function(person) {
      //TODO ENTER THIS FUNCTION
    },

    showCard: function(person) {
      var $section = $('#' + person);
      $section.append(person.hand[person.hand.length - 1])
    }
  },

  startGame: function() {
    $start = $('#start');
    $start.on('click', function(eventObject) {
      $start.addClass('hidden');
      $thingsToShow = $('#current-bet-div, #bankroll-div, #hit, #stand');
      $thingsToShow.removeClass('hidden');
      cards.initializeDeck();
      game.views.makeCardViews();
    });
  }
};

game.startGame();
cards.initializeDeck(); //TODO: remove these lines once coding complete!!
