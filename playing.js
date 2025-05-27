// alfabeta algoritms tika veidots, balstoties uz (Kobel, 2020)
//šajā darbā bija izveidots alfabeta algoritms spēlei Connect 4, kuru pārveidoju, pielāgojot to spēlei TOOT un OTTO
// neironu tīklu arhitektūra veidota, ņemot piemēru no (Gilmer, 2016)

const DZILUMS = 2; 
const UZVARAS_PUNKTI = 1000, ZAUDEJUMA_PUNKTI = -1000;

const OTTO_PEC_VIENA = ["OTT_", "OT_O", "O_TO", "_TTO"];
const TOOT_PEC_VIENA = ["TOO_", "T_OT", "TO_T", "_OOT"];
const OTTO_PEC_DIVIEM = ["O__O", "_T_O", "__TO", "OT__", "O_T_", "_TT_"];
const TOOT_PEC_DIVIEM = ["T__T", "_O_T", "__OT", "TO__", "T_O_", "_OO_"];

var Sunas = [...document.getElementsByTagName("tr")].slice(1).map((c) => {
  return [...c.children];
});


function atrastzemakobrivokol(laukums, col) {
  for (let r = laukums.length - 1; r >= 0; r--) {
    if (!laukums[r][col]) return r;
  }
  return -1;
}

function parbaudituzvaretaju(laukums) {
  // alfabeta ir otto
  const targetSeqs = [
    { word: "OTTO", value: UZVARAS_PUNKTI },
    { word: "TOOT", value: ZAUDEJUMA_PUNKTI }
  ];

  // //alfabeta ir toot
  // const targetSeqs = [
  //   { word: "TOOT", value: UZVARAS_PUNKTI },
  //   { word: "OTTO", value: ZAUDEJUMA_PUNKTI }
  // ];

  const rows = laukums.length, cols = laukums[0].length;

  for (let { word, value } of targetSeqs) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Horizontāli
        if (c <= cols - 4) {
          let seq = laukums[r][c] + laukums[r][c+1] + laukums[r][c+2] + laukums[r][c+3];
          if (seq === word) return value;
        }
        // Vertikāli
        if (r <= rows - 4) {
          let seq = laukums[r][c] + laukums[r+1][c] + laukums[r+2][c] + laukums[r+3][c];
          if (seq === word) return value;
        }
        // Diagonāle1
        if (r <= rows - 4 && c <= cols - 4) {
          let seq = laukums[r][c] + laukums[r+1][c+1] + laukums[r+2][c+2] + laukums[r+3][c+3];
          if (seq === word) return value;
        }
        // Diagonāle2
        if (r >= 3 && c <= cols - 4) {
          let seq = laukums[r][c] + laukums[r-1][c+1] + laukums[r-2][c+2] + laukums[r-3][c+3];
          if (seq === word) return value;
        }
      }
    }
  }

  return null;
}


// ja alfabeta ir otto
function novertekomb(p) {
  if (p === "OTTO" || p === "TOOT") return 0;
  if (OTTO_PEC_VIENA.includes(p)) return p.includes("_") && p.replace("_", "O") === "OTTO" ? 100 : 80;
  if (TOOT_PEC_VIENA.includes(p)) return -100;
  if (OTTO_PEC_DIVIEM.includes(p)) return 20;
  if (TOOT_PEC_DIVIEM.includes(p)) return -20;
  return 0;
}
// //ja alfabeta ir toot
// function novertekomb(p) {
//   if (p === "OTTO" || p === "TOOT") return 0;
//   if (TOOT_PEC_VIENA.includes(p)) return p.includes("_") && p.replace("_", "T") === "TOOT" ? 100 : 80;
//   if (OTTO_PEC_VIENA.includes(p)) return -100;
//   if (TOOT_PEC_DIVIEM.includes(p)) return 20;
//   if (OTTO_PEC_DIVIEM.includes(p)) return -20;
//   return 0;
// }


function heiristiska(laukums) {
  let score = 0;
  const rows = laukums.length, cols = laukums[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const patterns = [
        c <= cols - 4 && [...Array(4)].map((_, k) => laukums[r][c+k] || "_").join(""),
        r <= rows - 4 && [...Array(4)].map((_, k) => laukums[r+k][c] || "_").join(""),
        r <= rows - 4 && c <= cols - 4 && [...Array(4)].map((_, k) => laukums[r+k][c+k] || "_").join(""),
        r >= 3 && c <= cols - 4 && [...Array(4)].map((_, k) => laukums[r-k][c+k] || "_").join("")
      ];
      for (let p of patterns) if (p) score += novertekomb(p);
    }
  }
  return score;
}


function alfabeta(laukums, dzilums, alfa, beta, isMax, compO, compT, oppO, oppT) {
  const rezultats = parbaudituzvaretaju(laukums);
  if (rezultats !== null) return rezultats;
  if (dzilums === 0) return heiristiska(laukums);
  const cols = laukums[0].length;
  if (isMax) {
    let maxEval = -Infinity;
    for (let col = 0; col < cols; col++) {
      const row = atrastzemakobrivokol(laukums, col);
      if (row === -1) continue;
      if (compO > 0) {
        laukums[row][col] = "O";
        const evalVal = alfabeta(laukums, dzilums-1, alfa, beta, false, compO-1, compT, oppO, oppT);
        laukums[row][col] = "";
        maxEval = Math.max(maxEval, evalVal);
        alfa = Math.max(alfa, evalVal);
        if (beta <= alfa) break;
      }
      if (compT > 0) {
        laukums[row][col] = "T";
        const evalVal = alfabeta(laukums, dzilums-1, alfa, beta, false, compO, compT-1, oppO, oppT);
        laukums[row][col] = "";
        maxEval = Math.max(maxEval, evalVal);
        alfa = Math.max(alfa, evalVal);
        if (beta <= alfa) break;
      }
    }
    return maxEval;
  }
  

  else {
    let minEval = Infinity;
    for (let col = 0; col < cols; col++) {
      const row = atrastzemakobrivokol(laukums, col);
      if (row === -1) continue;
      if (oppO > 0) {
        laukums[row][col] = "O";
        const evalVal = alfabeta(laukums, dzilums-1, alfa, beta, true, compO, compT, oppO-1, oppT);
        laukums[row][col] = "";
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alfa) break;
      }
      if (oppT > 0) {
        laukums[row][col] = "T";
        const evalVal = alfabeta(laukums, dzilums-1, alfa, beta, true, compO, compT, oppO, oppT-1);
        laukums[row][col] = "";
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alfa) break;
      }
    }
    return minEval;
  }
}


