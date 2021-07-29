const mongoose = require("mongoose");

const NotesSchema = new mongoose.Schema({
  order: {
    type: Number,
    default: 0,
  },
  content: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("NotesSchema", NotesSchema);
