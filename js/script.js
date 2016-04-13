var chessboard = document.getElementById("chessboard");
var ctx = chessboard.getContext("2d");

var row = 15; // chessboard.width > gap * row
var gap = 30;
var goRadius = 13;
var offset = (chessboard.width - (row - 1) * gap) / 2;
var GOTYPE = {
  NOGO: 0,
  BLACK: 1,
  WHITE: -1
}
var nextGoType = GOTYPE.BLACK;
var chessboardMatrix = [];
for (var i = 0; i < row; i++) {
  chessboardMatrix[i] = []
  for (var j = 0; j < row; j++) {
    chessboardMatrix[i][j] = GOTYPE.NOGO;
  }
}
var MODE = {
  VSHUMAN: 0,
  HUMANFIRST: 1,
  AIFIRST: 2,
}

var playMode = MODE.HUMANFIRST;
var over = true;
switch (playMode) {
  case MODE.HUMANFIRST:
    var playerGoType = GOTYPE.BLACK;
    var computerGoType = GOTYPE.WHITE;
    break;
  case MODE.AIFIRST:
    var playerGoType = GOTYPE.WHITE;
    var computerGoType = GOTYPE.BLACK;
    break;
  // case MODE.VSHUMAN:
  //   var playerOneGoType = GOTYPE.WHITE;
  //   var playerTwoGoType = GOTYPE.BLACK;
  //   break;
  default:
    var playerGoType = GOTYPE.BLACK;
    var computerGoType = GOTYPE.WHITE;
    break;
}

// winning matrix
var win = [];
var count = 0;
// initial winning matrix
for (var i = 0; i < row; i++) {
  win[i] = [];
  for (var j = 0; j < row; j++) {
    win[i][j] = [];
  }
}
// row winning
// 1st inner iteration
// win[0][0][0] = true -> (0, 0) and the 0th win approach
// win[0][1][0] = true -> (0, 1) and the 0th win approach
// win[0][2][0] = true -> (0, 2) and the 0th win approach
// win[0][3][0] = true -> (0, 3) and the 0th win approach
// win[0][4][0] = true -> (0, 4) and the 0th win approach
// 2nd inner iteration
// win[0][1][1] = true -> (0, 1) and the 1th win approach
// win[0][2][1] = true -> (0, 2) and the 1th win approach
// win[0][3][1] = true -> (0, 3) and the 1th win approach
// win[0][4][1] = true -> (0, 4) and the 1th win approach
// win[0][5][1] = true -> (0, 5) and the 1th win approach
for (var i = 0; i < row; i++) {
  for (var j = 0; j < row - 4; j++) {
    for (var k = 0; k < 5; k++) {
      win[i][j + k][count] = true;
    }
    count++;
  }
}
// row winning
for (var i = 0; i < row; i++) {
  for (var j = 0; j < row - 4; j++) {
    for (var k = 0; k < 5; k++) {
      win[j + k][i][count] = true;
    }
    count++;
  }
}
// Diagonal winning
for (var i = 0; i < row - 4; i++) {
  for (var j = 0; j < row - 4; j++) {
    for (var k = 0; k < 5; k++) {
      win[i + k][j + k][count] = true;
    }
    count++;
  }
}
for (var i = 0; i < row - 4; i++) {
  for (var j = row - 1; j > 3; j--) {
    for (var k = 0; k < 5; k++) {
      win[i + k][j - k][count] = true;
    }
    count++;
  }
}

// winning score
var blackWin = [];
var whiteWin = [];
for (var k = 0; k < count; k++) {
  blackWin[k] = 0;
  whiteWin[k] = 0;
}

var stepHistory = {
  redo_list: [],
  undo_list: [],
  saveState: function(steps, list, keep_redo) {
    keep_redo = keep_redo || false;
    if(!keep_redo) {
      this.redo_list = [];
    }
    (list || this.undo_list).push(steps);
    console.log(this.undo_list.length + ', ' + this.redo_list.length);
  },
  undo: function() {
    this.restoreState(this.undo_list, this.redo_list);
    console.log(this.undo_list.length + ', ' + this.redo_list.length);
  },
  redo: function() {
    this.restoreState(this.redo_list, this.undo_list);
    console.log(this.undo_list.length + ', ' + this.redo_list.length);
  },
  restoreState: function(pop, push) {
    if(pop.length) {
      this.saveState(canvas, push, true);
      var restore_state = pop.pop();
      var img = document.createElement('img');
      img.src = restore_state;
      // var img = new Element('img', {'src':restore_state});
      // img.crossOrigin = "*";
      img.onload = function() {
        ctx.clearRect(0, 0, chessboard.width, chessboard.width);
        ctx.drawImage(img, 0, 0, chessboard.width, chessboard.width, 0, 0, chessboard.width, chessboard.width);
      }
    }
}
}

