console.log('game.js loaded');

var game = {
  $infoSection: $('#info-section'), //jQuery object for the div that displays game messages

  player: { //TODO: create a player constructor function to add multiple players. way down the road!
    name: "player",
    bankroll: 150,
    currentBet: 0,
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
    console.log('updating total...');
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
    console.log('dealer cards should now be visible');
    var playerTotal = this.player.cardTotal;
    var dealerTotal = this.dealer.cardTotal;
    var payout = this.views.makeCurrency(this.player.currentBet);

    if (this.dealer.blackjack) { //this code is hideous. TODO: refactor into separate function? Or
      var $p = $('<p>').text("Dealer wins."); //come up with a cleaner way?
      this.views.renderDisplay($p);
      this.loser();
    } else if (playerTotal > 21) {
      var $p = $('<p>').text("You've gone bust! Math hint: " + playerTotal + " is greater than 21.");
      this.views.renderDisplay($p);
      this.loser();
    } else if ((playerTotal < dealerTotal) && dealerTotal <= 21) {
      var $p = $('<p>').text("Sorry, you lose. Dealer total: " + dealerTotal + ", player total: " + playerTotal + ".");
      this.views.renderDisplay($p);
      this.loser();
    } else if (this.player.blackjack) {
      var blackjackPayout = this.views.makeCurrency(1.5 * this.player.currentBet);
      var $p = $('<p>').text("Congratulations! Blackjack pays out at 3 to 2 for " + blackjackPayout + ".");
      this.views.renderDisplay($p);
      this.player.bankroll += blackjackPayout;
      this.views.renderBankroll();
      this.resetHand();
    } else if (dealerTotal > 21) {
      var $p = $('<p>').text("Dealer has " + dealerTotal + " and has gone bust! Bet pays: " + payout + ".");
      this.views.renderDisplay($p);
      this.winner();
    } else if (playerTotal > dealerTotal) {
      var $p = $('<p>').text("You win! Your total: " + playerTotal + ", dealer total: " + dealerTotal + ". Payout is " + payout + ".");
      this.views.renderDisplay($p);
      this.winner();
    } else if (playerTotal === dealerTotal) {
      var $p = $('<p>').text("It's a push! Player and dealer are tied with " + playerTotal + " each. All bets refunded.");
      this.views.renderDisplay($p);
      this.resetHand();
    } else {
      var $p = $('<p>').text("UH, WHAT? this text should not be displaying. MAYDAY MAYDAY");
      this.views.renderDisplay($p);
      console.log('wtf, somehow we got into an endgame scenario that is not covered....');
    }
  },

  loser: function() {
    console.log('loser function running');
    this.player.bankroll -= game.player.currentBet;
    this.checkBankroll();
    this.views.renderBankroll();
    this.resetHand();
  },

  winner: function() {
    console.log('winner function running');
    this.player.bankroll += game.player.currentBet;
    this.views.renderBankroll();
    this.resetHand();
  },

  checkBankroll: function() {
    if (this.player.bankroll <= 0) {
      var $p = $('<p>').text("Uh-oh, you're out of cash... Press 'add money' to add more"); //TODO add more cash? RESET GAME?
      this.views.renderDisplay($p);
    }
  },

  beginGame: function() {
    var $start = $('#start');
    $start.on('click', function(eventObject) {
      $start.text('Deal');
      $('#current-bet-div, #bankroll-div, #hit, #stand').removeClass('hidden');
      game.views.renderBetView();
      game.views.renderBankroll();
      game.setBetButtons();
      $('#hit, #stand').removeAttr('disabled');
      game.$infoSection.html(''); //clears out the initial welcome message
      var $p = $('<p>').text('Please enter a bet to begin play.');
      game.views.renderDisplay($p);
      game.setAddMoneyButton();
      if (game.player.currentBet > 0) {
        game.setStandButton();
        game.setHitButton();
        cards.initializeDeck();
        game.initialDeal();
        var $p = $('<p>').text('Bet is ' + game.player.currentBet + '... Shuffling ... and dealing initial cards...  Do you want to hit or stand?');
        game.views.renderDisplay($p);
      }
    });
  },

  initialDeal: function() {
    //CODE HERE FOR HANDS AFTER THE FIRST ONE?
    this.player.hand = [];
    this.dealer.hand = [];
    for (var i = 0; i < 4; i++) { //deals the initial two cards to each player TODO: change if multiplayer
      if (i % 2) {
        game.dealACard(game.dealer); //2nd and 4th cards from top dealt to dealer
      } else {
        game.dealACard(game.player); //1st and 3rd cards from top dealt to player
      }
    }
  },

  views: {
    makeCurrency: function(num) {
      if (parseInt(num) === parseFloat(num)) { //i.e., num is an integer like 1525 -- returns $1,525
        return num.toLocaleString('eng', { style: 'currency', currency: 'USD'});
      } else {
      return num.toLocaleString('eng', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }, //i.e., num is a decimal, 1535.676 -- returns $1,535.68

    renderBetView: function() {
      $('#current-bet').text('Current bet: ' + this.makeCurrency(game.player.currentBet));
    },

    renderBankroll: function() {
      $('#bankroll').text('Bankroll: ' + this.makeCurrency(game.player.bankroll));
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

    unrenderCardViews: function() { //THIS IS UGLY TODO: CLEANUP
      $('#player-section').html('');
      $('#dealer-section').html('');
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
      var $p = $('<p>').text("Hitting ... here's another card."); //TODO I would like to display the new total
      game.views.renderDisplay($p);
      game.dealACard(game.player);
      console.log('hitting player. this should only run once per click.');
    });
  },

  setBetButtons: function() {
    var increment = 25;
  $('#increment-up').on('click', function(eventObject) {
      if (game.player.bankroll >= increment) {
        game.player.currentBet += increment;
        game.player.bankroll -= increment;
        console.log('bet: ' + game.player.currentBet + '; bankroll: ' + game.player.bankroll);
        game.views.renderBetView();
        game.views.renderBankroll();
      } else {
        var $p = $('<p>').text( "You cannot increase your bet any more. Select 'add money' to increase your bankroll, you high roller you.");
        game.views.renderDisplay($p);
      }
    });

    $('#increment-down').on('click', function(eventObject) {
      if (game.player.currentBet >= increment) {
        game.player.currentBet -= increment;
        game.player.bankroll += increment;
        console.log('bet: ' + game.player.currentBet + '; bankroll: ' + game.player.bankroll);
        game.views.renderBetView();
        game.views.renderBankroll();
      }
    });
  },

  setAddMoneyButton: function() {
    console.log('adding $');
    $('#add-money').on('click', function(eventObject) {
      alert('$1,000 has automatically been debited from your PayPal account.');
      game.player.bankroll += 1000;
      game.views.renderBankroll();
    });
  },

  resetHand: function() {
    var $start = $('#start')
    $start.text('Deal again');
    $start.on('click', function(eventObject) {
      $start.removeClass('hidden')
      $('.bet-button, #hit, #start').removeAttr('disabled');
      if (game.player.currentBet > game.player.bankroll) {
        game.player.currentBet = 0;
      }
      game.player.blackjack = false;
      game.dealer.blackjack = false;
      game.player.hand = [];
      game.dealer.hand =[];
      game.player.cardTotal = 0;
      game.dealer.cardTotal = 0;
      game.views.cardViews = [];
      game.views.unrenderCardViews();
      game.initialDeal(); //currently NOT resetting the deck between deals!
    })
  }
};

game.beginGame();
