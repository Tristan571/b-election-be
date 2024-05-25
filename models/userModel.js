const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
  },
  dob: {
    type: Date,
  },
  nationalId: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  walletAddress: {
    type: String,
    unique: true,
  },
  isVerified: {
    type: Boolean,
  },
});

const User = mongoose.model("userCollection", UserSchema);
module.exports = User;
