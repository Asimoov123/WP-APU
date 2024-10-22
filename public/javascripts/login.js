
// Will generate error when login
let header = document.getElementsByTagName("header")[0];
let formLogin= document.getElementById("loginForm");
let formSignup= document.getElementById("signupForm");


function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


const slider = document.getElementById("optionSlider");
const main = document.getElementsByTagName("main")[0];
  

function activateLogin() {
  document.getElementById("loginForm").style.display = "flex";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("login").classList.remove("active");
  document.getElementById("signup").classList.add("active");
  slider.style.left = "-1px"
  sleep(300)
  .then(()=> {
    main.style.borderRadius = "0px 20px 20px 20px";
  });
}

function activateSignup() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "flex";
  document.getElementById("login").classList.add("active");
  document.getElementById("signup").classList.remove("active");
  slider.style.left = "calc(50% - 1px)";
  sleep(300)
  .then(()=> {
    main.style.borderRadius = "20px 0px 20px 20px";
  });
}

formLogin.addEventListener("submit", (e)=> {
  e.preventDefault();

  let mail = document.getElementById("mailLogin");
  let pwd = document.getElementById("passwordLogin");

  mail.style.backgroundColor = "rgb(26, 26, 26)";
  pwd.style.backgroundColor = "rgb(26, 26, 26)";

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
  ];

  if (mail.value == "") {
    mail.style.backgroundColor = "rgb(105, 0, 0)";
    mail.animate(shake,{
      duration: 200, 
      iterations: 1
    });
  } else {
    fetch("/login", {
      method : "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body : JSON.stringify({mail : mail.value, password : pwd.value})
      
    })
    .then((data) => data.json()
    .then(response => {
      if (response.success) {
        location.reload();
      } else {
        if (!response.mail) {
          mail.style.backgroundColor = "rgb(105, 0, 0)";
          mail.animate(shake, {
            duration: 200,
            iterations: 1
          });
          pwd.style.backgroundColor = "rgb(105, 0, 0)";
          pwd.animate(shake, {
            duration: 200,
            iterations: 1
          });
        }

        if (!response.password && response.mail) {
          pwd.style.backgroundColor = "rgb(105, 0, 0)";
          pwd.animate(shake, {
            duration: 200,
            iterations: 1
          });
        }
      }
    }));
  }
});

formSignup.addEventListener("submit", (e)=> {
  e.preventDefault();

  let mail = document.getElementById("mailSignup");
  let pwd = document.getElementById("passwordSignup");
  let name = document.getElementById("nameInput");
  let surname = document.getElementById("surnameInput");

  mail.style.backgroundColor = "rgb(26, 26, 26)";
  name.style.backgroundColor = "rgb(26, 26, 26)";
  surname.style.backgroundColor = "rgb(26, 26, 26)";

  const nameRegex = /^[a-zA-Z]+$/;
  
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
  ];

  if (mail.value == "" || !nameRegex.test(surname.value) || !nameRegex.test(name.value)) {
    if (mail.value == "") {
      mail.style.backgroundColor = "rgb(105, 0, 0)";
      mail.animate(shake,{
        duration: 200, 
        iterations: 1
      });
    }
    if (!nameRegex.test(name.value)) {
      name.style.backgroundColor = "rgb(105, 0, 0)";
      name.animate(shake,{
        duration: 200, 
        iterations: 1
      });
    }
    if (!nameRegex.test(surname.value)) {
      surname.style.backgroundColor = "rgb(105, 0, 0)";
      surname.animate(shake,{
        duration: 200, 
        iterations: 1
      });
    }
    
  } else {
    fetch("/signup", {
      method : "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body : JSON.stringify({name : name.value, surname : surname.value, mail : mail.value, password : pwd.value})
      
    })
    .then((data) => data.json()
    .then(response => {
      if (response.success) {
        location.reload();
      } else {
        if (!response.mail) {
          mail.style.backgroundColor = "rgb(105, 0, 0)";
          mail.animate(shake, {
            duration: 200,
            iterations: 1
          });
        }

        if (!response.name) {
          name.style.backgroundColor = "rgb(105, 0, 0)";
          name.animate(shake, {
            duration: 200,
            iterations: 1
          });
        }

        if (!response.surname) {
          surname.style.backgroundColor = "rgb(105, 0, 0)";
          surname.animate(shake, {
            duration: 200,
            iterations: 1
          });
        }

      }
    }));
  }
});