async function alfabetahibrids(laukums, dzilums, alfa, beta, isMax, compO, compT, oppO, oppT, speletajaindeks) {

  if (dzilums === 0) {
    try {
      const val = await novertetarCNN(laukums, speletajaindeks);
      if (typeof val !== "number" || isNaN(val)) {
        return 0;
      }
      return val * 1000;
    } 
    catch (e) {
      return 0;
    }
  }

  const cols = laukums[0].length;

  if (isMax) {
    let maxEval = -Infinity;
    let veicagaj = false;

    for (let col = 0; col < cols; col++) {
      for (let burti of ["O", "T"]) {
        if ((burti === "O" && compO <= 0) || (burti === "T" && compT <= 0)) continue;

        const row = atrastzemakobrivokol(laukums, col);
        if (row === -1) continue;

        veicagaj = true;
        laukums[row][col] = burti;

        const evalVal = await alfabetahibrids(
          laukums,
          dzilums - 1,
          alfa,
          beta,
          false,
          burti === "O" ? compO - 1 : compO,
          burti === "T" ? compT - 1 : compT,
          oppO,
          oppT,
          speletajaindeks
        );

        laukums[row][col] = "";

        if (typeof evalVal === "number" && !isNaN(evalVal)) {
          maxEval = Math.max(maxEval, evalVal);
          alfa = Math.max(alfa, evalVal);
        }

        if (beta <= alfa) break;
      }
    }

    if (!veicagaj) {
      return 0;
    }

    return maxEval === -Infinity ? 0 : maxEval;

    } 
    else {
    let minEval = Infinity;
    let veicagaj = false;

    for (let col = 0; col < cols; col++) {
      for (let burti of ["O", "T"]) {
        if ((burti === "O" && oppO <= 0) || (burti === "T" && oppT <= 0)) continue;

        const row = atrastzemakobrivokol(laukums, col);
        if (row === -1) continue;

        veicagaj = true;
        laukums[row][col] = burti;

        const evalVal = await alfabetahibrids(
          laukums,
          dzilums - 1,
          alfa,
          beta,
          true,
          compO,
          compT,
          burti === "O" ? oppO - 1 : oppO,
          burti === "T" ? oppT - 1 : oppT,
          speletajaindeks
        );

        laukums[row][col] = "";

        if (typeof evalVal === "number" && !isNaN(evalVal)) {
          minEval = Math.min(minEval, evalVal);
          beta = Math.min(beta, evalVal);
        }

        if (beta <= alfa) break;
      }
    }

    if (!veicagaj) {
      return 0;
    }
    return minEval === Infinity ? 0 : minEval;
  }
}


var datorsspele = (Speletajs) => {
  if (!Spelebeidzas) {
    const rows = Sunas.length;
    const cols = Sunas[0].length;
    const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));
    const compO = otrais.pieejamieburti.filter(x => x === 0).length;
    const compT = otrais.pieejamieburti.filter(x => x === 1).length;
    const oppO = pirmais.pieejamieburti.filter(x => x === 0).length;
    const oppT = pirmais.pieejamieburti.filter(x => x === 1).length;
    let bestScore = -Infinity, bestMove = { col: 0, burti: 0 };

    for (let col = 0; col < cols; col++) {
      const row = atrastzemakobrivokol(laukums, col);
      if (row === -1) continue;
      if (compO > 0) {
        laukums[row][col] = "O";
        const score = alfabeta(laukums, DZILUMS-1, -Infinity, Infinity, false, compO-1, compT, oppO, oppT);
        laukums[row][col] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = { col, burti: 0 };
        }
      }
      if (compT > 0) {
        laukums[row][col] = "T";
        const score = alfabeta(laukums, DZILUMS-1, -Infinity, Infinity, false, compO, compT-1, oppO, oppT);
        laukums[row][col] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = { col, burti: 1 };
        }
      }
    }

    for (let i = 4; i > 0; i--) {
      const cell = Sunas[i - 1][bestMove.col];
      if (cell.innerText === "") {
        const burti = bestMove.burti;
        cell.innerText = Burti[burti];
        cell.style.backgroundColor = Speletajs.color;
        burti === 0 ? Speletajs.pieejamieburti.pop() : Speletajs.pieejamieburti.shift();
        UpdatePlayerboard(Speletajs);
        if (onWinning()) {
          WinnerDeclaration(Aktivaisspeletajs);
        } 
        else {
          Aktivaisspeletajs = Speletajs === pirmais ? otrais : pirmais;
        }
        break;
      }
    }
  }
};

function UpdatePlayerboard(Speletajs) {
  const spans = document.querySelectorAll(".player span");
  const isPlayer1 = Speletajs === pirmais;

  const Ocount = Speletajs.pieejamieburti.filter(x => x === 0).length;
  const Tcount = Speletajs.pieejamieburti.filter(x => x === 1).length;

  if (isPlayer1) {
    spans[0].innerText = Ocount;
    spans[1].innerText = Tcount;
  } 
  else {
    spans[2].innerText = Ocount;
    spans[3].innerText = Tcount;
  }
}


async function hibridsdatorsspele(Speletajs, Opponent) {
let rezultats = onWinning();
if (rezultats !== null) {
  Spelebeidzas = true;
  return; 
}

  const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));
  const cols = laukums[0].length;
  const speletajaindeks = Speletajs === pirmais ? 0 : 1;

  const compO = Speletajs.pieejamieburti.filter(x => x === 0).length;
  const compT = Speletajs.pieejamieburti.filter(x => x === 1).length;
  const oppO = Opponent.pieejamieburti.filter(x => x === 0).length;
  const oppT = Opponent.pieejamieburti.filter(x => x === 1).length;

  let bestScore = -Infinity;
  let moveOptions = [];

  for (let col = 0; col < cols; col++) {
    const row = atrastzemakobrivokol(laukums, col);
    if (row === -1) continue;

    for (let burti of ["O", "T"]) {
      if ((burti === "O" && compO <= 0) || (burti === "T" && compT <= 0)) continue;
      laukums[row][col] = burti;

      const score = await alfabetahibrids(
        laukums,
        2,
        -Infinity,
        Infinity,
        false,
        burti === "O" ? compO - 1 : compO,
        burti === "T" ? compT - 1 : compT,
        oppO,
        oppT,
        speletajaindeks
      );

      laukums[row][col] = "";
      if (typeof score === "number" && !isNaN(score)) {
        const tolerance = 5;
        if (score > bestScore + tolerance) {
          bestScore = score;
          moveOptions = [{ col, burti }];
        } 
        else if (Math.abs(score - bestScore) <= tolerance) {
          moveOptions.push({ col, burti });
        }

      }
    }
  }

  if (moveOptions.length === 0) {
    return;
  }

  const bestMove = moveOptions[Math.floor(Math.random() * moveOptions.length)];
  const letterIndex = bestMove.burti === "O" ? 0 : 1;

  Playing(bestMove.col, letterIndex, Speletajs, true);

  rezultats = onWinning();
  if (rezultats === 1 || rezultats === -1) {
    WinnerDeclaration(Aktivaisspeletajs);
  } 
  else if (rezultats === 0) {
    document.querySelector(".winner").innerText = "Neizšķirts!";
    document.querySelector(".winner").style.display = "block";
  } 
  else {
    if (
      !Spelebeidzas &&
      (
        (Aktivaisspeletajs === pirmais && speletaji?.pirmais === "hybrid") ||
        (Aktivaisspeletajs === otrais && speletaji?.otrais === "hybrid")
      )
    ) {
  await hibridsdatorsspele(Aktivaisspeletajs, Speletajs);
    }
  }
}




