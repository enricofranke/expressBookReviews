const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Hilfsfunktion, um zu prüfen, ob ein Benutzername gültig ist.
 * (Die genaue Prüfung kann beliebig erfolgen.)
 */
const isValid = (username) => {
  // Beispiel: Wir geben hier nur true zurück oder man könnte prüfen,
  // ob der Name bestimmte Kriterien erfüllt
  return true;
};

/**
 * Hilfsfunktion, um zu prüfen, ob Username & Passwort in 'users' existieren.
 */
const authenticatedUser = (username, password) => {
  const matchingUser = users.find((user) => {
    return user.username === username && user.password === password;
  });
  return !!matchingUser; // true, wenn gefunden, sonst false
};

// Task 7: Login für registrierte User
// POST /customer/login
regd_users.post("/login", (req, res) => {
    console.log("loggin triggert")
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Prüfen, ob User existiert und Passwort korrekt ist
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password
      },
      "fingerprint_customer",
      { expiresIn: 60 * 60 } // Token gültig für 1h
    );

    // Session speichern
    req.session.authorization = {
      accessToken,
      username
    };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8: Add/Modify a book review
// PUT /customer/auth/review/:isbn
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  // Die Review kommt laut Task als Query-Parameter -> ?review=xyz
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in first." });
  }
  // Eigene Review des eingeloggten Users hinzufügen/überschreiben
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review successfully posted/updated" });
});

// Task 9: Delete a book review
// DELETE /customer/auth/review/:isbn
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in first." });
  }

  // Nur eigene Review löschen
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review successfully deleted" });
  } else {
    return res.status(404).json({ message: "No review found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;