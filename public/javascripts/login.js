
// Will generate error when login
let header = document.getElementsByTagName("header")[0];
let formLogin = document.getElementById("loginForm");
let formSignup = document.getElementById("signupForm");


function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


const slider = document.getElementById("optionSlider");
const main = document.getElementsByTagName("main")[0];


function activateLogin() {
  main.style.height = "281px";

  document.getElementById("signupForm").children[0].style.display = "none";

  document.getElementById("login").classList.remove("active");
  document.getElementById("signup").classList.add("active");
  slider.style.left = "-1px"
  main.style.borderRadius = "0px 20px 20px 20px";

  sleep(300)
  .then(()=> {
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("signupForm").style.display = "none";
  });

}

function activateSignup() {
  main.style.height = "381.5px";

  document.getElementById("login").classList.add("active");
  document.getElementById("signup").classList.remove("active");
  slider.style.left = "calc(50% - 1px)";
  main.style.borderRadius = "20px 0px 20px 20px";

  sleep(300)
  .then(()=> {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").children[0].style.display = "flex";
    document.getElementById("signupForm").style.display = "flex";
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
  pwd.style.backgroundColor = "rgb(26, 26, 26)";

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

  if (mail.value == "" || !nameRegex.test(surname.value) || !nameRegex.test(name.value) || pwd.value == "") {
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
    if (pwd.value == "") {
      pwd.style.backgroundColor = "rgb(105, 0, 0)";
      pwd.animate(shake,{
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

        if (!response.password) {
          pwd.style.backgroundColor = "rgb(105, 0, 0)";
          pwd.animate(shake,{
            duration: 200, 
            iterations: 1
          });
        }
      }
    }));
  }
});