var Playing = (Col, Letter, Speletajs, computer) => {
  for (let i = 4; i > 0; i--) {
    let cell = Sunas[i - 1][Col];
    if (cell.innerText === "") {

      cell.innerText = Burti[Letter];
      cell.style.backgroundColor = Speletajs.color;
      cell.style.color = "";
      Letter == 0 ? Speletajs.pieejamieburti.pop() : Speletajs.pieejamieburti.shift();
      UpdatePlayerboard(Speletajs);

      const rezultats = onWinning();

      if (rezultats === null) {
        Aktivaisspeletajs = Speletajs === pirmais ? otrais : pirmais;
        if (!computer) {
          HeaderCells[Col].style.backgroundColor = Aktivaisspeletajs.color;
        }
      }

      break;
    }
  }
};

function onWinning(forTraining = false) {
  let tootWin = false;
  let ottoWin = false;

  for (let i = 3; i >= 0; i--) {
    if (Sunas[i].filter((c) => c.innerText != "").length == 0) break;

    pirmais.skaits = 0;
    otrais.skaits = 0;
    for (let j = 0; j < 6; j++) {
      const burti = Sunas[i][j].innerText;
      if (burti === "O") {
        pirmais.skaits == 1 || pirmais.skaits == 2 ? pirmais.skaits++ : pirmais.skaits = 0;
        otrais.skaits == 1 ? otrais.skaits = 1 : (otrais.skaits == 0 || otrais.skaits == 3) ? otrais.skaits++ : otrais.skaits = 0;
      } 
      else if (burti === "T") {
        pirmais.skaits == 1 ? pirmais.skaits = 1 : (pirmais.skaits == 0 || pirmais.skaits == 3) ? pirmais.skaits++ : pirmais.skaits = 0;
        otrais.skaits == 1 || otrais.skaits == 2 ? otrais.skaits++ : otrais.skaits = 0;
      } 
      else {
        pirmais.skaits = 0;
        otrais.skaits = 0;
      }

      if (pirmais.skaits == 4) {
        tootWin = true;
        Uzvarsunas = [
          Sunas[i][j],
          Sunas[i][j - 1],
          Sunas[i][j - 2],
          Sunas[i][j - 3]
        ];
      }
      if (otrais.skaits == 4) {
        ottoWin = true;
        Uzvarsunas = [
          Sunas[i][j],
          Sunas[i][j - 1],
          Sunas[i][j - 2],
          Sunas[i][j - 3]
        ];
      }
    }
  }

  let topRow = Sunas[0].filter((c) => c.innerText != "");
  if (topRow.length != 0) {
    for (let cell of topRow) {
      let col = Sunas[0].indexOf(cell);
      const check = (p, player) =>
        Burti[player.seq[0]] === Sunas[0][col]?.innerText &&
        Burti[player.seq[1]] === Sunas[1][col + p]?.innerText &&
        Burti[player.seq[2]] === Sunas[2][col + 2 * p]?.innerText &&
        Burti[player.seq[3]] === Sunas[3][col + 3 * p]?.innerText;

      const checkingCol1 = check(0, pirmais);
      const checkingCol2 = check(0, otrais);
      const checkingDia1 = col <= 2 && check(1, pirmais);
      const checkingDia2 = col <= 2 && check(1, otrais);
      const checkingDia3 = col >= 3 && check(-1, pirmais);
      const checkingDia4 = col >= 3 && check(-1, otrais);

      if (checkingCol1) {
        tootWin = true;
        Uzvarsunas = [
          Sunas[0][col],
          Sunas[1][col],
          Sunas[2][col],
          Sunas[3][col]
        ];
      } 
      else if (checkingCol2) {
        ottoWin = true;
        Uzvarsunas = [
          Sunas[0][col],
          Sunas[1][col],
          Sunas[2][col],
          Sunas[3][col]
        ];
      } 
      else if (checkingDia1) {
        tootWin = true;
        Uzvarsunas = [
          Sunas[0][col],
          Sunas[1][col + 1],
          Sunas[2][col + 2],
          Sunas[3][col + 3]
        ];
      } 
      else if (checkingDia2) {
        ottoWin = true;
        Uzvarsunas = [
          Sunas[0][col],
          Sunas[1][col + 1],
          Sunas[2][col + 2],
          Sunas[3][col + 3]
        ];
      } 
      else if (checkingDia3) {
        tootWin = true;
        Uzvarsunas = [
          Sunas[0][col],
          Sunas[1][col - 1],
          Sunas[2][col - 2],
          Sunas[3][col - 3]
        ];
      } 
      else if (checkingDia4) {
        ottoWin = true;
        Uzvarsunas = [
          Sunas[0][col],
          Sunas[1][col - 1],
          Sunas[2][col - 2],
          Sunas[3][col - 3]
        ];
      }
    }
  }

if (tootWin && ottoWin) {
    Spelebeidzas = true;
    return 0;
  }
  if (tootWin) {
    Aktivaisspeletajs = pirmais;
    Spelebeidzas = true;
    return 1;
  }
  if (ottoWin) {
    Aktivaisspeletajs = otrais;
    Spelebeidzas = true;
    return -1;
  }

  const full = Sunas.flat().every(cell => cell.innerText !== "");
  if (full) {
    Spelebeidzas = true;
    return 0;
  }

  return null;
}




//Hibrīdais algoritms pret AlfaBeta

