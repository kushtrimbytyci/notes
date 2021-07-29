const NotesSchema = require("../models/NotesSchema");
const errorHandler = require("../helpers/errorHandler");
const asyncHandler = require("../helpers/asyncHandler");

//@desc     Get all notes
//@route    GET /api/notes
//@access   Public
exports.getAllNotes = asyncHandler(async (req, res, next) => {
  const notes = await NotesSchema.find();
  if (!notes) {
    return next(new errorHandler("No notes found", 400));
  }

  res.status(200).json({ success: true, data: notes });
});

//@desc     Create a new note
//@route    POST /api/create
//@access   Public
exports.createNote = asyncHandler(async (req, res, next) => {
  const { order, content } = req.body;

  const note = await NotesSchema.create({ order, content });

  res.status(200).json({ success: true, message: "Note created", data: note });
});

//@desc     Update a single note
//@route    POST /api/update
//@access   Public
exports.updateNote = asyncHandler(async (req, res, next) => {
  const { order, content, id } = req.body;

  await NotesSchema.findByIdAndUpdate(id, { order, content }, { new: true });

  res.status(200).json({ success: true, message: "Note updated" });
});

//@desc     Update all notes(used for order update)
//@route    POST /api/updateall
//@access   Public
exports.updateAll = asyncHandler(async (req, res, next) => {
  for (note of req.body) {
    await NotesSchema.findByIdAndUpdate(note._id, note);
  }
  const notes = await NotesSchema.find();

  res.status(200).json({ success: true, message: "Notes updated", data: notes });
});

//@desc     Delete a note
//@route    DELETE /api/delete/;id
//@access   Public
exports.deleteNote = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new errorHandler("Id is missing", 400));
  }
  const note = await NotesSchema.findByIdAndDelete(id);
  if (!note) {
    return next(new errorHandler(`Note doesn't exist`, 400));
  }

  res.status(200).json({ success: true, message: "Note deleted" });
});
