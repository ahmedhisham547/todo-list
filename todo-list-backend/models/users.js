const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate usernames
    trim: true, // Removes extra spaces
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Ensures password length
  },
});

// Hash the password before saving the user
usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare hashed passwords
usersSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Users", usersSchema);
