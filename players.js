var Speletaji = () => {
  return new Promise((resolve) => {
    let starter = true;
    let computerMode = "none";

    document.getElementById("vsHuman").onclick = () => {
      computerMode = "none";
      document.querySelector('.opponent-select').classList.add('hidden');
      document.querySelector('.starter-select').classList.remove('hidden');
    };
    document.getElementById("vsAlphaBeta").onclick = () => {
      computerMode = "alphabeta";
      document.querySelector('.opponent-select').classList.add('hidden');
      document.querySelector('.starter-select').classList.remove('hidden');
    };
    document.getElementById("vsHybrid").onclick = () => {
      computerMode = "hybrid";
      document.querySelector('.opponent-select').classList.add('hidden');
      document.querySelector('.starter-select').classList.remove('hidden');
    };
    document.getElementById("trainHybrid").onclick = () => {
      computerMode = "train";
      starter = true;
      document.querySelector('.setup-menu').classList.add('hidden');
      resolve({ starter: pirmais, Computer: computerMode });
    };

    document.getElementById("vsHybridVsAlphaBeta").addEventListener("click", StartHybridVsAlphaBeta);
    document.getElementById("vsHybridVsRandom").addEventListener("click", sakthibridsvsrandom);
    // document.getElementById("vsHybridVsRandom").addEventListener("click", saktjaunaisvsvecais);
    // document.getElementById("vsHybridVsRandom").addEventListener("click", saktvecaisvsalfabeta);
    // document.getElementById("vsHybridVsRandom").addEventListener("click", saktvecaishibridsvsrandom);


    document.getElementById("startPlayer1").onclick = () => {
      finish(true, computerMode);
    };
    document.getElementById("startPlayer2").onclick = () => {
      finish(false, computerMode);
    };

    function finish(starterChoice, mode) {
      Aktivaisspeletajs = starterChoice ? pirmais : otrais;
      document.querySelector('.setup-menu').classList.add('hidden');
      resolve({ starter: Aktivaisspeletajs, Computer: mode });
    }
  });
};

var WinnerDeclaration = (winner) => {
  let div = document.getElementsByClassName("winner")[0];

  div.style.display = "block";
  div.style.backgroundColor = "steelblue";

  if (winner === pirmais) {
    div.innerText = "Uzvarēja pirmais spēlētājs!";
    div.style.color = pirmais.color;
  } else if (winner === otrais) {
    div.innerText = "Uzvarēja otrais spēlētājs!";
    div.style.color = otrais.color;
  } else {
    div.innerText = "Neizšķirts!";
    div.style.color = "white";
  }

  if (winner) {
    Uzvarsunas.forEach(cell => {
      cell.style.backgroundColor = "black";
      cell.style.color = winner.color;
    });
  }

  Spelebeidzas = true;
};


function clearBoardVisuals() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      Sunas[r][c].innerText = "";
      Sunas[r][c].style.backgroundColor = "";
      Sunas[r][c].style.color = "";
    }
  }
}



let cnnModel;

async function izveidotCNNmodeli() {
  cnnModel = tf.sequential();

  //1.Konvolūcijas slānis
  cnnModel.add(tf.layers.conv2d({
    inputShape: [4, 6, 5],
    filters: 32,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same'
  }));

  //2.Konvolūcijas slānis
  cnnModel.add(tf.layers.conv2d({
    filters: 64,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same'
  }));

  //3.Konvolūcijas slānis
  cnnModel.add(tf.layers.conv2d({
    filters: 128,
    kernelSize: 2,
    activation: 'relu',
    padding: 'same'
  }));

  //4.Konvolūcijas slānis
  cnnModel.add(tf.layers.conv2d({
    filters: 128,
    kernelSize: 2,
    activation: 'relu',
    padding: 'same'
  }));

  //5.Nolīdzināšana
  cnnModel.add(tf.layers.flatten());

  //6.Pilnībā savienots slānis
  cnnModel.add(tf.layers.dense({ units: 64, activation: 'relu' }));

  //7.Dropout — pārapmācības samazināšanai
  cnnModel.add(tf.layers.dropout({ rate: 0.3 }));

  //8.Izejas slānis
  cnnModel.add(tf.layers.dense({ units: 1, activation: 'tanh' }));

  //9.Kompilēšana
  cnnModel.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError'
  });

  return cnnModel;
}





