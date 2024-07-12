require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const cors = require('cors')
const apiRoutes = require("./routes/index");

const errorMiddleware = require("./errors/error")

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api", apiRoutes)

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

// Error
app.use(errorMiddleware)

module.exports = app