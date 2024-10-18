const cards = document.getElementsByClassName("fav-card");
const allButtons = document.getElementsByClassName("deleteButton");

var editable = 0;

function toggleEdit() {
  let editIcon = document.getElementById("edit-icon");
  let trashIcon = document.getElementById("trash-icon");

  if (editable) {
  
    if (confirm("Are you sure you want to make thoses changes ?")) {
      editable = 0;
      trashIcon.style.display = "none";
      editIcon.style.display = "block";

      Array.from(cards).forEach(card => {
        if (card.querySelector(".deleteButton").checked) {
          let data = JSON.parse(card.getAttribute("data"));
          fetch("/removefavorite", {
            method: "DELETE",
            body: JSON.stringify({ name: data.name}),
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then(response => {
            console.log("Response status:", response.status); 
            if (response.ok) {
              console.log("Favorite removed");
              location.reload();
              let cardDeleteButton = document.getElementsByClassName("deleteButton");
              Array.from(cardDeleteButton).forEach(button => {
                button.checked = false;
              });
            } else {
              console.error("Failed to remove favorite");
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });          
        }
      });
    }
  } else {
    let cardDeleteButton = document.getElementsByClassName("deleteButton");
    Array.from(cardDeleteButton).forEach(button => {
      button.checked = false;
    });
    editable = 1;
    editIcon.style.display = "none";
    trashIcon.style.display = "block";
    console.log("edit");
  }
  
  
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

Array.from(cards).forEach(card => {
  let data = JSON.parse(card.getAttribute("data"));
  card.querySelector(".fav_cover").style.backgroundImage = data.cover_url;
  card.addEventListener("click", ()=> {

    if (!editable) {
      let main = document.getElementById("main-card");
      main.classList.remove("active");

      let cardDeleteButton = card.querySelector(".deleteButton");
      if (cardDeleteButton.checked) {
        Array.from(allButtons).forEach(button => {
          button.checked = false;
        });
        cardDeleteButton.checked = true;
        sleep(300).then(() => { 
          main.querySelector("#card-img").style.backgroundImage = data.cover_url;
          main.querySelector("#game-name").innerText = data.name;
          main.querySelectorAll(".infoBubble")[0].innerText = data.lifetime;
          main.querySelectorAll(".infoBubble")[1].innerText = data.developer;
          main.querySelectorAll(".infoBubble")[2].innerText = data.sales;
          main.querySelectorAll(".infoBubble")[3].innerText = data.genre;
          main.querySelectorAll(".infoBubble")[4].innerText = data.release_year;
          main.querySelector("#storyline").innerText = data.story;
          main.classList.add("active");
        });
      }
    } else {
      let cardDeleteButton = card.querySelector(".deleteButton");
      if (cardDeleteButton.checked) {
        card.classList.add("selected");
        console.log("selected");
      } else {
        card.classList.remove("selected");
        console.log("deselected");
      }
    }
  })
})