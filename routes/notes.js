const express = require("express");
const router = express.Router();
const { getAllNotes, createNote, updateNote, updateAll, deleteNote } = require("../controllers/notes");

router.route("/notes").get(getAllNotes);
router.route("/create").post(createNote);
router.route("/update").post(updateNote);
router.route("/updateall").post(updateAll);
router.route("/delete/:id").delete(deleteNote);

module.exports = router;
