// Spēles vides pamata kods aizgūts no (yousssef, 2024) - https://github.com/JooZef315/Toot-and-Otto-Board-Game/blob/master/scripts/main.js
// Tas tika papildināts ar hibrīdā risinājuma izstrādi
const Burti = ["O", "T"];
let Uzvarsunas = [];
let Spelebeidzas = false;
let speletaji;

let Pieejamieburti = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];

let pirmais = {
  nosaukums: "pirmais",
  pieejamieburti: [...Pieejamieburti],
  color: "red",
  seq: [1, 0, 0, 1],
  skaits: 0,
};
let otrais = {
  nosaukums: "otrais",
  pieejamieburti: [...Pieejamieburti],
  color: "yellow",
  seq: [0, 1, 1, 0],
  skaits: 0,
};

let Aktivaisburts = 0;
let Aktivaisspeletajs = pirmais;
let Aktivakolonna = 0;

Speletaji().then((init) => {
  speletaji = init;
  Aktivaisspeletajs = init.starter;

  if (init.Computer === 'train') {
    console.log("Sākas passpeles");
    passpeles(10000);
    return;
  }
});


var HeaderRow = [...document.getElementsByTagName("tr")].slice(0, 1)[0];
var HeaderCells = [...HeaderRow.children];
HeaderCells.map((h, index) => {
  h.addEventListener("mouseenter", () => {
    h.style.backgroundColor = Aktivaisspeletajs.color;
    h.classList.add("active-header");
    h.innerText = Burti[Aktivaisburts];
  });
  h.addEventListener("touchstart", () => {
    h.style.backgroundColor = Aktivaisspeletajs.color;
    h.classList.add("active-header");
    h.innerText = Burti[Aktivaisburts];
  });

  h.addEventListener("mouseout", () => {
    h.classList.remove("active-header");
    h.style.backgroundColor = "initial";
    h.innerText = "";
  });
  h.addEventListener("touchend", () => {
    h.classList.remove("active-header");
    h.style.backgroundColor = "initial";
    h.innerText = "";
  });

  h.addEventListener("wheel", () => {
    Aktivaisburts = Burti.length - 1 - Aktivaisburts;
    h.innerText = Burti[Aktivaisburts];
  });
  h.addEventListener("touchmove", () => {
    Aktivaisburts = Burti.length - 1 - Aktivaisburts;
    h.innerText = Burti[Aktivaisburts];
  });

  h.addEventListener("click", async () => {
    Aktivakolonna = index;
    if (Spelebeidzas) {
      alert("Sāc jaunu spēli");
    } 
    else {
      if (Sunas[0][Aktivakolonna].innerText == "") {
        if (Aktivaisspeletajs.pieejamieburti.includes(Aktivaisburts)) {
          Playing(Aktivakolonna, Aktivaisburts, Aktivaisspeletajs, speletaji?.Computer);

          const rezultats = onWinning();
          if (rezultats === 1 || rezultats === -1) {
            WinnerDeclaration(Aktivaisspeletajs);
          } 
          else if (rezultats === 0) {
            document.querySelector(".winner").innerText = "Neizšķirts!";
            document.querySelector(".winner").style.display = "block";
          }

          if (speletaji?.Computer === 'alphabeta') {
            datorsspele(Aktivaisspeletajs);
          } 
          else if (speletaji?.Computer === 'hybrid') {
            await hibridsdatorsspele(Aktivaisspeletajs, Aktivaisspeletajs === pirmais ? otrais : pirmais);
          } 
          else if (speletaji?.Computer === 'train') {
            passpeles(10);
          }

        } 
        else {
          alert("Tu iztērēji visus savus " + Burti[Aktivaisburts]);
        }
      } 
      else {
        alert("Kolonna ir pilna");
      }
    }
  });
});

document.getElementById("reset").addEventListener("click", () => {
  ResetGame();
});

function ResetGame() {
  // ieladetmodelinoDB(); 
  let Pieejamieburti = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
    pirmais.pieejamieburti = [...Pieejamieburti];
    otrais.pieejamieburti = [...Pieejamieburti];

  Spelebeidzas = false;
  Aktivaisspeletajs = pirmais;
  Aktivaisburts = 0;
  Aktivakolonna = 0;

  pirmais.pieejamieburti = [...Pieejamieburti];
  otrais.pieejamieburti = [...Pieejamieburti];
  UpdatePlayerboard(pirmais);
  UpdatePlayerboard(otrais);

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      Sunas[r][c].innerText = "";
      Sunas[r][c].style.backgroundColor = "";
      Sunas[r][c].style.color = "";
    }
  }

  const winnerDiv = document.querySelector(".winner");
  winnerDiv.style.display = "none";
  winnerDiv.innerText = "";

  HeaderCells.forEach(h => {
    h.innerText = "";
    h.style.backgroundColor = "initial";
  });

  console.log("Spēle atiestatīta");
}

async function ieladetmodelinoDB() {
  const modelis = await tf.loadLayersModel('indexeddb://TootOttoCNN3');
  await modelis.save('downloads://modelsestais');
}