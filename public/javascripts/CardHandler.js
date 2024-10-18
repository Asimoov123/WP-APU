const cards = document.getElementsByClassName("cards");
const criticScore = document.getElementsByClassName("score");
const cardInfos = document.getElementsByClassName("cardInfos");
const scroller = document.getElementById("cardsScroller");
const likeButtons = document.getElementsByClassName("likeButton");

var loggedIn = JSON.parse(document.getElementsByTagName("body")[0].getAttribute("data-user"));

cards[0].classList.add("mainCard");



// Function to adapt the IGDB url

function modifyImageUrl(url) {
  if (url.includes('t_thumb')) {
      return url.replace('t_thumb', 't_cover_big');
  }
  return url;
}


// Loop on each card to add the event listener for the scroll reset and retrieve image and storyline from IGDB

Array.from(cards).forEach(card => {
  let gamename = card.getAttribute('data-name');

  // Verify if the game is in the library
  if (loggedIn != null) {
    fetch('/checkfav', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ name: gamename })
    })
    .then(result => result.json())
    .then(data => {
      if (data.found) {
        card.querySelector(".likeButton").checked = true;
        console.log("found in library");
      } else {
        console.log("not found");
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      console.log("Erro when fetching fav for :", gamename);
    });
  }

   fetch('/retrieveInfos', { 
     method: 'POST',
     headers: {
       'Content-Type': 'application/json', 
     },
     body: JSON.stringify({ name: gamename })
   })
   .then(response => response.json())
   .then(data => {

     if (data.success) {
       const storylineElement = card.querySelector('.storyline');
       const artworkElement = card.querySelector('.card-img-container');

       if (storylineElement) {
         storylineElement.innerText = data.storyline || 'No storyline available';
       }

       if (artworkElement && data.artworksUrl) {
         artworkElement.style.backgroundImage = `url(${modifyImageUrl(data.artworksUrl)})`;
       } else if (artworkElement) {
         console.log("no-image");
       }
     } else {
       console.error("Failed to retrieve game details:", data.message);
     }
   })
   .catch((error) => {
     console.error('Error:', error);
   });
});

Array.from(criticScore).forEach(critic => {
  let value = critic.innerText;
  if (value > 90) {
    critic.style.backgroundColor = "rgb(0, 128, 6)";
  } else if (value <= 90 && value > 70) {
    critic.style.backgroundColor = "rgb(192, 5, 148)";
  } else if (value <= 70 && value > 50) {
    critic.style.backgroundColor = "rgb(33, 5, 192)";
  } else {
    critic.style.backgroundColor = "rgb(214, 0, 0)";
  }
});

// Add db interactions to fav button

Array.from(likeButtons).forEach(liked => {
  if (loggedIn != null) {
    liked.addEventListener("click", ()=> {
      let card = liked.closest('.cards');
      let name = card.getAttribute('data-name');
      if (liked.checked) {
        let cover = card.querySelector(".card-img-container").style.backgroundImage;
        let story = card.querySelector(".storyline").innerText;
  
        let infos = card.querySelectorAll(".infoBubble");
        let lifetime = infos[0].innerText;
        let developper = infos[1].innerText;
        let sales = infos[2].innerText;
        let genre = infos[3].innerText;
        let year = infos[4].innerText;
  
        fetch('/addfavorite', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: name, cover: cover, story: story, lifetime: lifetime, developper: developper, sales: sales, genre: genre, year: year }),
        })
        .then(response => response.json())
        .then(data => {
          console.log(data.executed);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
        
      } else {
        fetch('/removefavorite', { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name : name}),
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
      }
    })
  } else {
    liked.disabled = true;
  }
});

// Function for the slider

let pos = 0;

function updateCarouselPosition() {
  const cardWidth = parseFloat(getComputedStyle(cards[pos]).width); 
  const cardMargin = window.innerWidth * 0.05;

  const offset = pos * (cardWidth + 2 * cardMargin);
  const translateX = `calc(50% - (${cardWidth}px / 2 + ${cardMargin}px) - ${offset}px)`;

  scroller.style.transform = `translateX(${translateX})`;
}


window.addEventListener("resize", ()=> {
  updateCarouselPosition();
})



function slideRight() {
  if (pos < Array.from(cards).length - 1) {
    cards[pos].classList.remove('mainCard'); 
    pos += 1;
    updateCarouselPosition(); 
    cards[pos].classList.add('mainCard'); 
  }
  if (pos == Array.from(cards).length - 1) {
    document.getElementById("rightArrow").style.display = "none";
    if (Array.from(cards).length == 2) {
      document.getElementById("leftArrow").style.display = "block";
    }
  } else {
    document.getElementById("leftArrow").style.display = "block";
  }
}

function slideLeft() {
  if (pos > 0) {
    cards[pos].classList.remove('mainCard'); 
    pos -= 1;
    updateCarouselPosition(); 
    cards[pos].classList.add('mainCard');
  }
  console.log("hey");
  if (pos == 0) {
    document.getElementById("leftArrow").style.display = "none";
    if (Array.from(cards).length == 2) {
      document.getElementById("rightArrow").style.display = "block";
    }
  } else {
    document.getElementById("rightArrow").style.display = "block";
  }
}