var canvasHistory = {
  redo_list: [],
  undo_list: [],
  saveState: function(canvas, list, keep_redo) {
    keep_redo = keep_redo || false;
    if(!keep_redo) {
      this.redo_list = [];
    }

    (list || this.undo_list).push(canvas.toDataURL());
    console.log(this.undo_list.length + ', ' + this.redo_list.length);
  },
  undo: function(canvas, ctx) {
    this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
    console.log(this.undo_list.length + ', ' + this.redo_list.length);
  },
  redo: function(canvas, ctx) {
    this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
    console.log(this.undo_list.length + ', ' + this.redo_list.length);
  },
  restoreState: function(canvas, ctx, pop, push) {
    if(pop.length) {
      // this.saveState(canvas, push, true);
      var currentState = canvas.toDataURL();
      var restore_state = pop.pop();
      if (restore_state === currentState) {
        push.push(restore_state);
        restore_state = pop.pop();
      }
      push.push(restore_state);
      var img = document.createElement('img');
      img.src = restore_state;
      // var img = new Element('img', {'src':restore_state});
      // img.crossOrigin = "*";
      img.onload = function() {
        ctx.clearRect(0, 0, chessboard.width, chessboard.width);
        ctx.drawImage(img, 0, 0, chessboard.width, chessboard.width, 0, 0, chessboard.width, chessboard.width);
      }
    }
  }
}

var initialChessboard;
var bgImage = new Image(chessboard.width, chessboard.width);
bgImage.src = "./img/bg.png";
// bgImage.crossOrigin = "*";
bgImage.onload = function(event) {
  ctx.drawImage(bgImage, 0, 0, chessboard.width, chessboard.width);
  drawChessBoard();
  initialChessboard = chessboard.toDataURL();
}

chessboard.onclick = function(event) {
  if (over) { return; }
  if (nextGoType != playerGoType && playMode != MODE.VSHUMAN) {
    return;
  }
  var r = Math.floor(event.offsetX / gap);
  var c = Math.floor(event.offsetY / gap);
  if ((Math.abs(event.offsetX  - (15 + r * gap)) <= 10) && (Math.abs(event.offsetY  - (15 + c * gap)) <= 10)) {
    if (chessboardMatrix[r][c] == GOTYPE.NOGO) {
      if (canvasHistory.undo_list[canvasHistory.undo_list.length - 1] != chessboard.toDataURL()) {
        canvasHistory.saveState(chessboard, canvasHistory.undo_list, true);
      }
      drawStep(r, c);
      afterStep(r, c);
      if (playMode == MODE.VSHUMAN) {
        canvasHistory.saveState(chessboard, canvasHistory.undo_list, true);
      }
      if (!over && playMode != MODE.VSHUMAN) {
        computerAI();
      }
    }
  }
}

function computerAI() {
  var playerScore = [];
  var computerScore = [];
  var max = 0;
  var dx = 0, dy = 0;

  for (var i = 0; i < row; i++) {
    playerScore[i] = [];
    computerScore[i] = [];
    for (var j = 0; j < row; j++) {
      playerScore[i][j] = 0;
      computerScore[i][j] = 0;
    }
  }

  if (computerGoType === GOTYPE.WHITE) {
    var playerWin = blackWin;
    var computerWin = whiteWin;
  } else {
    var playerWin = whiteWin;
    var computerWin = blackWin;
  }

  for (var i = 0; i < row; i++) {
    for (var j = 0; j < row; j++) {
      if (chessboardMatrix[i][j] === GOTYPE.NOGO) {
        for (var k = 0; k < count; k++) {
          if (win[i][j][k]) {
            if (playerWin[k] === 1 ) {
              playerScore[i][j] += 200;
            } else if (playerWin[k] === 2) {
              playerScore[i][j] += 400;
            } else if (playerWin[k] === 3) {
              playerScore[i][j] += 2000;
            } else if (playerWin[k] === 4) {
              playerScore[i][j] += 10000;
            }

            if (computerWin[k] === 1 ) {
              computerScore[i][j] += 220;
            } else if (computerWin[k] === 2) {
              computerScore[i][j] += 420;
            } else if (computerWin[k] === 3) {
              computerScore[i][j] += 2100;
            } else if (computerWin[k] === 4) {
              computerScore[i][j] += 20000;
            }
          }
        }
      }
      if (playerScore[i][j] > max) {
        max = playerScore[i][j];
        dx = i;
        dy = j;
      } else if (playerScore[i][j] === max) {
        if (computerScore[i][j] > computerScore[dx][dy]) {
          dx = i;
          dy = j;
        }
      }
      if (computerScore[i][j] > max) {
        max = computerScore[i][j];
        dx = i;
        dy = j;
      } else if (computerScore[i][j] === max) {
        if (playerScore[i][j] > playerScore[dx][dy]) {
          dx = i;
          dy = j;
        }
      }
    }
  }
  drawStep(dx, dy);
  afterStep(dx, dy);
  canvasHistory.saveState(chessboard, canvasHistory.undo_list, true);
}

