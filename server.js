const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

dotenv.config({ path: "./config/config.env" });
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Api Routes
const notes = require("./routes/notes");
app.use("/api", notes);

// Express error handler
app.use((error, req, res, next) => {
  if (error.name === "CastError") {
    return res.status(404).json({ error: { message: `Resource not found ` } });
  }
  if (error.code === 11000) {
    return res.status(404).json({ error: { message: "Duplicate found" } });
  }
  if (error.name === "ValidationError") {
    const err = Object.values(error.errors).map((e) => e.message);
    return res.status(404).json({ error: { message: `${err.join(". ")}` } });
  }

  res.status(error.statusCode || 500);
  res.json({
    error: {
      message: error.message || "Not Found",
    },
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server started on PORT ${PORT}`);
});