async function StartHybridVsAlphaBeta() {
  const numGames = 100;
  let hibridswins = 0;
  let alphaBetaWins = 0;
  let draws = 0;
  const trenindati = [];

  for (let i = 0; i < numGames; i++) {
    console.log(`Spēle #${i + 1} | Hibrīda uzvaras: ${hibridswins} | AlfaBeta: ${alphaBetaWins} | Neizšķirti: ${draws}`);

    ResetGame();

    //ja hibrids ir toot
    speletaji = {
      pirmais: "hybrid",
      otrais: "alphabeta"
    };
    Aktivaisspeletajs = pirmais;

    // //ja hibrids ir otto
    // speletaji = {
    //   otrais: "hybrid",
    //   pirmais: "alphabeta"
    // };
    // Aktivaisspeletajs = pirmais;

    await new Promise(resolve => {
      const parbauditspelesbeigas = async () => {
        if (!Spelebeidzas) {
          setTimeout(parbauditspelesbeigas, 100);
        } 
        else {
          const rezultats = onWinning();
          if (rezultats === 1) hibridswins++;
          else if (rezultats === -1) alphaBetaWins++;
          else if (rezultats === 0) draws++;

          const gameLength = trenindati.length;
          let gameStartIndex = gameLength - 1;

          while (gameStartIndex >= 0 && trenindati[gameStartIndex].label === undefined) {
            gameStartIndex--;
          }
          const gameData = trenindati.slice(gameStartIndex + 1);

          gameData.forEach(d => {
            d.label = (rezultats === 0)
              ? 0
              : (d.player === (rezultats === 1 ? 0 : 1)) ? 1 : -1;
          });
          resolve();
        }
      };

      hibridsvsalfabeta(pirmais, otrais, trenindati, 0.1, 0);
      parbauditspelesbeigas();
    });

    if (i > 0 && i % 100 === 0) {
      // console.log(`Apmācam modeli pēc ${i} spēlēm`);
      // await apmacitmodeli(trenindati);
      trenindati.length = 0;
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  if (trenindati.length > 0) {
    // await apmacitmodeli(trenindati);
  }

  //ja hibrids ir toot
  console.log("Visas spēles pabeigtas!");
  console.log(`Hibrīda uzvaras: ${hibridswins}`);
  console.log(`Alfa-Beta uzvaras: ${alphaBetaWins}`);
  console.log(`Neizšķirti: ${draws}`);

  // //hibrids ir otto
  // console.log("Visas spēles pabeigtas!");
  // console.log(`Alfa-Beta uzvaras: ${hibridswins}`);
  // console.log(`Hibrīds uzvaras: ${alphaBetaWins}`);
  // console.log(`Neizšķirti: ${draws}`);

}


function alfabetadators(Speletajs, Opponent, trenindati, epsilon, gajienusk) {
  if (Spelebeidzas) return;

  const rows = Sunas.length;
  const cols = Sunas[0].length;
  const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));

  const compO = Speletajs.pieejamieburti.filter(x => x === 0).length;
  const compT = Speletajs.pieejamieburti.filter(x => x === 1).length;
  const oppO = Opponent.pieejamieburti.filter(x => x === 0).length;
  const oppT = Opponent.pieejamieburti.filter(x => x === 1).length;

  let bestScore = -Infinity;
  let bestMove = { col: 0, burti: 0 };

  for (let col = 0; col < cols; col++) {
    const row = atrastzemakobrivokol(laukums, col);
    if (row === -1) continue;

    if (compO > 0) {
      laukums[row][col] = "O";
      const score = alfabeta(laukums, 2, -Infinity, Infinity, false, compO - 1, compT, oppO, oppT);
      laukums[row][col] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = { col, burti: 0 };
      }
    }

    if (compT > 0) {
      laukums[row][col] = "T";
      const score = alfabeta(laukums, 2, -Infinity, Infinity, false, compO, compT - 1, oppO, oppT);
      laukums[row][col] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = { col, burti: 1 };
      }
    }
  }

  const rowToPlay = atrastzemakobrivokol(Sunas.map(r => r.map(c => c.innerText || "")), bestMove.col);
  if (rowToPlay === -1) return;

  const cell = Sunas[rowToPlay][bestMove.col];
  const burti = bestMove.burti;
  cell.innerText = Burti[burti];
  cell.style.backgroundColor = Speletajs.color;
  burti === 0 ? Speletajs.pieejamieburti.pop() : Speletajs.pieejamieburti.shift();
  UpdatePlayerboard(Speletajs);

  const rezultats = onWinning();
  if (rezultats === 1 || rezultats === -1) {
    WinnerDeclaration(Speletajs);
    Spelebeidzas = true;
  } 
  else if (rezultats === 0) {
    document.querySelector(".winner").innerText = "Neizšķirts!";
    document.querySelector(".winner").style.display = "block";
    Spelebeidzas = true;
  } 
  else if (!Spelebeidzas) {
    Aktivaisspeletajs = Opponent;
    Pieejamieburti = [...Opponent.pieejamieburti];

    if (
      (Aktivaisspeletajs === pirmais && speletaji?.pirmais === "hybrid") ||
      (Aktivaisspeletajs === otrais && speletaji?.otrais === "hybrid")
    ) {
      setTimeout(() => hibridsvsalfabeta(Aktivaisspeletajs, Speletajs, trenindati, epsilon, gajienusk + 1), 100);
    } 
    else {
      setTimeout(() => alfabetadators(Aktivaisspeletajs, Speletajs, trenindati, epsilon, gajienusk + 1), 100);
    }
  }
}

function boardToInput(laukums, speletajaindeks, merkavards) {
  const flatBoard = laukums.flat().map(cell => {
    if (cell === "") return 0;
    if (cell === "O") return speletajaindeks === 0 ? 1 : -1;
    if (cell === "T") return speletajaindeks === 0 ? 2 : -2;
  });
  const goalVec = merkavards === "TOOT" ? [1, 0] : [0, 1];

  return [...flatBoard, ...goalVec];
}



async function hibridsvsalfabeta(Speletajs, Opponent, trenindati, epsilon = 0.1, gajienusk = 0) {

  if (Spelebeidzas) return;

  const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));
  const cols = laukums[0].length;
  const speletajaindeks = Speletajs === pirmais ? 0 : 1;

  const compO = Speletajs.pieejamieburti.filter(x => x === 0).length;
  const compT = Speletajs.pieejamieburti.filter(x => x === 1).length;
  const oppO = Opponent.pieejamieburti.filter(x => x === 0).length;
  const oppT = Opponent.pieejamieburti.filter(x => x === 1).length;

  const availableCols = [];
  for (let col = 0; col < cols; col++) {
    if (atrastzemakobrivokol(laukums, col) !== -1) {
      availableCols.push(col);
    }
  }

  let col, burti;

  if (gajienusk < 2 || Math.random() < epsilon) {
    col = availableCols[Math.floor(Math.random() * availableCols.length)];
    burti = Math.random() < 0.5 ? "O" : "T";
  } 
  else {
    let bestScore = -Infinity;
    let moveOptions = [];

    for (let c of availableCols) {
      const r = atrastzemakobrivokol(laukums, c);
      if (r === -1) continue;

      for (let l of ["O", "T"]) {
        if ((l === "O" && compO <= 0) || (l === "T" && compT <= 0)) continue;

        laukums[r][c] = l;

        const score = await alfabetahibrids(
          laukums,
          1,
          -Infinity,
          Infinity,
          false,
          l === "O" ? compO - 1 : compO,
          l === "T" ? compT - 1 : compT,
          oppO,
          oppT,
          speletajaindeks
        );

        laukums[r][c] = "";

        const tolerance = 5;
        if (typeof score === "number" && !isNaN(score)) {
          if (score > bestScore + tolerance) {
            bestScore = score;
            moveOptions = [{ col: c, burti: l }];
          } 
          else if (Math.abs(score - bestScore) <= tolerance) {
            moveOptions.push({ col: c, burti: l });
          }
        }
      }
    }

    if (moveOptions.length === 0) {
      col = availableCols[Math.floor(Math.random() * availableCols.length)];
      burti = Math.random() < 0.5 ? "O" : "T";
    } 
    else {
      const bestMove = moveOptions[Math.floor(Math.random() * moveOptions.length)];
      col = bestMove.col;
      burti = bestMove.burti;
    }
  }
  const letterIndex = burti === "O" ? 0 : 1;
  Playing(col, letterIndex, Speletajs, true);

  const stateCopy = laukums.map(row => [...row]);
  const input = boardToInput(stateCopy, speletajaindeks);

  const rezultats = onWinning();
  console.log("Saglabāts treniņpunkts:", trenindati[trenindati.length - 1]);

  trenindati.push({
    laukums: laukums.map(row => [...row]),
    player: speletajaindeks
  });


  if (rezultats === 1 || rezultats === -1) {
    WinnerDeclaration(Aktivaisspeletajs);
  } 
  else if (rezultats === 0) {
    document.querySelector(".winner").innerText = "Neizšķirts!";
    document.querySelector(".winner").style.display = "block";
  } 
  else {
    if (!Spelebeidzas) {
      if (
        (Aktivaisspeletajs === pirmais && speletaji?.pirmais === "hybrid") ||
        (Aktivaisspeletajs === otrais && speletaji?.otrais === "hybrid")
      ) {
        await hibridsvsalfabeta(Aktivaisspeletajs, Speletajs, trenindati, epsilon, gajienusk + 1);

      } 
      else {
        setTimeout(() => alfabetadators(Aktivaisspeletajs, Speletajs, trenindati, epsilon, gajienusk + 1), 100);
      }
    }
  }
}





