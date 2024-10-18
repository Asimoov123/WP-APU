const form = document.getElementById("main-form");
const durationField = document.getElementById("select-duration");
const genreField = document.getElementById("select-genre");
const unityField = document.getElementById("select-unity");
const durationContainer = document.getElementById("select-duration-container");
const maxGamesInput = document.getElementById("select-results");
const variationInput = document.getElementById("select-timeVariation");

let maxGames = 10;
let variations = 15;
let shown = 0;


window.onload = function() {
  const navType = performance.getEntriesByType("navigation")[0].type;

  if (navType === 'navigate' || navType === 'back_forward') {
    shown = 0;
  }
}

function saveParameters() {
  const numberREGEX = /^\d+$/;  // Validates positive integers

  if (shown === 0) {
    shown = 1;
  
  } else {
    shown = 0;
  }
  if (numberREGEX.test(maxGamesInput.value)) {
    let parsedMaxGames = parseInt(maxGamesInput.value);
    if (parsedMaxGames <= 100) {
      maxGames = parsedMaxGames;
    } else {
      maxGames = 100;  // Limit to 100 if exceeded
    }
  } else {
    maxGames = 10;  // Default to 10 if not a valid number
  }

  if (numberREGEX.test(variationInput.value)) {
    let parsedVariations = parseInt(variationInput.value);
    if (parsedVariations <= 100 && parsedVariations > 0) {
      variations = parsedVariations;
    } else if (parsedVariations == 0) {
      variations = 15;
    } else {
      variations = 100;
    }
  } else {
    variations = 15;
  }
  maxGamesInput.value = maxGames;
  variationInput.value = variations;
}


form.addEventListener("submit", (e)=> {
  e.preventDefault();
  console.log("submit");
  let conditions = true;
  const numberREGEX = /^\d+$/;
  const shake = [
    {transform: "translateX(-20px)"},
    {transform: "translateX(20px)"},
    {transform: "translateX(-15px)"},
    {transform: "translateX(15px)"},
    {transform: "translateX(-10px)"},
    {transform: "translateX(10px)"},
    {transform: "translateX(-5px)"},
    {transform: "translateX(5px)"},
    {transform: "translateX(0px)"}
  ]

  durationField.style.backgroundColor = "rgb(26, 26, 26)";
  genreField.style.backgroundColor = "rgb(26, 26, 26)";
  unityField.style.backgroundColor = "rgb(26, 26, 26)";

  if (durationField.value == "" || !numberREGEX.test(durationField.value)) {
    conditions = false;
    durationField.style.backgroundColor = "rgb(105, 0, 0)";
    unityField.style.backgroundColor = "rgb(105, 0, 0)";
    durationContainer.animate(shake, 
      {
        duration: 200, 
        iterations: 1
      });
  }

  if (conditions == true) {
    var time = durationField.value;
    var genre = genreField.options[genreField.selectedIndex].value;
    if (unityField.options[unityField.selectedIndex].value == "hours") {
      time *= 60;
    }
    if (genreField.options[genreField.selectedIndex].value == "all") {
      genre = "ALL";
    }

    const formData = new FormData();
    formData.append('duration', time);
    formData.append('genre', genre);
    console.log(time, genre);
    window.location.href = `/search?duration=${time}&genre=${genre}&varia=${variations/100}&nb=${maxGames}`;
    
  }
})