function laukumsuztenzoru(laukums, speletajaindeks, merkavards) {
  const rows = laukums.length;
  const cols = laukums[0].length;
  const tensor = tf.buffer([rows, cols, 5]);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = laukums[r][c];
      if (val === "") continue;

      if (val === "O") {
        const ch = speletajaindeks === 0 ? 0 : 2;
        tensor.set(1, r, c, ch);
      } else if (val === "T") {
        const ch = speletajaindeks === 0 ? 1 : 3;
        tensor.set(1, r, c, ch);
      }
    }
  }

  const goal = merkavards === "TOOT" ? 1 : -1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tensor.set(goal, r, c, 4);
    }
  }

  return tensor.toTensor().reshape([1, rows, cols, 5]);
}




async function novertetarCNN(laukums, speletajaindeks) {
  if (!cnnModel) {
    try {
      cnnModel = await tf.loadLayersModel('indexeddb://TootOttoCNN3');
      console.log("Modelis ielādēts no IndexedDB!");
    } 
    catch (e) {
      console.warn("IndexedDB modelis nav atrasts, izveidojam jaunu");
      cnnModel = await izveidotCNNmodeli();
      await cnnModel.save('indexeddb://TootOttoCNN3');
      console.log("Jaunais modelis saglabāts IndexedDB!");
    }
  }

  const merkavards = speletajaindeks === 0 ? "TOOT" : "OTTO";
  const input = laukumsuztenzoru(laukums, speletajaindeks, merkavards);
  const prediction = cnnModel.predict(input);
  const score = (await prediction.data())[0];

  input.dispose();
  prediction.dispose();

  return typeof score === "number" && !isNaN(score) ? score : 0;
}




