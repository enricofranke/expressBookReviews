const express = require('express');
const axios = require('axios'); // Axios für HTTP-Anfragen hinzufügen
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

/**
 * Task 10: Get the book list available in the shop using Promises or async/await
 */
public_users.get('/', async function (req, res) {
  try {
    // Simuliere, dass wir Bücher asynchron von einer API abrufen
    const getBooks = new Promise((resolve, reject) => {
      setTimeout(() => resolve(books), 2000);
    });

    const bookList = await getBooks;
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while fetching the book list." });
  }
});

/**
 * Task 11: Get book details based on ISBN using Promises or async/await
 */
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const getBookByISBN = new Promise((resolve, reject) => {
      const isbn = req.params.isbn;
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });

    const bookDetails = await getBookByISBN;
    return res.status(200).send(bookDetails);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

/**
 * Task 12: Get book details based on Author using Promises or async/await
 */
public_users.get('/author/:author', async function (req, res) {
  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const author = req.params.author;
      const matchingBooks = Object.values(books).filter(book => book.author === author);

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found by that author");
      }
    });

    const booksByAuthor = await getBooksByAuthor;
    return res.status(200).send(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

/**
 * Task 13: Get book details based on Title using Promises or async/await
 */
public_users.get('/title/:title', async function (req, res) {
  try {
    const getBooksByTitle = new Promise((resolve, reject) => {
      const title = req.params.title;
      const matchingBooks = Object.values(books).filter(book => book.title === title);

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found with that title");
      }
    });

    const booksByTitle = await getBooksByTitle;
    return res.status(200).send(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

/**
 * Task 6: User Registration
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Username is not valid" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

module.exports.general = public_users;