function toggleEditUser() {

  document.getElementById("userData").classList.add("editable");

  document.getElementById("edit-icon").style.display = "none";
  document.getElementById("saveButton").style.display = "block";
  document.getElementById("userMail").style.color = "rgb(74, 52, 61)";

  let surnameInput = document.getElementById("surnameUserInput");
  let nameInput = document.getElementById("nameUserInput");
  let name = document.getElementById("nameUser");
  let surname = document.getElementById("surnameUser");

  surnameInput.value = surname.innerText;
  nameInput.value = name.innerText;
  name.style.display ="none";
  surname.style.display ="none";
  surnameInput.style.display ="block";
  nameInput.style.display ="block";


  let rows = document.getElementsByClassName("userRows");
  Array.from(rows).forEach(row => {
    row.style.display = "flex";
  })

}

function saveData() {

  let surnameInput = document.getElementById("surnameUserInput");
  let nameInput = document.getElementById("nameUserInput");
  let pwd = document.getElementById("userpwd");
  let pwd2 = document.getElementById("confirmUserPwd");

  surnameInput.style.backgroundColor = "rgb(26, 26, 26)";
  nameInput.style.backgroundColor = "rgb(26, 26, 26)";
  pwd.style.backgroundColor = "rgb(26, 26, 26)";
  pwd2.style.backgroundColor = "rgb(26, 26, 26)";

  const nameRegex = /^[a-zA-Z]+$/;
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
  ];

  if (nameRegex.test(surnameInput.value) && nameRegex.test(nameInput.value) && pwd.value === pwd2.value) {
    document.getElementById("userData").classList.remove("editable");
    fetch("/updateUser", {
      method : "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body : JSON.stringify({name : nameInput.value, surname : surnameInput.value, pwd1 : pwd.value, pwd2 : pwd2.value})  
    })
    .then(data => data.json()
    .then(response => {
      if (response.success) {
        location.reload();
      } else {
        if (!response.name) {
          nameInput.style.backgroundColor = "rgb(105, 0, 0)";
          nameInput.animate(shake, {
            duration: 200,
            iterations: 1
          });
        }
        if (!response.surname) {
          surnameInput.style.backgroundColor = "rgb(105, 0, 0)";
          surnameInput.animate(shake, {
            duration: 200,
            iterations: 1
          });
        }
        if (!response.password) {
          pwd2.style.backgroundColor = "rgb(105, 0, 0)";
          pwd2.animate(shake, {
            duration: 200,
            iterations: 1
          });
        }
      }
    }));
  } else {
    if (!nameRegex.test(nameInput.value)) {
      nameInput.style.backgroundColor = "rgb(105, 0, 0)";
      nameInput.animate(shake, {
        duration: 200,
        iterations: 1
      });
    }
    if (!nameRegex.test(surnameInput.value)) {
      surnameInput.style.backgroundColor = "rgb(105, 0, 0)";
      surnameInput.animate(shake, {
        duration: 200,
        iterations: 1
      });
    }
    if (pwd.value != pwd2.value) {
      pwd2.style.backgroundColor = "rgb(105, 0, 0)";
      pwd2.animate(shake, {
        duration: 200,
        iterations: 1
      });
    }
  }
};

