const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const User = require("../models/User");
const Card = require("../models/Card");

const router = express.Router();

// @routes  GET api/cards
// @desc    Get all user cards
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(cards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @routes  POST api/cards
// @desc    Add a card
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("name", "Name is required").not().isEmpty(),
      check("zomato", "Enter correct URL").isURL(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0].msg });
    }

    const {
      name,
      rating,
      menu,
      date,
      review,
      zomato,
      beenThere,
      thumb,
      location,
      photos,
    } = req.body;

    try {
      let aleradyExist = await Card.find({ name: name });
      if (aleradyExist.length > 0)
        return res.status(400).json({ msg: "Place already exist" });

      const newCard = new Card({
        name,
        rating,
        date: new Date(date).toISOString(),
        menu,
        review,
        zomato,
        beenThere,
        thumb,
        location,
        photos,
        user: req.user.id,
      });

      const card = await newCard.save();

      res.json(card);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @routes  PUT api/cards/:id
// @desc    Update a card
// @access  Public
router.put("/:id", auth, async (req, res) => {
  const { name, rating, menu, date, review, zomato, beenThere } = req.body;

  menu.forEach((m) => {
    if (m.price === "undefined") m.price = undefined;
  });

  // Build a card object
  const cardFields = {};

  if (name) cardFields.name = name;
  if (rating) cardFields.rating = rating;
  if (menu) cardFields.menu = menu;
  if (review) cardFields.review = review;
  if (date) cardFields.date = new Date(date).toISOString();
  if (zomato) cardFields.zomato = zomato;
  if (beenThere) cardFields.beenThere = beenThere;
  // if (date) cardFields.date = date;

  try {
    let card = await Card.findById(req.params.id);

    if (!card) return res.status(500).json({ msg: "Card not found" });

    // Make sure user owns card

    if (card.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Authorized" });
    }

    card = await Card.findOneAndUpdate(
      { _id: req.params.id },
      { $set: cardFields },
      { new: true }
    );

    // card = await Card.findByIdAndUpdate(
    //   req.params.id,
    //   { $set: cardFields },
    //   { new: true }
    // );

    res.json(card);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @routes  DELETE api/cards/:id
// @desc    delete a card
// @access  Public
router.delete("/:id", auth, async (req, res) => {
  try {
    let card = await Card.findById(req.params.id);

    if (!card) return res.status(500).json({ msg: "Card not found" });

    // Make sure user owns the card
    if (card.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Authorized" });
    }

    await Card.findByIdAndRemove(req.params.id);

    res.json({ msg: "Card Removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", [validateObjectId, auth], async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).select("-__v");

    if (!card) return res.status(500).json({ msg: "Card not found" });

    res.json(card);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
