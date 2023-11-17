const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const logger = require("./middlewares/logger");
const postsRoute = require("./routes/posts");
const usersRoute = require("./routes/author");
const commentsRoute = require("./routes/comment");
const loginRoute = require("./routes/login");
const githubRoute = require("./routes/github");
const path = require("path");
const cors = require("cors");

const PORT = 4040;
const app = express();

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());
app.use(logger);

//ROUTES
app.use("/", postsRoute);
app.use("/", usersRoute);
app.use("/", commentsRoute);
app.use("/", loginRoute);
app.use("/", githubRoute);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error during db connection"));
db.once("open", () => {
  console.log("Database succesfully connected");
});
app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
