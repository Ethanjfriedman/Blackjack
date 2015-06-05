console.log('game.js loaded');

var game = {
  $infoSection: $('#info-section'), //jQuery object for the div that displays game messages

  player: { //TODO: create a player constructor function to add multiple players. way down the road!
    name: "player",
    bankroll: 1500,
    currentBet: 100, //TODO: CHANGE THIS TO ZERO AT THE START!
    cardTotal: 0,
    blackjack: false,
    hand: [],
    secondHand: [], //TODO: this will hold the split hand if/when the 'split' ability is implemented
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
    dealtCard.isDealt = true; //TODO: see if this property is necessary later!!
    dealtCard.handInWhich = person.name;
    person.hand.push(dealtCard); //puts the dealt card into the person's hand //checks to see if there's a blackjack (sorta obviously)
    this.updateTotal(person); //will update the total score of the person's hand
    this.checkForBlackjack(person); //does exactly what you might think: checks for blackjack
    this.views.addCardView(person) //will create a new cardView for this card
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
      if (person.cardTotal > 21) { //if having ace busts you, subtract 10; if you have more than one ace,
        person.cardTotal -= 10; // this loop should run multiple times, once per ace. each time it will check
        console.log(person.name + ' has an ace! checking totals');
      } //to see if total > 21, if so it will subtract 10 (counting that ace as 1 instead of 11). It will do this
    } //multiple times if you have multiple aces, each time checking to see if it has to subtract 10.
    if (person.cardTotal > 21) {
      this.endOfHand();
    }
  },

  checkForBlackjack: function(person) {
    //console.log('checking for blackjack...' + 'hand-length ' + person.hand.length + '; point-total ' + person.cardTotal);
    if (person.hand.length === 2 && person.cardTotal === 21) { //if you have 2 cards and 21 points, then you've
      person.blackjack = true; //got blackjack
      if (person.name === 'dealer') { //if dealer has blackjack hand is over!
        var $p = $('<p>').text('Dealer has blackjack!');
        this.views.renderDisplay($p);
        this.endOfHand(); //end the hand
      } else if (this.dealer.blackjack === false && this.dealer.hand.length >= 2) {
        var $p = $('<p>').text('You have blackjack!');
        this.views.renderDisplay($p);
        this.endOfHand(); //conditional above in case we're checking the player for blackjack before dealer has both cards!
      } //this means player has blackjack AND dealer does not.
    }
  },

  stand: function() {
    $('#hit, #stand').attr('disabled', 'true') //disables the 'hit' and stand buttons so you can't hit after choosing to stand
    while (this.dealer.cardTotal < 16) { //dealer stands on 17 and up, hits on 16 and under
      var $p = $('<p>').text("Dealer is taking another card...");
      this.views.renderDisplay($p);
      this.dealACard(this.dealer); //adds a card to the dealer's hand
    }
    var $pNew = $('<p>').text("Dealer is standing with " + this.dealer.hand.length + " cards. Let's see what they are.");
    this.views.renderDisplay($pNew);
    this.endOfHand(); //dealer must have 17 or more--let's end the hand now.
  },

  endOfHand: function() {
    console.log('running the end of hand function now. player total ' + this.player.cardTotal + ", dealer total " + this.dealer.cardTotal);
    $('#hit, #stand').attr('disabled', 'true'); //disables the 'hit' and 'stand' buttons
    $('.dealer-card').removeClass('card-back'); //reveals hidden dealer cards
    var playerTotal = this.player.cardTotal;
    var dealerTotal = this.dealer.cardTotal;
    var payout = this.player.currentBet;

    if (this.dealer.blackjack) {
      var $p = $('<p>').text("Dealer wins.");
      this.views.renderDisplay($p);
      this.loser();
    } else if (playerTotal > 21) {
      var $p = $('<p>').text("You've gone bust! Math hint: " + playerTotal + " is greater than 21.");
      this.views.renderDisplay($p);
      this.loser();
    } else if (playerTotal < dealerTotal) {
      var $p = $('<p>').text("Sorry, you lose. Dealer total: " + dealerTotal + ", player total: " + playerTotal);
      this.views.renderDisplay($p);
      this.loser();
    } else if (this.player.blackjack) {
      var blackjackPayout = 1.5 * this.player.currentBet;
      var $p = $('<p>').text("Congratulations! Blackjack pays out at 3 to 2 for " + blackjackPayout);
      this.views.renderDisplay($p);
      this.player.bankroll += blackjackPayout;
      this.resetHand();
    } else if (dealerTotal > 21) {
      var $p = $('<p>').text("Dealer has " + dealerTotal + " and has gone bust! Bet pays: " + payout);
      this.views.renderDisplay($p);
      this.winner();
    } else if (playerTotal > dealerTotal) {
      var $p = $('<p>').text("You win! Your total: " + playerTotal + ", dealer total: " + dealerTotal + ". Payout is " + payout);
      this.views.renderDisplay($p);
      this.winner();
    } else if (playerTotal === dealerTotal) {
      var $p = $('<p>').text("It's a push! Player and dealer are tied with " + playerTotal + " each. All bets refunded");
      this.views.renderDisplay($p);
      this.resetHand();
    } else {
      var $p = $('<p>').text("UH, WHAT? this text should not be displaying. MAYDAY MAYDAY");
      this.views.renderDisplay($p);
      console.log('wtf, somehow we got into an endgame scenario that is not covered....');
    }
  },

  loser: function() {
    this.player.bankroll -= game.player.currentBet;
    this.checkBankroll();
    this.resetHand();
  },

  winner: function() {
    this.player.bankroll += game.player.currentBet;
    this.resetHand();
  },

  checkBankroll: function() {
    if (this.player.bankroll <= 0) {
      var $p = $('<p>').text("Uh-oh, you're out of cash... Sorry! game over"); //TODO add more cash? RESET GAME?
      this.views.renderDisplay($p);
    }
  },

  beginGame: function() {
    var $start = $('#start');
    $start.on('click', function(eventObject) {
      $start.addClass('hidden'); //start off by hiding start buttons and revealing other 'control' elements
      $thingsToShow = $('#current-bet-div, #bankroll-div, #hit, #stand');
      $thingsToShow.removeClass('hidden');
      $('#hit, #stand').removeAttr('disabled');
      cards.initializeDeck();
      for (var i = 0; i < 4; i++) { //deals the initial two cards to each player
        if (i % 2) {
          game.dealACard(game.dealer); //2nd and 4th cards from top dealt to dealer
        } else {
          game.dealACard(game.player); //1st and 3rd cards from top dealt to player
        }
      }
      game.$infoSection.html(''); //clears out initial welcome message
      var $p = $('<p>').text('Shuffling ... and dealing initial cards...  Do you want to hit or stand?');
      game.views.renderDisplay($p);
      game.setStandButton();
      game.setHitButton();
    });
  },

  views: {
    betView: {
      bet: game.player.currentBet,
      renderBetView: function() {
        var $betDisplay = $('#current-bet');
        $betDisplay.text('$')
      }
    },
    cardViews: [],
    CardView: function(person, cardID) { //cardView constructor function. currently works one card at a time on newly dealt cards
      this.card = person.hand[cardID];
      this.$el = $('<div>').addClass('card').addClass((person.name + '-card'));
      if (person.name === 'dealer' && cardID > 0) { //all dealer cards after the first are face-down
        this.$el.addClass('card-back');
      }
      this.$el.addClass(this.card.suit);
      this.$el.addClass(this.card.longValue);
    },

    addCardView: function(person) { //should create a cardView for each card (as it's dealt) to the DOM
      this.cardViews.push(new this.CardView(person, person.hand.length - 1));
      this.renderCard(this.cardViews[this.cardViews.length - 1]);
    },

    renderCard: function(cardView) { //adds the card to the DOM
      var $section = $('#' + cardView.card.handInWhich + '-section');
      $section.append(cardView.$el);
      //console.log('Rendering card ' + cardView.card.longValue + ' of ' + cardView.card.suit);
    },

    renderDisplay: function(message) {
      game.$infoSection.prepend(message); //this function sends messages to the central info-section div
      $ps = $('#info-section p');
      if ($ps.length > 3) {
        $ps[$ps.length - 1].remove();
      }
    },
  },

  setStandButton: function() {
    var $stand = $('#stand');
    $stand.removeAttr('disabled');
    $stand.on('click', function(eventObject) {
      var $p = $('<p>').text("OK, you're standing put... Dealer is now checking his cards.");
      game.views.renderDisplay($p);
      game.stand();
    });
  },

  setHitButton: function() {
    var $hit = $('#hit'); //heh heh...  what a $hitty variable...
    $hit.removeAttr('disabled');
    $hit.on('click', function(eventObject) {
      var $p = $('<p>').text("Hitting ... here's another card.");
      game.views.renderDisplay($p);
      game.dealACard(game.player);
    });
  },

  resetHand: function() {
    var $start = $('#start')
    $start.text('Deal again');
    $start.removeClass('hidden')
    $('.bet-button, #hit, #start').removeAttr('disabled');
    //all sorts of shit goes in here!!!
    //TODO: stuff that needs to be reset when ending a hand: player.blackjack, dealer.blackjack,
    //player.currentBet(?)--way to keep bet going(?) player.hand, dealer.hand (if applicable: player.secondHand)
    //player.cardTotal, dealer.cardTotal, views.cardViews, buttons need to be re-set(or do they? maybe not)
    //leave existing buttons and add deal next hand! maybe make this the start button, just change the text
    //also deck needs to be re-initialized. (empty out cards.deck first)
    //also remove disabled class from all buttons....

    //ALSO: SHOULD WE PERMIT CARD COUNTING BY ** NOT ** RESETTING THE DECK? IF SO, MAYBE MAKE A 4-, 6- OR 8-DECK GAME?
  }
};

game.beginGame();
