


function getLoggedStatus () {
  let loggedButton = document.getElementById("profileButton");
  let unloggedButton = document.getElementById("loginButton");
  let favorites = document.getElementById("libraryButton");
  fetch("/retrieveId", {
    method : "GET"
  })
  .then(response => response.json())
  .then(data => {
    if (data.user != null) {
      loggedButton.style.display = "block";
      favorites.style.display = "block";
      unloggedButton.style.display = "none"
      
    } else {
      loggedButton.style.display = "none";
      favorites.style.display = "none";
      unloggedButton.style.display = "block"
    }
  })
}

getLoggedStatus();