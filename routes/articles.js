const express = require("express");
const router = express.Router();
const { ensureAuth, isEditor } = require("../middleware/auth");
const Article = require("../models/Article"); // Ensure this path matches the location of your Article model
const mongoose = require("mongoose");

// Display form to add a new article
router.get("/add", isEditor, (req, res) => {
  res.render("articles/add");
});

// Submit a new article
router.post("/", isEditor, async (req, res) => {
  try {
    // Assign article status based on checkbox; default to 'private' if unchecked
    const status = req.body.status ? "public" : "private";
    await Article.create({
      ...req.body,
      status,
      authorId: req.user.id, // Assuming you have a user object available
    });
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// Show all public articles
router.get("/", ensureAuth, async (req, res) => {
  try {
    const articles = await Article.find({ status: "public" })
      .populate("authorId")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("articles/index", { articles });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// Show all articles by a specific user
router.get("/user/:userId", ensureAuth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).send("Invalid user ID");
  }

  try {
    const articles = await Article.find({
      authorId: req.params.userId,
      status: "public",
    })
      .populate("authorId")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("articles/index", { articles });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// Get a single article by ID
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("authorId")
      .lean();
    if (!article) {
      return res.render("error/404");
    }
    res.render("articles/show", { article });
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

// Display form to edit an article
router.get("/edit/:id", isEditor, async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      authorId: req.user.id,
    }).lean();

    if (!article) {
      return res.render("error/404");
    }
    res.render("articles/edit", { article });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// Update an article
router.put("/:id", isEditor, async (req, res) => {
  try {
    let article = await Article.findById(req.params.id).lean();
    if (!article) {
      return res.render("error/404");
    }
    if (article.authorId.toString() !== req.user.id) {
      res.redirect("/articles");
    } else {
      await Article.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// Change article status
router.post("/status/:id", isEditor, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.render("error/404");
    }
    if (article.authorId.toString() !== req.user.id) {
      return res.redirect("/dashboard");
    } else {
      article.status = req.body.newStatus;
      await article.save();
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// Delete an article
router.delete("/delete/:id", isEditor, async (req, res) => {
  try {
    await Article.deleteOne({ _id: req.params.id, authorId: req.user.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
