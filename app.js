var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const mysql = require('mysql2');
const fetch = require('node-fetch');

var user_id = null;

// SQL Connection

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Video-Games'
});


db.connect((err) => {
if (err) {
  console.error('Database connection failed:', err);
} else {
  console.log('Connected to the database');
}
});

let accessToken = null;

async function getAccessToken(client_id, client_secret) {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`;

  const response = await fetch(url, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    console.error("Error in token request: ", errorMessage);
    return null;
  }

  const data = await response.json();
  accessToken = data.access_token
  return data.access_token;
}

getAccessToken('9av7l7i045ybzxo5dqojmgigsyd3zc', '3sc3zyyboe8er68uy51ljq4409tpxn');

async function searchGameByName(accessToken, gameName) {
  const url = 'https://api.igdb.com/v4/games';

  const query = `
    fields id, name; 
    where name ~ "${gameName}"*;
    sort rating desc; 
    limit 1;
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Client-ID': '9av7l7i045ybzxo5dqojmgigsyd3zc',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'text/plain'
    },
    body: query,
  });

  const data = await response.json();
  
  if (data.length > 0) {
    return data[0].id;
  } else {
    return null;
  }
}


async function getGameDetails(accessToken, gameId) {
  const url = 'https://api.igdb.com/v4/games';

  const query = `
    fields storyline, cover.url; 
    where id = ${gameId};
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Client-ID': '9av7l7i045ybzxo5dqojmgigsyd3zc',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'text/plain'
    },
    body: query,
  });

  const data = await response.json();

  return data;
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Get events

app.get('/search', (req, res) => {
  const { duration, genre, varia, nb  } = req.query; 
  const parsedVaria = parseFloat(varia); 
  const parsedNb = parseInt(nb, 10);

  if (genre!='ALL') {
    let query = 'SELECT * FROM wp_data WHERE (CAST(SUBSTRING_INDEX(Main_Story_Average, "h", 1) AS UNSIGNED) * 60 + CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(Main_Story_Average, "h", -1), "m", 1) AS UNSIGNED)) BETWEEN ? AND ? AND (genre = ?) ORDER BY critic_score DESC LIMIT ?;';
    db.query(query, [duration-duration*parsedVaria, duration+duration*parsedVaria, genre, parsedNb], (err, results) => {
      if (err) throw err;
      res.render('search', { results: results || [], user : user_id });
    });
  } else {
    let query = 'SELECT * FROM wp_data WHERE (CAST(SUBSTRING_INDEX(Main_Story_Average, "h", 1) AS UNSIGNED) * 60 + CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(Main_Story_Average, "h", -1), "m", 1) AS UNSIGNED)) BETWEEN ? AND ? ORDER BY critic_score DESC LIMIT ?;';
    db.query(query, [duration-duration*parsedVaria, duration+duration*parsedVaria, parsedNb], (err, results) => {
      if (err) throw err;
      res.render('search', { results: results || [], user : user_id});
    });
  }
});

app.get('/profile', (req, res) => {
  if (user_id != null) {
    let query = 'SELECT name, surname, role, email FROM users WHERE id = ?;';
    db.query(query, [user_id], (err, results)=> {
      if (err) throw err;
      if (results[0].role == "admin") {
        db.query('SELECT COUNT(*) AS count FROM wp_data;', (err, res1)=> {
          if(err) throw err;
          game_count = res1;
          db.query('SELECT COUNT(*) AS count FROM users;', (err, res2)=> {
            if(err) throw err;
            user_count = res2;
            db.query('SELECT COUNT(*) AS count FROM favorites;', (err, res3)=> {
              if(err) throw err;
              fav_count = res3;
              db.query('SELECT id, name, surname, email FROM users LIMIT 10', (err, res4)=> {
                if (err) throw err;
                user_list = res4;
                res.render("profile", {user : user_id, role : results[0].role, game_c : res1[0].count, user_c : res2[0].count, fav_c: res3[0].count, u_list : user_list});
              });
            });
          });
        });
      } else {
        res.render("profile", {user : user_id, role : results[0].role, name : results[0].name, surname : results[0].surname, mail : results[0].email});
      }
    })
  } else {
    res.render("profile", {user : user_id});
  }
});

app.get('/library', (req, res) => {
  if (user_id != null) {
    let query = 'SELECT * FROM favorites WHERE user_id = ?;';
    db.query(query,user_id, (err, results) => {
      if (err) throw err;
      res.render("library", {cards : results, user : user_id});
    });
  } else {
    res.render("library", {cards : {}, user : user_id});
  }
  
});

app.get("/retrieveId", (req, res)=> {
  return res.status(200).json({user : user_id});
});

app.get("/signout", (req, res)=> {
  user_id = null;
  res.redirect("/profile");

})

// Post events

app.post('/addfavorite', (req, res) => {
  const {name, cover, story, lifetime, developper, sales, genre, year} = req.body;
  let query = "INSERT INTO favorites (user_id, name, cover_url, story, lifetime, developer, sales, genre, release_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
  db.query(query, [user_id, name, cover, story,lifetime , developper, sales, genre, year], (err, results) => {
    if (err) throw err;
    console.log("Added to the db");
    return res.status(200).json({executed : true});
  });
});


app.post('/retrieveInfos', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Game name is required',
    });
  }


  searchGameByName(accessToken, name)
    .then(gameId => {
      if (!gameId) {
        return res.status(404).json({
          success: false,
          message: 'Game not found',
        });
      }

      return getGameDetails(accessToken, gameId)
        .then(gameDetails => {
          if (!gameDetails || gameDetails.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'Game details not found',
            });
          }

          const details = gameDetails[0];
          
          let artworksUrl = null;
          if (details.cover && details.cover.url) {
            artworksUrl = `https:${details.cover.url}`;
          } else {
            artworksUrl = ``;
          }

          return res.status(200).json({
            success: true,
            storyline: details.storyline,
            artworksUrl: artworksUrl || 'No artwork available',
            message: `Game details retrieved successfully for ${name}`,
          });
        });
    })
    .catch(error => {
      console.error("Error during the request:", error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving game information',
      });
    });
});

app.post("/checkfav", (req, res) => {
  const {name} = req.body;
  let query = 'Select * FROM favorites WHERE user_id = ? AND name = ?';
  db.query(query, [user_id, name], (err, results)=> {
    if (err) throw err;
    if (results.length > 0) {
      console.log("Success : "+name);
      return res.status(200).json({ found: true });
    } else {
      console.log("Fail : "+name);
      res.status(200).json({ found: false });
    }
  });
});

app.post("/signup", (req, res) => {
  const mailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[a-zA-Z]+$/;
  const {name, surname, mail , password} = req.body;
  if (nameRegex.test(name) && mailRegex.test(mail) && password!="") {
    let query = 'Select * FROM users WHERE email = ?';
    db.query(query, [mail], (err, results)=> {
      if (err) throw err;
      if (results.length === 0) {
        bcrypt.hash(password, saltRounds, function(err, hash) {
          if (err) throw err;
          query = "INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?);";
          db.query(query, [name, surname, mail, hash], (err, results)=> {
            if (err) throw err;
            query = 'SELECT id FROM users WHERE email = ?;';
            db.query(query, [mail], (err, result_id)=> {
              if (err) throw err;
              user_id = result_id[0].id;
              return res.status(200).json({ success: true, name : true, surname : true, mail : true, password : true});
            })
          });
        });
      } else {
        console.log("User already exist");
        return res.status(401).json({ success: false, name : true, surname : true, mail : false, password : true});
      }
    });
  } else {
    let pwdStatus = true;
    let mailstatus = true;
    let namestatus = true;
    let surnamestatus = true;
    if (!nameRegex.test(name)) {
      namestatus = false;
    }
    if (!nameRegex.test(surname)) {
      surnamestatus = false;
    }
    if (!mailRegex.test(mail)) {
      mailstatus = false;
    }
    if (password == "") {
      pwdStatus = false;
    }
    console.log("Data doesn't match the db requirements");
    return res.status(401).json({ success: false, name : namestatus, surname : surnamestatus, mail : mailstatus, password : pwdStatus});
  }
});

app.post("/login", (req, res)=> {
  const {mail , password} = req.body;
  let query = 'SELECT password FROM users WHERE email = ?;';
  db.query(query, [mail], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      bcrypt.compare(password, results[0].password, function(err, result) {
        if (err) throw err;
        if (result) {
          query = 'SELECT id FROM users WHERE email = ?;';
          db.query(query, [mail], (err, result_id)=> {
            if (err) throw err;
            user_id = result_id[0].id;
            return res.status(200).json({ success: true, mail : true, password : true});
          });
        } else {
          console.log("Passwords don't match");
          return res.status(404).json({ success: false, mail : true, password : false});
        }
      });
    } else {
      console.log("User not found");
      return res.status(404).json({ success: false, mail : false, password : false});
    }
  });
});

app.post("/updateUser", (req, res)=> {
  const {name, surname, pwd1, pwd2} = req.body;
  const nameRegex = /^[a-zA-Z]+$/;
  if (nameRegex.test(surname) && nameRegex.test(name) && pwd1 === pwd2) {
    if (pwd1 != "") {
      bcrypt.hash(pwd1, saltRounds, function(err, hash) {
        if (err) throw err;
        let query = 'UPDATE users SET name = ?, surname = ?, password = ? WHERE id = ?;';
        db.query(query, [name, surname, hash, user_id], (err, results)=> {
          if (err) throw err;
        });
      });
    } else {
      let query = 'UPDATE users SET name = ?, surname = ? WHERE id = ?;';
      db.query(query, [name, surname, user_id], (err, results)=> {
        if (err) throw err;
      });
    }
    return res.status(200).json({success : true, name : true, surname : true, pwd : true});  
  } else {
    let nameStatus = true;
    let surnameStatus = true;
    let pwdStatus = true;
    if (!nameRegex.test(name)) {
      nameStatus = false;
    }
    if (!nameRegex.test(surname)) {
      surnameStatus = false;
    }
    if (pwd1 != pwd2) {
      pwdStatus = false;
    }
    console.log("data integrity error, JS have been disabled");
    return res.status(401).json({success : false, name : nameStatus, surname : surnameStatus, pwd : pwdStatus})
  }
});

app.post("/searchUser", (req, res)=> {
  const {search} = req.body;
  let query = "";
  let searchString = "";
  if (search == "") {
    searchString= "";
    query = 'SELECT id, name, surname, email FROM users LIMIT 10;';
  } else {
    searchString = `%${search}`;
    query= "SELECT id, name, surname, email FROM users WHERE name LIKE ?;"
  }
  db.query(query, [searchString], (err, results)=> {
    if (err) throw err;
    let user_list = results;
    query = 'SELECT name, surname, role, email FROM users WHERE id = ?;';
    db.query(query, [user_id], (err, results)=> {
      if (err) throw err;
      if (results[0].role == "admin") {
        db.query('SELECT COUNT(*) AS count FROM wp_data;', (err, res1)=> {
          if(err) throw err;
          game_count = res1;
          db.query('SELECT COUNT(*) AS count FROM users;', (err, res2)=> {
            if(err) throw err;
            user_count = res2;
            db.query('SELECT COUNT(*) AS count FROM favorites;', (err, res3)=> {
              if(err) throw err;
              fav_count = res3;
              return res.status(200).json({success : true,  u_list : user_list});
            });
          });
        });
      } else {
        return res.status(400).json({success : false, u_list : user_list});
      }
    })
  })
});

// Delete events

app.delete('/removefavorite', (req, res) => {
  const { name} = req.body; 
  let query = 'DELETE FROM favorites WHERE user_id = ? AND name = ?;';
  db.query(query, [user_id, name], (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false });
    }
    console.log("Removed from the db");
    return res.status(200).json({ success: true});
  });
});

app.delete("/deleteAccountUser", (req, res) => {
  if (user_id != null) {
    let query = 'DELETE FROM users WHERE id = ?;';
    db.query(query, [user_id], (err, results) => {
      if(err) throw err;
      console.log("User deleted");
      user_id = null;
      return res.status(200).json({success : true});
    });
  } else {
    return res.status(400).json({success : false});
  }
});

app.delete("/deleteAccountAdmin", (req, res)=> {
  const {id} = req.body;
  if (id != null && id!= 1) { // Different from user id
    let query = 'DELETE FROM users WHERE id = ?;';
    db.query(query, [id], (err, results) => {
      if(err) throw err;
      console.log("User deleted");
      return res.status(200).json({success : true});
    });
  } else {
    return res.status(400).json({success : false});
  }
});








// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
