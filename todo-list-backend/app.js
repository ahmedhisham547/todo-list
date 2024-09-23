const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();
const TodoModel = require("./models/Todo");
const User = require("./models/users");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("connected to database"))
  .catch((err) => console.log(err));

app.get("/get", (req, res) => {
  TodoModel.find()
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});

app.post("/add", authenticateToken, (req, res) => {
  const task = req.body.task;
  TodoModel.create({
    task: task,
  })
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});
app.put("/update/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  TodoModel.findByIdAndUpdate({ _id: id }, { done: true })
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});
app.delete("/delete/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  TodoModel.findByIdAndDelete({ _id: id })
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});

app.post("/register", async (req, res) => {
  try {
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // Create a new user
    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
    });

    // Save the user
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json(err);
  }
});
app.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body);

    // Check if both username and password are provided
    if (!req.body.username || !req.body.password) {
      return res.status(400).json("Username and password are required");
    }

    // Find user by username
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    // const validPassword = req.body.password === user.password;
    if (!validPassword) {
      return res.status(400).json("Invalid password");
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      { username: user.username },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json(err);
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Auth Header:", authHeader); // Log the Authorization header
  console.log("Token:", token); // Log the extracted token
  if (token === null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification error:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log("Authenticated User:", user); // Log the authenticated user
    next();
  });
}

app.listen(5000, () => {
  console.log("server is running");
});