// Hibrīds spēlē pret random


async function sakthibridsvsrandom() {
  const numGames = 100;
  let hibridswins = 0;
  let randomWins = 0;
  let draws = 0;

  for (let i = 0; i < numGames; i++) {
    console.log(`Spēle #${i + 1}`);
    ResetGame();

    // //ja hibrids ir toot
    // speletaji = {
    //   pirmais: "hybrid",
    //   otrais: "random"
    // };
    // Aktivaisspeletajs = pirmais;

    // ja hibrids ir otto
    speletaji = {
      pirmais: "random",
      otrais: "hybrid"
    };
    Aktivaisspeletajs = pirmais;


    await new Promise(resolve => {
      const parbauditspelesbeigas = async () => {
        if (!Spelebeidzas) {
          setTimeout(parbauditspelesbeigas, 100);
        } 
        else {
          const rezultats = onWinning();
          if (rezultats === 1) hibridswins++;
          else if (rezultats === -1) randomWins++;
          else if (rezultats === 0) draws++;
          resolve();
        }
      };

      // hibridsvsrandom(pirmais, otrais); //ja sak hibrids
      randomdatoragajiens(pirmais, otrais); //ja sak random
      parbauditspelesbeigas();
    });

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // // Pēc visām spēlēm parādi rezultātus
  // console.log("Pabeigtas visas spēles!");
  // console.log(`Hibrīda uzvaras: ${hibridswins}`);
  // console.log(`Random uzvaras: ${randomWins}`);
  // console.log(`Neizšķirti: ${draws}`);

  // Pēc visām spēlēm parādi rezultātus
  console.log("Pabeigtas visas spēles!");
  console.log(`Random uzvaras: ${hibridswins}`);
  console.log(`Hibrīda uzvaras: ${randomWins}`);
  console.log(`Neizšķirti: ${draws}`);  

}


function randomdatoragajiens(Speletajs, Opponent) {
  if (!Sunas || !Sunas.length || !Sunas[0].length) {
    console.warn("Sunas nav inicializēts");
    return;
  }

  if (Spelebeidzas) return;

  const rows = Sunas.length;
  const cols = Sunas[0].length;
  const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));

  const availableCols = [];
  for (let col = 0; col < cols; col++) {
    if (atrastzemakobrivokol(laukums, col) !== -1) {
      availableCols.push(col);
    }
  }

  if (availableCols.length === 0) {
    console.warn("Nav pieejamu kolonnu");
    return;
  }

  const col = availableCols[Math.floor(Math.random() * availableCols.length)];
  const burti = Math.random() < 0.5 ? 0 : 1;

  const rowToPlay = atrastzemakobrivokol(Sunas.map(r => r.map(c => c.innerText || "")), col);
  if (rowToPlay === -1) return;

  const cell = Sunas[rowToPlay][col];
  cell.innerText = Burti[burti];
  cell.style.backgroundColor = Speletajs.color;
  burti === 0 ? Speletajs.pieejamieburti.pop() : Speletajs.pieejamieburti.shift();
  UpdatePlayerboard(Speletajs);

  const rezultats = onWinning();
  if (rezultats === 1 || rezultats === -1) {
    WinnerDeclaration(Speletajs);
    Spelebeidzas = true;
  } 
  else if (rezultats === 0) {
    document.querySelector(".winner").innerText = "Neizšķirts!";
    document.querySelector(".winner").style.display = "block";
    Spelebeidzas = true;
  } 
  else if (!Spelebeidzas) {
    Aktivaisspeletajs = Opponent;
    Pieejamieburti = [...Opponent.pieejamieburti];

    if (
      (Aktivaisspeletajs === pirmais && speletaji?.pirmais === "hybrid") ||
      (Aktivaisspeletajs === otrais && speletaji?.otrais === "hybrid")
    ) {
      setTimeout(() => hibridsvsrandom(Aktivaisspeletajs, Speletajs), 100);
    } 
    else {
      setTimeout(() => randomdatoragajiens(Aktivaisspeletajs, Speletajs), 100);
    }
  }
}



async function hibridsvsrandom(Speletajs, Opponent) {
  let rezultats = onWinning();
  if (rezultats !== null) {
    Spelebeidzas = true;
    return;
  }

  const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));
  const cols = laukums[0].length;
  const speletajaindeks = Speletajs === pirmais ? 0 : 1;

  const compO = Speletajs.pieejamieburti.filter(x => x === 0).length;
  const compT = Speletajs.pieejamieburti.filter(x => x === 1).length;
  const oppO = Opponent.pieejamieburti.filter(x => x === 0).length;
  const oppT = Opponent.pieejamieburti.filter(x => x === 1).length;

  let bestScore = -Infinity;
  let moveOptions = [];

  for (let col = 0; col < cols; col++) {
    const row = atrastzemakobrivokol(laukums, col);
    if (row === -1) continue;

    for (let burti of ["O", "T"]) {
      laukums[row][col] = burti;

      const score = await alfabetahibrids(
        laukums,
        2,
        -Infinity,
        Infinity,
        false,
        burti === "O" ? compO - 1 : compO,
        burti === "T" ? compT - 1 : compT,
        oppO,
        oppT,
        speletajaindeks
      );

      laukums[row][col] = "";

      if (typeof score === "number" && !isNaN(score)) {
        const tolerance = 5; 

        if (score > bestScore + tolerance) {
          bestScore = score;
          moveOptions = [{ col, burti }];
        } 
        else if (Math.abs(score - bestScore) <= tolerance) {
          moveOptions.push({ col, burti });
        }
      }
    }
  }

  if (moveOptions.length === 0) {
    return;
  }

  const bestMove = moveOptions[Math.floor(Math.random() * moveOptions.length)];
  const letterIndex = bestMove.burti === "O" ? 0 : 1;

  Playing(bestMove.col, letterIndex, Speletajs, true);

  rezultats = onWinning();
  if (rezultats === 1 || rezultats === -1) {
    WinnerDeclaration(Aktivaisspeletajs);
  } 
  else if (rezultats === 0) {
    document.querySelector(".winner").innerText = "Neizšķirts!";
    document.querySelector(".winner").style.display = "block";
  } 
  else {
    if (!Spelebeidzas) {
      if (
        (Aktivaisspeletajs === pirmais && speletaji?.pirmais === "hybrid") ||
        (Aktivaisspeletajs === otrais && speletaji?.otrais === "hybrid")
      ) {
        await hibridsvsrandom(Aktivaisspeletajs, Speletajs);
      } 
      else if (
        (Aktivaisspeletajs === pirmais && speletaji?.pirmais === "random") ||
        (Aktivaisspeletajs === otrais && speletaji?.otrais === "random")
      ) {
        setTimeout(() => randomdatoragajiens(Aktivaisspeletajs, Speletajs), 100);
      }
    }
  }
}