async function passpeles(numGames = 3000, epsilon = 0.1) {
  const trenindati = [];
  if (!cnnModel) {
  try {
    cnnModel = await tf.loadLayersModel('indexeddb://TootOttoCNN3');
    console.log("Modelis ielādēts no IndexedDB");
  } catch (e) {
    console.warn("IndexedDB modelis nav atrasts, izveidojam jaunu");
    cnnModel = await izveidotCNNmodeli();
    await cnnModel.save('indexeddb://TootOttoCNN3');
    console.log("Jaunais modelis saglabāts IndexedDB!");
  }
}

  await cnnModel.save('localstorage://temporary-clone');
  let opponentModel = await tf.loadLayersModel('localstorage://temporary-clone');

  const results = { tootWins: 0, ottoWins: 0, draws: 0 };

  for (let g = 0; g < numGames; g++) {
    clearBoardVisuals();
    let laukums = Array(4).fill().map(() => Array(6).fill(""));
    let currentPlayer = 0;
    Spelebeidzas = false;

    pirmais.pieejamieburti = [...Pieejamieburti];
    otrais.pieejamieburti = [...Pieejamieburti];
    Aktivaisspeletajs = pirmais;

    let winnerFound = false;
    let gajienusk = 0;

    const gameStartIndex = trenindati.length;

    while (gajienusk < 24 && !winnerFound) {
      const player = currentPlayer === 0 ? pirmais : otrais;
      const modelis = currentPlayer === 0 ? cnnModel : opponentModel;
      Aktivaisspeletajs = player;

      const availableCols = [];
      for (let col = 0; col < 6; col++) {
        if (atrastzemakobrivokol(laukums, col) !== -1) {
          availableCols.push(col);
        }
      }

      if (availableCols.length === 0) break;

      let col, burti;

      if (gajienusk < 2 || Math.random() < epsilon) {
        col = availableCols[Math.floor(Math.random() * availableCols.length)];
        burti = Math.random() < 0.5 ? "O" : "T";
      } 
      else {
        let bestScore = -Infinity;
        let moveOptions = [];

        const compO = player.pieejamieburti.filter(x => x === 0).length;
        const compT = player.pieejamieburti.filter(x => x === 1).length;
        const opponent = currentPlayer === 0 ? otrais : pirmais;
        const oppO = opponent.pieejamieburti.filter(x => x === 0).length;
        const oppT = opponent.pieejamieburti.filter(x => x === 1).length;

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
              currentPlayer
            );      
            laukums[r][c] = "";

            if (score > bestScore) {
              bestScore = score;
              moveOptions = [{ col: c, burti: l }];
            } else if (score === bestScore) {
              moveOptions.push({ col: c, burti: l });
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

      const row = atrastzemakobrivokol(laukums, col);
      laukums[row][col] = burti;

      const merkavards = currentPlayer === 0 ? "TOOT" : "OTTO";
      trenindati.push({
        laukums: laukums.map(row => [...row]),
        player: currentPlayer,
        merkavards
      });


      Playing(col, burti === "O" ? 0 : 1, player, true);
      await new Promise(resolve => setTimeout(resolve, 100));

      const rezultats = onWinning(true);
      if (rezultats !== null) {
        winnerFound = true;

        if (rezultats === 1) results.tootWins++;
        else if (rezultats === -1) results.ottoWins++;
        else results.draws++;

        WinnerDeclaration(rezultats === 1 ? pirmais : rezultats === -1 ? otrais : null);

        const gameEndIndex = trenindati.length;
        const gameData = trenindati.slice(gameStartIndex, gameEndIndex);
        const winner = (rezultats === 1) ? 0 : (rezultats === -1) ? 1 : null;

        gameData.forEach(d => {
          d.label = winner === null
            ? 0
            : (d.player === winner ? 1 : -1);
        });

        await new Promise(resolve => setTimeout(resolve, 400));
        break;
      }

      gajienusk++;
      currentPlayer = 1 - currentPlayer;
    }

    if (!winnerFound) {
      results.draws++;
      WinnerDeclaration(null);

      const gameEndIndex = trenindati.length;
      const gameData = trenindati.slice(gameStartIndex, gameEndIndex);
      gameData.forEach(d => d.label = 0);

      await new Promise(resolve => setTimeout(resolve, 400));
    }

    console.log(`Spēle ${g + 1}/${numGames} pabeigta`);

    if (g > 0 && g % 10 === 0) {
      await cnnModel.save('localstorage://temporary-clone');
      opponentModel = await tf.loadLayersModel('localstorage://temporary-clone');

      saglabattrenindatus(trenindati, 'training_data_batch_${Date.now()}.json');
      console.log("Apmācām modeli uzkrātajiem datiem");
      await apmacitmodeli(trenindati);
      trenindati.length = 0;
    }
  }

  if (trenindati.length > 0) {
    await apmacitmodeli(trenindati);
  }

  console.log("Rezultāti:", results);
}




function saglabattrenindatus(trenindati, filename = "training_data.json") {
  const blob = new Blob([JSON.stringify(trenindati)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}



async function apmacitmodeli(trenindati, epochs = 10, batchSize = 32) {
  console.log("Label vertibas:", trenindati.reduce((acc, d) => {
  acc[d.label] = (acc[d.label] || 0) + 1;
  return acc;
}, {}));

  if (!cnnModel) await izveidotCNNmodeli();

  console.log("Apmācības datu skaits (oriģināli):", trenindati.length);

  trenindati = trenindati.filter(d =>
    d &&
    typeof d === "object" &&
    Array.isArray(d.laukums) &&
    d.laukums.length === 4 &&
    d.laukums.every(row => Array.isArray(row) && row.length === 6) &&
    d.laukums.every(row => row.every(cell => ["", "O", "T"].includes(cell))) &&
    typeof d.label === "number" &&
    !isNaN(d.label) &&
    typeof d.player === "number" &&
    (d.player === 0 || d.player === 1)
  );

  if (trenindati.length === 0) {
    console.error("nav derīgu datu");
    return;
  }

  console.log("derīgo treniņdatu skaits:", trenindati.length);

  const xs = tf.concat(trenindati.map(d =>
    laukumsuztenzoru(d.laukums, d.player, d.merkavards)
  ), 0);

  const ys = tf.tensor(trenindati.map(d => d.label));
  const losses = [];

  cnnModel.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
    metrics: ['mse']
  });

  console.log("Label vērtību sadalījums:");
  const counts = trenindati.reduce((acc, d) => {
    acc[d.label] = (acc[d.label] || 0) + 1;
    return acc;
  }, {});
  console.log(counts);

  console.log("Pirmie 5 treniņdati:");
  trenindati.slice(0, 5).forEach(d => {
    const flat = d.laukums.flat().map(cell => {
      if (cell === "") return 0;
      if (cell === "O") return d.player === 0 ? 1 : -1;
      if (cell === "T") return d.player === 0 ? 2 : -2;
      return null;
    });
    console.log("Input:", flat, "| Label:", d.label);
  });

  await cnnModel.fit(xs, ys, {
    epochs,
    batchSize,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        const loss = logs.loss;
        if (typeof loss === "number") {
          losses.push(loss);
          console.log(`Epoch ${epoch + 1}: Loss = ${loss.toFixed(4)}`);
        } else {
          console.warn(`kļūda epohā ${epoch + 1}`, logs);
        }
      },
      onTrainEnd: () => {
        console.log("Visi loss:", losses);
      }
    }
  });

  xs.dispose();
  ys.dispose();

  await cnnModel.save('indexeddb://TootOttoCNN3');
  console.log("Modelis saglabāts pēc apmācības!");
}