function deleteAccountUser() {
  if(confirm("Are you sure you want to delete your account ?")) {
    fetch("/deleteAccountUser", {
      method : "DELETE"
    })
    .then(data => data.json()
    .then(response => {
      if (response.success) {
        window.location.href = "/";
      } else {
        console.log("User not found, shouldn't be able to do that");
      }
    }));
  } 
}

function searchUser() {
  let search = document.getElementById("searchInput").value;
  fetch("/searchUser", {
    method : "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({search : search})
  })
  .then(response => response.json()
  .then(data => {
    document.getElementById('resultsContainer').innerHTML="";
    if(data.success) {
      Array.from(data.u_list).forEach(item => {
        createItemElement(item);
      });
    }
  }));
};


function createItemElement(data) {

  const searchItemDiv = document.createElement('div');
  searchItemDiv.classList.add('search-items');

  const svgElement = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svgElement.classList.add('trash-icon');
  svgElement.setAttribute('id', 'trash-icon');
  svgElement.setAttribute('x', '0px');
  svgElement.setAttribute('y', '0px');
  svgElement.setAttribute('width', '26');
  svgElement.setAttribute('height', '26');
  svgElement.setAttribute('viewBox', '0 0 26 26');
  svgElement.setAttribute('fill', 'currentColor');
  svgElement.setAttribute('onclick', `searchUser(${data.id})`);


  const pathElement = document.createElementNS('http://www.w3.org/2000/svg','path');
  pathElement.setAttribute('d', 'M 11 -0.03125 C 10.164063 -0.03125 9.34375 0.132813 8.75 0.71875 C 8.15625 1.304688 7.96875 2.136719 7.96875 3 L 4 3 C 3.449219 3 3 3.449219 3 4 L 2 4 L 2 6 L 24 6 L 24 4 L 23 4 C 23 3.449219 22.550781 3 22 3 L 18.03125 3 C 18.03125 2.136719 17.84375 1.304688 17.25 0.71875 C 16.65625 0.132813 15.835938 -0.03125 15 -0.03125 Z M 11 2.03125 L 15 2.03125 C 15.546875 2.03125 15.71875 2.160156 15.78125 2.21875 C 15.84375 2.277344 15.96875 2.441406 15.96875 3 L 10.03125 3 C 10.03125 2.441406 10.15625 2.277344 10.21875 2.21875 C 10.28125 2.160156 10.453125 2.03125 11 2.03125 Z M 4 7 L 4 23 C 4 24.652344 5.347656 26 7 26 L 19 26 C 20.652344 26 22 24.652344 22 23 L 22 7 Z M 8 10 L 10 10 L 10 22 L 8 22 Z M 12 10 L 14 10 L 14 22 L 12 22 Z M 16 10 L 18 10 L 18 22 L 16 22 Z');
  svgElement.appendChild(pathElement);

  const idParagraph = document.createElement('p');
  idParagraph.textContent = `Id : ${data.id}`;

  const nameParagraph = document.createElement('p');
  nameParagraph.textContent = `Name : ${data.name}`;

  const surnameParagraph = document.createElement('p');
  surnameParagraph.textContent = `Surname : ${data.surname}`;

  const emailParagraph = document.createElement('p');
  emailParagraph.textContent = `Mail : ${data.email}`;

  searchItemDiv.appendChild(svgElement); 
  searchItemDiv.appendChild(idParagraph);
  searchItemDiv.appendChild(nameParagraph); 
  searchItemDiv.appendChild(surnameParagraph); 
  searchItemDiv.appendChild(emailParagraph); 

  document.getElementById('resultsContainer').appendChild(searchItemDiv);
}

function deleteUserAdmin(id) {
  if(confirm("Are you sure you want to delete your account ?") && id!=1) {
    fetch("/deleteAccountAdmin", {
      method : "DELETE",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id : id})
    })
    .then(data => data.json()
    .then(response => {
      if (response.success) {
        location.reload();
      } else {
        console.log("User not found, shouldn't be able to do that");
      }
    }));
  } 
}