//vecais hibrīdais modelis pret jauno


let vecaismodelis = null;
let jaunaismodelis = null;

async function ieladetvecomodeli() {
  if (!vecaismodelis) {
    vecaismodelis = await tf.loadLayersModel('modelpirmais.json');
    console.log("Vecais modelis ielādēts!");
  }
}

async function ieladetjaunomodeli() {
  if (!jaunaismodelis) {
    jaunaismodelis = await tf.loadLayersModel('modelsestais.json'); 
    console.log("Jaunais modelis ielādēts!");
  }
}

async function novertetarjaunomod(laukums, speletajaindeks) {
  await ieladetjaunomodeli();

  const merkavards = speletajaindeks === 0 ? "TOOT" : "OTTO";
  const input = laukumsuztenzoru(laukums, speletajaindeks, merkavards);
  const prediction = jaunaismodelis.predict(input);
  const score = (await prediction.data())[0];

  input.dispose();
  prediction.dispose();

  return typeof score === "number" && !isNaN(score) ? score : 0;
}

async function novertetarvecomod(laukums, speletajaindeks) {
  await ieladetvecomodeli(); 

  const merkavards = speletajaindeks === 0 ? "TOOT" : "OTTO";
  const input = laukumsuztenzoru(laukums, speletajaindeks, merkavards);
  const prediction = vecaismodelis.predict(input);
  const score = (await prediction.data())[0];

  input.dispose();
  prediction.dispose();

  return typeof score === "number" && !isNaN(score) ? score : 0;
}



async function saktjaunaisvsvecais() {
  const numGames = 100;
  let newuzvar = 0;
  let olduzvar = 0;
  let draws = 0;

  for (let i = 0; i < numGames; i++) {
    ResetGame();

    // ja jaunais sak ka toot
    speletaji = {
      pirmais: "hybridNew", 
      otrais: "hybridOld" 
    };
    Aktivaisspeletajs = pirmais;

    // //ja vecais sak ka toot
    // speletaji = {
    //   otrais: "hybridNew", 
    //   pirmais: "hybridOld" 
    // };
    // Aktivaisspeletajs = pirmais;

    await new Promise(resolve => {
      const parbauditspelesbeigas = async () => {
        if (!Spelebeidzas) {
          setTimeout(parbauditspelesbeigas, 100);
        } 
        else {
          const rezultats = onWinning();
          if (rezultats === 1) newuzvar++;
          else if (rezultats === -1) olduzvar++;
          else draws++;
          resolve();
        }
      };

      hibridsjaunaisvsvecais(pirmais, otrais);
      parbauditspelesbeigas();
    });

    await new Promise(resolve => setTimeout(resolve, 200));
  }
//ja jaunais ir otto
  console.log("Visi mači pabeigti!");
  console.log(`Jaunais (CNN) uzvaras: ${newuzvar}`);
  console.log(`Vecais (saglabātais) uzvaras: ${olduzvar}`);
  console.log(`Neizšķirti: ${draws}`);

// //javecais ir otto
//   console.log("Visi mači pabeigti!");
//   console.log(`Vecais (saglabātais) uzvaras ${newuzvar}`);
//   console.log(`Jaunais (CNN) uzvaras: ${olduzvar}`);
//   console.log(`Neizšķirti: ${draws}`);
}


async function hibridsjaunaisvsvecais(Speletajs, Opponent) {
  if (Spelebeidzas) return;

  const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));
  const speletajaindeks = Speletajs === pirmais ? 0 : 1;

  const compO = Speletajs.pieejamieburti.filter(x => x === 0).length;
  const compT = Speletajs.pieejamieburti.filter(x => x === 1).length;
  const oppO = Opponent.pieejamieburti.filter(x => x === 0).length;
  const oppT = Opponent.pieejamieburti.filter(x => x === 1).length;

  let bestScore = -Infinity;
  let moveOptions = [];

  for (let col = 0; col < 6; col++) {
    const row = atrastzemakobrivokol(laukums, col);
    if (row === -1) continue;

    for (let burti of ["O", "T"]) {
      if ((burti === "O" && compO <= 0) || (burti === "T" && compT <= 0)) continue;

      laukums[row][col] = burti;

      let score;
      if (Speletajs === pirmais) {
        score = await alfabetahibridsnew(
          laukums, 2, -Infinity, Infinity, false,
          burti === "O" ? compO - 1 : compO,
          burti === "T" ? compT - 1 : compT,
          oppO, oppT, speletajaindeks
        );
      } 
      else {
        score = await alfabetahibridsold(
          laukums, 2, -Infinity, Infinity, false,
          burti === "O" ? compO - 1 : compO,
          burti === "T" ? compT - 1 : compT,
          oppO, oppT, speletajaindeks
        );
      }

      laukums[row][col] = "";

      const tolerance = 5;
      if (typeof score === "number" && !isNaN(score)) {
        if (score > bestScore + tolerance) {
          bestScore = score;
          moveOptions = [{ col, burti }];
        } 
        else if (Math.abs(score - bestScore) <= tolerance) {
          moveOptions.push({ col, burti });
        }
      }
    }
  }

  if (moveOptions.length === 0) return;

  const bestMove = moveOptions[Math.floor(Math.random() * moveOptions.length)];
  const letterIndex = bestMove.burti === "O" ? 0 : 1;

  Playing(bestMove.col, letterIndex, Speletajs, true);

  const rezultats = onWinning();
  if (rezultats === null && !Spelebeidzas) {
    const next = Aktivaisspeletajs;
    const nextOpponent = next === pirmais ? otrais : pirmais;
    await hibridsjaunaisvsvecais(next, nextOpponent);
  }
}



