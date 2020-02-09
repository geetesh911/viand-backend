const mongoose = require("mongoose");

const CardSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: String
    // required: true
  },
  menu: [
    {
      food: {
        type: String,
        required: true
      },
      price: {
        type: Number
      }
    }
  ],
  review: {
    type: String,
    default: null
  },
  zomato: {
    type: String,
    default: null
  },
  beenThere: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  thumb: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  photos: {
    type: Array,
    default: null
  }
});

module.exports = mongoose.model("card", CardSchema);