function drawChessBoard() {
  ctx.strokeStyle = "#BFBFBF";
  for (var i = 0; i < gap; i++) {
    ctx.beginPath();
    ctx.moveTo(offset, offset + gap * i);
    ctx.lineTo(chessboard.width - offset , offset + gap * i);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offset + gap * i, offset);
    ctx.lineTo(offset + gap * i, chessboard.width - offset);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawStep(r, c) {
  ctx.beginPath();
  ctx.arc(row + r * gap, row + c * gap, goRadius, 0, 2 * Math.PI);
  var gradient = ctx.createRadialGradient(row + r * gap + 2, row + c * gap - 2, goRadius * 0.8, row + r * gap + 2, row + c * gap - 2, 0);

  if (nextGoType === GOTYPE.BLACK) {
    gradient.addColorStop(0, "#0A0A0A");
    gradient.addColorStop(1, "#636766");
  } else {
    gradient.addColorStop(0, "#D1D1D1");
    gradient.addColorStop(1, "#F9F9F9");
  }

  ctx.fillStyle = gradient;
  ctx.fill();
}

function afterStep(r, c) {
  for (var k = 0; k < count; k++) {
    if (win[r][c][k]) {
      if (nextGoType === GOTYPE.BLACK) {
        blackWin[k]++;
        whiteWin[k] = 6;
        if (blackWin[k] === 5) {
          // window.alert("Black Win!");
          var message = document.getElementById("message");
          message.innerHTML = "Black Win!"
          over = true;
        }
      } else {
        whiteWin[k]++;
        blackWin[k] = 6;
        if (whiteWin[k] === 5) {
          // window.alert("White Win!");
          var message = document.getElementById("message");
          message.innerHTML = "White Win!"
          over = true;
        }
      }
    }
  }

  if (nextGoType === GOTYPE.BLACK) {
    chessboardMatrix[r][c] = GOTYPE.BLACK;
    nextGoType = GOTYPE.WHITE;
  } else {
    chessboardMatrix[r][c] = GOTYPE.WHITE;
    nextGoType = GOTYPE.BLACK;
  }
}

function reset() {
  nextGoType = GOTYPE.BLACK;
  chessboardMatrix = [];
  for (var i = 0; i < row; i++) {
    chessboardMatrix[i] = []
    for (var j = 0; j < row; j++) {
      chessboardMatrix[i][j] = GOTYPE.NOGO;
    }
  }
  switch (playMode) {
    case MODE.HUMANFIRST:
      playerGoType = GOTYPE.BLACK;
      computerGoType = GOTYPE.WHITE;
      break;
    case MODE.AIFIRST:
      playerGoType = GOTYPE.WHITE;
      computerGoType = GOTYPE.BLACK;
      break;
    default:
      playerGoType = GOTYPE.BLACK;
      computerGoType = GOTYPE.WHITE;
      break;
  }
  blackWin = [];
  whiteWin = [];
  for (var k = 0; k < count; k++) {
    blackWin[k] = 0;
    whiteWin[k] = 0;
  }
  var img = document.createElement('img');
  img.src = initialChessboard;
  // img.crossOrigin = "*";
  img.onload = function() {
    ctx.clearRect(0, 0, chessboard.width, chessboard.width);
    ctx.drawImage(img, 0, 0, chessboard.width, chessboard.width, 0, 0, chessboard.width, chessboard.width);
    canvasHistory.undo_list = [];
    canvasHistory.redo_list = [];
    canvasHistory.saveState(chessboard);
    if (playMode === MODE.AIFIRST) {
      drawStep(Math.floor(row / 2), Math.floor(row / 2));
      afterStep(Math.floor(row / 2), Math.floor(row / 2));
    }
  }
}