async function alfabetahibridsnew(laukums, dzilums, alfa, beta, isMax, compO, compT, oppO, oppT, speletajaindeks) {
  if (dzilums === 0) {
    try {
      const val = await novertetarjaunomod(laukums, speletajaindeks);
      return typeof val === "number" && !isNaN(val) ? val * 1000 : 0;
    } 
    catch (e) {
      console.error("kļūda", e);
      return 0;
    }
  }

  const cols = laukums[0].length;
  if (isMax) {
    let maxEval = -Infinity;
    for (let col = 0; col < cols; col++) {
      for (let burti of ["O", "T"]) {
        if ((burti === "O" && compO <= 0) || (burti === "T" && compT <= 0)) continue;
        const row = atrastzemakobrivokol(laukums, col);
        if (row === -1) continue;

        laukums[row][col] = burti;
        const evalVal = await alfabetahibridsnew(
          laukums, dzilums - 1, alfa, beta, false,
          burti === "O" ? compO - 1 : compO,
          burti === "T" ? compT - 1 : compT,
          oppO, oppT, speletajaindeks
        );
        laukums[row][col] = "";

        if (typeof evalVal === "number" && !isNaN(evalVal)) {
          maxEval = Math.max(maxEval, evalVal);
          alfa = Math.max(alfa, evalVal);
        }
        if (beta <= alfa) break;
      }
    }
    return maxEval;
  } 
  else {
    let minEval = Infinity;
    for (let col = 0; col < cols; col++) {
      for (let burti of ["O", "T"]) {
        if ((burti === "O" && oppO <= 0) || (burti === "T" && oppT <= 0)) continue;
        const row = atrastzemakobrivokol(laukums, col);
        if (row === -1) continue;

        laukums[row][col] = burti;
        const evalVal = await alfabetahibridsnew(
          laukums, dzilums - 1, alfa, beta, true,
          compO, compT,
          burti === "O" ? oppO - 1 : oppO,
          burti === "T" ? oppT - 1 : oppT,
          speletajaindeks
        );
        laukums[row][col] = "";

        if (typeof evalVal === "number" && !isNaN(evalVal)) {
          minEval = Math.min(minEval, evalVal);
          beta = Math.min(beta, evalVal);
        }
        if (beta <= alfa) break;
      }
    }
    return minEval;
  }
}


async function alfabetahibridsold(laukums, dzilums, alfa, beta, isMax, compO, compT, oppO, oppT, speletajaindeks) {
  if (dzilums === 0) {
    try {
      const val = await novertetarvecomod(laukums, speletajaindeks);
      return typeof val === "number" && !isNaN(val) ? val * 1000 : 0;
    } 
    catch (e) {
      console.error("kļūda", e);
      return 0;
    }
  }

  const cols = laukums[0].length;

  if (isMax) {
    let maxEval = -Infinity;
    let veicagaj = false;

    for (let col = 0; col < cols; col++) {
      for (let burti of ["O", "T"]) {
        if ((burti === "O" && compO <= 0) || (burti === "T" && compT <= 0)) continue;
        const row = atrastzemakobrivokol(laukums, col);
        if (row === -1) continue;

        veicagaj = true;
        laukums[row][col] = burti;

        const evalVal = await alfabetahibridsold(
          laukums,
          dzilums - 1,
          alfa,
          beta,
          false,
          burti === "O" ? compO - 1 : compO,
          burti === "T" ? compT - 1 : compT,
          oppO,
          oppT,
          speletajaindeks
        );

        laukums[row][col] = "";

        if (typeof evalVal === "number" && !isNaN(evalVal)) {
          maxEval = Math.max(maxEval, evalVal);
          alfa = Math.max(alfa, evalVal);
        }

        if (beta <= alfa) break;
      }
    }

    return veicagaj ? maxEval : 0;

  } 
  else {
    let minEval = Infinity;
    let veicagaj = false;

    for (let col = 0; col < cols; col++) {
      for (let burti of ["O", "T"]) {
        if ((burti === "O" && oppO <= 0) || (burti === "T" && oppT <= 0)) continue;
        const row = atrastzemakobrivokol(laukums, col);
        if (row === -1) continue;

        veicagaj = true;
        laukums[row][col] = burti;

        const evalVal = await alfabetahibridsold(
          laukums,
          dzilums - 1,
          alfa,
          beta,
          true,
          compO,
          compT,
          burti === "O" ? oppO - 1 : oppO,
          burti === "T" ? oppT - 1 : oppT,
          speletajaindeks
        );

        laukums[row][col] = "";

        if (typeof evalVal === "number" && !isNaN(evalVal)) {
          minEval = Math.min(minEval, evalVal);
          beta = Math.min(beta, evalVal);
        }

        if (beta <= alfa) break;
      }
    }

    return veicagaj ? minEval : 0;
  }
}


async function saktvecaisvsalfabeta() {
  const numGames = 100;
  let hibridswins = 0;
  let alphaBetaWins = 0;
  let draws = 0;

  for (let i = 0; i < numGames; i++) {
    console.log(`Spēle #${i + 1}`);

    ResetGame();

    // ja vecais hibrīds spēlē kā TOOT
    speletaji = {
      pirmais: "hybridOld",
      otrais: "alphabeta"
    };
    Aktivaisspeletajs = pirmais;

    // // ja vecais hibrīds spēlē kā OTTO
    // speletaji = {
    //   otrais: "hybridOld",
    //   pirmais: "alphabeta"
    // };
    // Aktivaisspeletajs = pirmais;

    await new Promise(resolve => {
      const parbauditspelesbeigas = async () => {
        if (!Spelebeidzas) {
          setTimeout(parbauditspelesbeigas, 100);
        } 
        else {
          const rezultats = onWinning();
          if (rezultats === 1) hibridswins++;
          else if (rezultats === -1) alphaBetaWins++;
          else draws++;
          resolve();
        }
      };

      vecaisvsalfabeta(pirmais, otrais, 0);
      parbauditspelesbeigas();
    });

    await new Promise(resolve => setTimeout(resolve, 200));
  }
//ja alfabeta ir otto
  console.log("Visi mači pabeigti!");
  console.log(`Vecais hibrīds uzvaras: ${hibridswins}`);
  console.log(`AlphaBeta uzvaras: ${alphaBetaWins}`);
  console.log(`Neizšķirti: ${draws}`);

// //ja alfabeta ir toot
//   console.log("Visi mači pabeigti!");
//   console.log(`AlphaBeta uzvaras: ${hibridswins}`);
//   console.log(`Vecais hibrīds uzvaras: ${alphaBetaWins}`);
//   console.log(`Neizšķirti: ${draws}`);
}



