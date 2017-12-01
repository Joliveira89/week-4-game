//Global variables need
$(document).ready(function() {

//audio clips for fun!
let opening = new Audio('assets/audio/01-prelude.mp3');
let lost = new Audio('assets/audio/evillaugh.swf copy.mp3');
let sword = new Audio('assets/audio/Swoosh 3-SoundBible.com-1573211927 copy.mp3');
let victory = new Audio('assets/audio/victory_fanfare copy.mp3');
let battle = new Audio('assets/audio/Final Fantasy VII - Fighting [HQ].mp3');
let yanp = new Audio('assets/audio/yanp.mp3');

//this is an array of playable characters
let characters = {
    'cloud': {
        name: 'cloud',
        health: 120,
        attack: 8,
        imageUrl: "assets/images/cloud.jpeg",
        enemyAttackBack: 15
    }, 
    'tifa': {
        name: 'tifa',
        health: 100,
        attack: 14,
        imageUrl: "assets/images/tifa.jpeg",
        enemyAttackBack: 5
    }, 
    'aeris': {
        name: 'aeris',
        health: 150,
        attack: 8,
        imageUrl: "assets/images/aeris.jpeg",
        enemyAttackBack: 20
    }, 
    'sephiroth': {
        name: 'sephiroth',
        health: 180,
        attack: 7,
        imageUrl: "assets/images/sephiroth.jpeg",
        enemyAttackBack: 20
    }
};

var currCharacter;
var defender;
var combatants = [];
var indexofSelChar;
var attackResult;
var turnCounter = 1;
var killCount = 0;

//opening theme music when page loads
opening.play();


var renderOne = function(character, renderArea, makeChar) {
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);
    if (makeChar == 'enemy') {
      $(charDiv).addClass('enemy');
    } else if (makeChar == 'defender') {
      defender = character;
      $(charDiv).addClass('target-enemy');
    }
  };

  var renderMessage = function(message) {
    var gameMesageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMesageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMesageSet.text('');
    }
  };

  var renderCharacters = function(charObj, areaRender) {

    if (areaRender == '#characters-section') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, '');
        }
      }
    }

    if (areaRender == '#selected-character') {
      $('#selected-character').prepend("Your Character");       
      renderOne(charObj, areaRender, '');
      $('#attack-button').css('visibility', 'visible');
    }

    if (areaRender == '#available-to-attack-section') {
        $('#available-to-attack-section').prepend("Choose Your Next Opponent");      
      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }

      $(document).on('click', '.enemy', function() {
        opening.pause();
        opening.currentTime = 0;
        battle.play();

        name = ($(this).data('name'));

        if ($('#defender').children().length === 0) {
          renderCharacters(name, '#defender');
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }

    if (areaRender == '#defender') {
      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {

        if (combatants[i].name == charObj) {
          $('#defender').append("Your selected opponent")
          renderOne(combatants[i], areaRender, 'defender');
        }
      }
    }

    if (areaRender == 'playerDamage') {
      $('#defender').empty();
      $('#defender').append("Your selected opponent")
      renderOne(charObj, '#defender', 'defender');
    }

    if (areaRender == 'enemyDamage') {
      $('#selected-character').empty();
      renderOne(charObj, '#selected-character', '');
    }

    if (areaRender == 'enemyDefeated') {
      $('#defender').empty();
      var gameStateMessage = "You have defated " + charObj.name + ", you can choose to fight another enemy.";
      renderMessage(gameStateMessage);
      sword.play();
    }
  };
  renderCharacters(characters, '#characters-section');
  $(document).on('click', '.character', function() {
    name = $(this).data('name');
    if (!currCharacter) {
      currCharacter = characters[name];
      for (var key in characters) {
        if (key != name) {
          combatants.push(characters[key]);
        }
      }
      $("#characters-section").hide();
      renderCharacters(currCharacter, '#selected-character');
      renderCharacters(combatants, '#available-to-attack-section');
    }
  });

  // Create functions to enable actions between objects.
  $("#attack-button").on("click", function() {
    if ($('#defender').children().length !== 0) {
      var attackMessage = "You attacked " + defender.name + " for " + (currCharacter.attack * turnCounter) + " damage.";
      renderMessage("clearMessage");
      //combat phase
      defender.health = defender.health - (currCharacter.attack * turnCounter);

      //this is the win condition
      if (defender.health > 0) {
        renderCharacters(defender, 'playerDamage');
        var counterAttackMessage = defender.name + " attacked you back for " + defender.enemyAttackBack + " damage.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        currCharacter.health = currCharacter.health - defender.enemyAttackBack;
        renderCharacters(currCharacter, 'enemyDamage');
        if (currCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You have been defeated...GAME OVER!!!");
          battle.pause();
          battle.currentTime = 0;
          lost.play();
          $("#attack-button").unbind("click");
        }
      } else {
        renderCharacters(defender, 'enemyDefeated');
        killCount++;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Won!!!! GAME OVER!!!");
          battle.pause();
          battle.currentTime = 0;
          victory.play();

        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("No enemy here.");
      yanp.play();
    }
  });

//Restarts
  var restartGame = function(inputEndGame) {
    //'Restart' button on click function
    var restart = $('<button class="btn">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };

});