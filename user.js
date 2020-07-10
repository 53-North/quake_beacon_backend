"use strict";
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "quake_beacon"
});

app.get("/user", function(req, res) {
  const query = "SELECT userID, user_firstName, user_lastName, user_phone, user_email, user_markedSafe, user_loggedIn FROM user;"

  connection.query(query, function(err, data) {
    if (err) {
      console.log("Error fetching user", err);
      res.status(500).json({
        error: err
      });
    } else {
      res.json({
        user: data
      });
    }
  });
});

app.get("/user/login/:email", function(req, res) {
  const query = "SELECT * FROM user WHERE user_email= ?";

  connection.query(query, [req.params.email], function(err, data) {
    if (err) {
      console.log("Error fetching user", err);
      res.status(500).json({
        error: err
      });
    } else {
      res.json({
        user: data
      });
    }
  });
});

app.post("/user", function(req, res) {
  const query = "INSERT INTO user (user_phone, user_firstName, user_lastName, user_markedSafe) VALUES (?, ?, ?, ?);";
  const querySelect = "SELECT * FROM user WHERE userID = ?";

  connection.query(query, [req.body.user_phone, req.body.user_firstName, req.body.user_lastName, req.body.user_markedSafe], function(error, data) {
    if(error) {
      console.log("Error adding a user", error);
      res.status(500).json({
        error: error
      })
    } else {
      connection.query(querySelect, [data.insertId], function(error, data) {
        if(error) {
          console.log("Error getting the user", error);
          res.status(500).json({
            error: error
          })
        } else {
          res.status(201).json({
            user: data
          })
        }
      })
    }
  })
});

app.put('/user/:userID', function(req, res) {

  const query = "UPDATE user SET user_phone = ?, user_email = ?, user_firstName = ?, user_lastName = ?, user_markedSafe = ?, user_loggedIn = ? WHERE userID = ?;";
  const querySelect = "SELECT * FROM user WHERE userID = ?";

  connection.query(query, [req.body.user_phone, req.body.user_email, req.body.user_firstName, req.body.user_lastName, req.body.user_markedSafe, req.body.user_loggedIn, req.params.userID], function(error, data) {

    if(error) {
      console.log("Error updating a user", error);
      res.status(500).json({
        error: error
      })
    } else {
      connection.query(querySelect, [req.params.userID], function(error, data) {
        if(error) {
          console.log("Error getting the user", error);
          res.status(500).json({
            error: error
          })
        } else {
          res.status(200).json({
            user: data
          })
        }
      })
    }
  })
});

app.delete('/user/:userID', function(req, res) {
  const query = "DELETE FROM user WHERE userID = ?;";
  const querySelect = "SELECT * FROM user"; // to verify its deleted, printing them all out seems like overkill though

  connection.query(query, [req.params.userID], function(error, data) {
    if(error) {
      console.log("Error deleting a user", error);
      res.status(500).json({
        error: error
      })
    } else {
      connection.query(querySelect, function(error, data) {
        if(error) {
          console.log("Error getting the user", error);
          res.status(500).json({
            error: error
          })
        } else {
          res.status(200).json({
            user: data
          })
        }
      })
    }
  })
});



module.exports.handler = serverless(app);