async function vecaisvsalfabeta(Speletajs, Opponent, gajienusk = 0, epsilon = 0.1) {
  if (Spelebeidzas) return;

  const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));
  const cols = laukums[0].length;
  const speletajaindeks = Speletajs === pirmais ? 0 : 1;

  const compO = Speletajs.pieejamieburti.filter(x => x === 0).length;
  const compT = Speletajs.pieejamieburti.filter(x => x === 1).length;
  const oppO = Opponent.pieejamieburti.filter(x => x === 0).length;
  const oppT = Opponent.pieejamieburti.filter(x => x === 1).length;

  const availableCols = [];
  for (let col = 0; col < cols; col++) {
    if (atrastzemakobrivokol(laukums, col) !== -1) {
      availableCols.push(col);
    }
  }

  let col, burti;

  if (gajienusk < 2 || Math.random() < epsilon) {
    col = availableCols[Math.floor(Math.random() * availableCols.length)];
    burti = Math.random() < 0.5 ? "O" : "T";
  } 
  else {
    let bestScore = -Infinity;
    let moveOptions = [];

    for (let c of availableCols) {
      const r = atrastzemakobrivokol(laukums, c);
      if (r === -1) continue;

      for (let l of ["O", "T"]) {
        if ((l === "O" && compO <= 0) || (l === "T" && compT <= 0)) continue;

        laukums[r][c] = l;

        const score = await alfabetahibridsold(
        laukums,
        2,
        -Infinity,
        Infinity,
        false,
        l === "O" ? compO - 1 : compO,
        l === "T" ? compT - 1 : compT,
        oppO,
        oppT,
        speletajaindeks
  );



        laukums[r][c] = "";

        const tolerance = 5;
        if (typeof score === "number" && !isNaN(score)) {
          if (score > bestScore + tolerance) {
            bestScore = score;
            moveOptions = [{ col: c, burti: l }];
          } 
          else if (Math.abs(score - bestScore) <= tolerance) {
            moveOptions.push({ col: c, burti: l });
          }
        }
      }
    }

    if (moveOptions.length === 0) {
      col = availableCols[Math.floor(Math.random() * availableCols.length)];
      burti = Math.random() < 0.5 ? "O" : "T";
    } 
    else {
      const bestMove = moveOptions[Math.floor(Math.random() * moveOptions.length)];
      col = bestMove.col;
      burti = bestMove.burti;
    }
  }

  const letterIndex = burti === "O" ? 0 : 1;
  Playing(col, letterIndex, Speletajs, true);

  const rezultats = onWinning();
  if (rezultats === 1 || rezultats === -1 || rezultats === 0) {
    return;
  } 
  else {
    if (
      Aktivaisspeletajs === Opponent &&
      speletaji?.[Aktivaisspeletajs === pirmais ? "pirmais" : "otrais"] === "alphabeta"
    ) {
      setTimeout(() => alfabetadators(Aktivaisspeletajs, Speletajs, [], epsilon, gajienusk + 1), 100);
    } 
    else {
      await vecaisvsalfabeta(Aktivaisspeletajs, Speletajs, gajienusk + 1, epsilon);
    }
  }
}



//hibrīdais algoritms pret nejaušu spēlētāju



async function saktvecaishibridsvsrandom() {
  const numGames = 100;
  let hibridswins = 0;
  let randomWins = 0;
  let draws = 0;

  for (let i = 0; i < numGames; i++) {
    console.log(`Spēle #${i + 1}`);
    ResetGame();

    // // ja vecais hibrīds spēlē kā OTTO
    // speletaji = {
    //   pirmais: "random",
    //   otrais: "hybridOld"
    // };
    // Aktivaisspeletajs = pirmais;

    //ja vecais hibrids spele ka TOOT
    speletaji = {
      otrais: "random",
      pirmais: "hybridOld"
    };
    Aktivaisspeletajs = pirmais;    

    await new Promise(resolve => {
      const parbauditspelesbeigas = async () => {
        if (!Spelebeidzas) {
          setTimeout(parbauditspelesbeigas, 100);
        } 
        else {
          const rezultats = onWinning();
          if (rezultats === 1) hibridswins++;
          else if (rezultats === -1) randomWins++;
          else draws++;
          resolve();
        }
      };

      vecaishibridsvsrandom(pirmais, otrais, 0);
      parbauditspelesbeigas();
    });

    await new Promise(resolve => setTimeout(resolve, 200));
  }

// //ja hibrids ir otto
//   console.log("Visi mači pabeigti!");
//   console.log(`Vecais hibrīds uzvaras: ${hibridswins}`);
//   console.log(`Nejaušais spēlētājs uzvaras: ${randomWins}`);
//   console.log(`Neizšķirti: ${draws}`);

//ja hibrids ir toot
  console.log("Visi mači pabeigti!");
  console.log(`Nejaušais spēlētājs uzvaras: ${hibridswins}`);
  console.log(`Vecais hibrīds uzvaras: ${randomWins}`);
  console.log(`Neizšķirti: ${draws}`);
}



async function vecaishibridsvsrandom(Speletajs, Opponent, gajienusk = 0, epsilon = 0.1) {
  if (Spelebeidzas) return;

  const laukums = Sunas.map(row => row.map(cell => cell.innerText || ""));
  const cols = laukums[0].length;
  const speletajaindeks = Speletajs === pirmais ? 0 : 1;

  const compO = Speletajs.pieejamieburti.filter(x => x === 0).length;
  const compT = Speletajs.pieejamieburti.filter(x => x === 1).length;
  const oppO = Opponent.pieejamieburti.filter(x => x === 0).length;
  const oppT = Opponent.pieejamieburti.filter(x => x === 1).length;

  const availableCols = [];
  for (let col = 0; col < cols; col++) {
    if (atrastzemakobrivokol(laukums, col) !== -1) {
      availableCols.push(col);
    }
  }

  let col, burti;

  if (gajienusk < 2 || Math.random() < epsilon) {
    col = availableCols[Math.floor(Math.random() * availableCols.length)];
    burti = Math.random() < 0.5 ? "O" : "T";
  } 
  else {
    let bestScore = -Infinity;
    let moveOptions = [];

    for (let c of availableCols) {
      const r = atrastzemakobrivokol(laukums, c);
      if (r === -1) continue;

      for (let l of ["O", "T"]) {
        if ((l === "O" && compO <= 0) || (l === "T" && compT <= 0)) continue;

        laukums[r][c] = l;

        const score = await alfabetahibridsold(
          laukums,
          2,
          -Infinity,
          Infinity,
          false,
          l === "O" ? compO - 1 : compO,
          l === "T" ? compT - 1 : compT,
          oppO,
          oppT,
          speletajaindeks
        );

        laukums[r][c] = "";

        const tolerance = 5;
        if (typeof score === "number" && !isNaN(score)) {
          if (score > bestScore + tolerance) {
            bestScore = score;
            moveOptions = [{ col: c, burti: l }];
          } 
          else if (Math.abs(score - bestScore) <= tolerance) {
            moveOptions.push({ col: c, burti: l });
          }
        }
      }
    }

    if (moveOptions.length === 0) {
      col = availableCols[Math.floor(Math.random() * availableCols.length)];
      burti = Math.random() < 0.5 ? "O" : "T";
    } 
    else {
      const bestMove = moveOptions[Math.floor(Math.random() * moveOptions.length)];
      col = bestMove.col;
      burti = bestMove.burti;
    }
  }

  const letterIndex = burti === "O" ? 0 : 1;
  Playing(col, letterIndex, Speletajs, true);

  const rezultats = onWinning();
  if (rezultats !== null) return;

  if (
    Aktivaisspeletajs === Opponent &&
    speletaji?.[Aktivaisspeletajs === pirmais ? "pirmais" : "otrais"] === "random"
  ) {
    setTimeout(() => randomdatoragajiens(Aktivaisspeletajs, Speletajs), 100);
  } else {
    await vecaishibridsvsrandom(Aktivaisspeletajs, Speletajs, gajienusk + 1, epsilon);
  }
}
