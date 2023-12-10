const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

$(document).ready(function () {
  $(".buttons button").click(function () {
    const selectedLevel = parseInt($(this).data("level"));
    $("#levleSelect").hide();
    $("#game").show();
    startGame(selectedLevel);
  });

  function startGame(level) {
    var getUrlParameter = function getUrlParameter(sParam) {
      var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

      for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");

        if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
        }
      }
    };

    //var mkw = getUrlParameter('mkw');

    var winDiv = $("#win");
    var container = document.getElementById("container");
    var canvas = document.getElementById("background");
    canvasSize = 600;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    var c = canvas.getContext("2d");

    window.addEventListener("resize", function (event) {
      canvasWidth = container.offsetWidth;
      if (canvasWidth > canvasSize) canvasWidth = canvasSize;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    });

    var centerX = canvas.width / 2,
      centerY = canvas.height / 2,
      run = true,
      healthDiv = $("#health"),
      score = 0,
      scoreDiv = $("#score"),
      mainBackgroundColor = "rgba(0,0,0)",
      mainBorderColor = "#ffffff",
      count = 300,
      map = [],
      numOfPlayers = 1,
      numberOfLoops = 3,
      playerKeys = [
        { right: 39, down: 40, left: 37, up: 38 },
        { right: 68, down: 83, left: 65, up: 87 },
        { right: 76, down: 75, left: 74, up: 73 },
        { right: 102, down: 101, left: 100, up: 104 }
      ];

    var isUp, isLeft, isRight, isDown, isShift, lastDirection;

    function Ball(keys) {
      this.id = players.length + 1;
      this.width = 10;
      this.height = this.width;
      //this.posX = canvasSize / 2 - this.width/2;
      //this.posY = canvasSize / numOfPlayers  * (this.id - 0.5);
      this.posX = canvasSize / 2 - numOfPlayers * (this.id - 0.5) * this.width;
      this.posY = 80;
      this.defaultColor = randomColor();
      this.color = this.defaultColor;
      this.acc = 0.15;
      this.dec = 0.075;
      this.speedX = 0;
      this.speedY = 0;
      this.right = keys.right;
      this.down = keys.down;
      this.left = keys.left;
      this.up = keys.up;
      this.health = 100;
      this.healthDiv = $("<span>", { text: this.health });
      this.delay = 100;
      this.delayAnimation = 0;
      this.loop = -1;
      this.onLine = false;

      $("<p>", { html: "Player " + this.id + "<br>" })
        .append(this.healthDiv)
        .appendTo(healthDiv);

      function randomColor() {
        var randomR = Math.floor(Math.random() * 255);
        var randomG = Math.floor(Math.random() * 255);
        var randomB = Math.floor(Math.random() * 255);
        return "rgb(" + randomR + "," + randomG + "," + randomB + ")";
      }

      this.move = function () {
        this.makeAstep();
        this.draw();
        this.drawHealthTag();
      };

      this.makeAstep = function () {
        if (!map[this.left] && !map[this.right] && this.speedX !== 0) {
          this.speedX = this.speedX > 0 ? (this.speedX -= this.dec) : (this.speedX += this.dec);
        }

        if (map[this.left]) {
          this.speedX -= this.acc;
          //lastDirection = 'left';
        }

        if (map[this.right]) {
          this.speedX += this.acc;
          //lastDirection = 'right';
        }

        if (!map[this.up] && !map[this.down] && this.speedY !== 0) {
          this.speedY = this.speedY > 0 ? (this.speedY -= this.dec) : (this.speedY += this.dec);
        }

        if (map[this.up]) {
          this.speedY -= this.acc;
          //lastDirection = 'up';
        }

        if (map[this.down]) {
          this.speedY += this.acc;
          //lastDirection = 'down';
        }

        if (this.checkBoundaries()) {
          this.posX += this.speedX;
          this.posY += this.speedY;
        }
      };

      this.checkBoundaries = function () {
        if (this.posX - this.width + this.speedX < 0) {
          this.posX = this.width;
          this.speedX = 0;
          this.speedY = 0;
          return false;
        }
        if (this.posX + this.width + this.speedX > canvasSize) {
          this.posX = canvasSize - this.width;
          this.speedX = 0;
          this.speedY = 0;
          return false;
        }
        if (this.posY - this.height + this.speedY < 0) {
          this.posY = this.height;
          this.speedX = 0;
          this.speedY = 0;
          return false;
        }
        if (this.posY + this.height + this.speedY > canvasSize) {
          this.posY = canvasSize - this.height;
          this.speedX = 0;
          this.speedY = 0;
          return false;
        }
        return true;
      };

      this.draw = function () {
        c.beginPath();
        c.arc(this.posX, this.posY, this.width, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
      };

      this.showHealthTag = function () {
        this.delayAnimation = this.delay;
      };

      this.drawHealthTag = function () {
        if (this.delayAnimation > 0) {
          c.beginPath();
          c.font = "16px Arial";
          c.fillStyle = "rgba(255,255,255," + this.delayAnimation / 100 + ")";
          c.textAlign = "center";
          c.fillText(this.loop + "/" + numberOfLoops, this.posX, this.posY - this.height - 10);
        }
        this.delayAnimation--;
      };
    }

    /*function Enemy(posX = 0, posY = 0, width = 3, speedX = 1, speedY = 1, angle = 35) {
		this.posX = posX;
		this.posY = posY;
		this.width = width;
		this.height = this.width;
		this.speedX = speedX;
		this.speedY = speedY;
		this.color = 'rgba(255,255,255,0.75)';
		this.angle = angle;
		
		this.move = function() {
			this.posX += cosDegrees(this.angle)*this.speedX;
			this.posY += sinDegrees(this.angle)*this.speedY;
			
			this.checkBoundaries();
			this.draw();
		}
		
		this.draw = function() {
			c.beginPath();
			c.arc(this.posX, this.posY, this.width, 0, 2*Math.PI);
			c.fillStyle = this.color;
			c.fill();
		}
		
		this.checkBoundaries = function() {
			if(this.posX - this.width > canvasSize) {
				this.posX = -this.width;
			}
			if(this.posY - this.height > canvasSize) {
				this.posY = -this.height;
			}
			if(this.posX + this.width < 0) {
				this.posX = canvasSize + this.width/2;
			}
			if(this.posY + this.height < 0) {
				this.posY = canvasSize + this.height/2;
			}
		}
	}*/

    function Wall(posX = 0, posY = 0, width = 20, height = 40) {
      this.posX = posX;
      this.posY = posY;
      this.width = width;
      this.height = height;
      this.color = "rgba(139,195,74,1)";

      this.draw = function () {
        c.beginPath();
        c.rect(this.posX, this.posY, this.width, this.height);
        c.fillStyle = this.color;
        c.fill();
      };
    }

    function sinDegrees(angle) {
      return Math.sin((angle / 180) * Math.PI);
    }
    function cosDegrees(angle) {
      return Math.cos((angle / 180) * Math.PI);
    }

    function circleColision(circle1, circle2) {
      var dx = circle1.posX - circle2.posX;
      var dy = circle1.posY - circle2.posY;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < circle1.width + circle2.width) {
        return true;
      }
      return false;
    }

    function RectCircleColliding(circle, rect) {
      var cx = circle.posX,
        cy = circle.posY,
        radius = circle.width,
        rx = rect.posX,
        ry = rect.posY,
        rw = rect.width,
        rh = rect.height;

      var testX = cx;
      var testY = cy;

      // which edge is closest?
      if (cx < rx) testX = rx; // test left edge
      else if (cx > rx + rw) testX = rx + rw; // right edge
      if (cy < ry) testY = ry; // top edge
      else if (cy > ry + rh) testY = ry + rh; // bottom edge

      // get distance from closest edges
      var distX = cx - testX;
      var distY = cy - testY;
      var distance = Math.sqrt(distX * distX + distY * distY);
      lastHitX = distX;
      lastHitY = distY;
      // if the distance is less than the radius, collision!
      if (distance <= radius) {
        return true;
      }
      return false;
    }

    function Rect(posX = centerX, posY = 30, width = 8, height = 90) {
      this.posX = posX;
      this.posY = posY;
      this.width = width;
      this.height = height;
      this.color = "white";

      this.draw = function () {
        c.beginPath();
        c.rect(this.posX, this.posY, this.width, this.height);
        c.fillStyle = this.color;
        c.fill();
      };
    }

    if (typeof level !== "undefined" && level > 0 && level <= 4) {
      numOfPlayers = level;
      console.log(">> level: " + numOfPlayers);

      var players = [];
      for (var j = 0; j < numOfPlayers; j++) {
        players.push(new Ball(playerKeys[j]));
      }

      var finishLine = new Rect();

      var walls = [];
      createWalls();

      initilaize();

      function createWalls() {
        var wallSize = 30;
        var boxSize = 60;

        walls.push(new Wall(0, 0, canvas.width, wallSize));
        walls.push(new Wall(0, canvas.height - wallSize, canvas.width, wallSize));
        walls.push(new Wall(0, 0, wallSize, canvas.height));
        walls.push(new Wall(canvas.width - wallSize, 0, wallSize, canvas.height));

        walls.push(new Wall(canvas.width - 480, canvas.height * 0.25 - boxSize / 2, 280, boxSize));
        walls.push(new Wall(canvas.width - 480, canvas.height * 0.75 - boxSize / 2, 280, boxSize));
        walls.push(new Wall(0, centerY - boxSize / 2, 280, boxSize));
        walls.push(
          new Wall(canvas.width - 200, canvas.height * 0.25 - boxSize / 2, boxSize, canvas.height * 0.5 + boxSize)
        );
      }

      function initilaize() {
        clearBoard();
        drawFrame();
        finishLine.draw();

        loop();
      }

      function clearBoard() {
        c.beginPath();
        c.rect(0, 0, canvas.width, canvas.height);
        c.fillStyle = "rgba(0,0,0,0.2)";
        //c.fillStyle = mainBackgroundColor;
        c.strokeStyle = mainBorderColor;
        c.fill();
        c.stroke();
      }

      function gameStart() {
        c.beginPath();
        c.font = (100 - (count % 100)) * 5 + "px Arial";
        console.log(count % 100);
        c.fillStyle = "rgba(255,0,0," + (count % 100) / 80 + ")";
        c.textAlign = "center";
        c.fillText(1 + parseInt(count / 100), centerX, centerY);
      }

      function drawInfo() {
        c.beginPath();
        c.font = "16px Arial";
        c.fillStyle = "white";
        c.textAlign = "center";
        for (var j = 0; j < players.length; j++) {
          c.fillText("P" + players[j].id, players[j].posX, players[j].posY - players[j].height - 10);
        }
      }

      function drawFrame() {
        finishLine.draw();
        for (var i = 0; i < walls.length; i++) walls[i].draw();
        for (var j = 0; j < players.length; j++) players[j].move();
      }

      function loop() {
        if (run) requestAnimationFrame(loop);

        clearBoard();

        drawFrame();
        for (var j = 0; j < players.length; j++) {
          players[j].color = players[j].defaultColor;
        }
        mainBorderColor = "#ffffff";
        mainBackgroundColor = "rgba(0,0,0)";

        checkPlayerCollisions();
        checkWallHits();
        checkIfLoop();
        addScore();

        if (count <= 0) {
          startListening();
        } else {
          gameStart();
          drawInfo();
          count--;
        }
      }

      function addScore() {
        score += 10;
        scoreDiv.text(numberWithCommas(score));
      }

      function checkIfLoop() {
        for (var i = 0; i < players.length; i++) {
          if (RectCircleColliding(players[i], finishLine)) {
            players[i].onLine = true;
          } else if (players[i].onLine == true) {
            if (players[i].loop >= 0) players[i].showHealthTag();
            players[i].loop += 1;
            players[i].onLine = false;
            checkRaceCompleate(players[i]);
          }
        }
      }

      function checkPlayerCollisions() {
        if (players.length > 1) {
          for (var i = 0; i < players.length; i++) {
            for (var j = i + 1; j < players.length; j++) {
              if (circleColision(players[i], players[j])) {
                players[j].speedX = 0;
                players[j].speedY = 0;
                players[i].speedX = 0;
                players[i].speedY = 0;
              }
            }
          }
        }
      }

      function checkWallHits() {
        for (var i = 0; i < walls.length; i++) {
          for (var j = 0; j < players.length; j++) {
            if (RectCircleColliding(players[j], walls[i])) {
              players[j].speedX = 0;
              players[j].speedY = 0;
            }
          }
        }
      }

      function removePlayer(player) {
        var index = player.id - 1;
        if (index > -1) {
          players.splice(index, 1);
        }
        players.length == 0 ? player.healthDiv.text("Winner!") : player.healthDiv.text("Dead");

        for (var j = index; j < players.length; j++) {
          players[j].id--;
        }
      }

      function GotHit(player) {
        player.health--;
        if (player.health >= 0) {
          player.healthDiv.text(player.health);
          console.log("Player" + player.id + ': "Ouch!"');
          player.color = "red";
          mainBorderColor = "red";
          mainBackgroundColor = "rgba(100,25,25)";
          player.showHealthTag();
        } else {
          removePlayer(player);
          if (CheckIfAllDied()) gameOver();
        }
      }

      function CheckIfAllDied() {
        if (players.length == 0) return true;
        return false;
      }

      function checkRaceCompleate(player) {
        if (player.loop == numberOfLoops) gameOver();
      }

      function gameOver() {
        run = false;
        console.error("Game Over");
      }

      function drawGotPoint(x, reyct) {
        c.beginPath();
        c.font = "16px Arial";
        c.textAlign = "center";
        c.fillStyle = "white";
        c.fillText("+1", this.posX, this.posY - this.width - 10);
        c.fillStyle = this.color;
        c.fill();
      }

      function startListening() {
        document.addEventListener("keydown", onKeyPress);
        document.addEventListener("keyup", onKeyPress);
      }

      function onKeyPress(e) {
        e = e || event;
        map[e.keyCode] = e.type == "keydown";
      }
    } else {
      $("body").html("level not defined or currect. Please select how many players with level 1-4");
    }
  }
});
