const express = require("express");
const userModel = require("../models/authormodel");
const user = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "immaginiprofilo",
    format: async (req, file) => "png",
    public_id: (req, file) => file.name,
  },
});

const internalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // posizione in cui salvare i file
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    const fileExtension = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
  },
});

const upload = multer({ storage: internalStorage });
const cloudUpload = multer({ storage: cloudStorage });

user.post(
  "/users/cloudUpload",
  cloudUpload.single("avatar"),
  async (req, res) => {
    try {
      console.log("ciaoo");
      res.status(200).json({ avatar: req.file.path });
    } catch (e) {
      res.status(500).send({
        statusCode: 500,
        message: "Errore interno del server",
      });
    }
  }
);
user.post("/users/upload", upload.single("avatar"), async (req, res) => {
  const url = "http://localhost:4040";

  console.log(req.file);

  try {
    const imgUrl = req.file.filename;
    res.status(200).json({ avatar: `${url}/public/${imgUrl}` });
  } catch (e) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

user.get("/users", async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).send({
      statusCode: 200,
      users,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

user.post("/users/add", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new userModel({
    avatar: req.body.avatar,
    userName: req.body.userName,
    email: req.body.email,
    password: hashedPassword,
    //qui deve avvenire il crypt
  });
  try {
    const user = await newUser.save();
    res.status(201).send({
      statusCode: 201,
      message: "Utente salvato con successo",
      payload: user,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

user.patch("/users/up/:userId", async (req, res) => {
  const { userId } = req.params;
  const userExists = await userModel.findById(userId);

  if (!userExists) {
    return res.status(404).send({
      statusCode: 404,
      message: "Questo utente non esiste",
    });
  }

  try {
    const { userName } = req.body;
    const userToUpdate = { userName };
    const optionUser = { new: true };
    const result = await userModel.findByIdAndUpdate(
      userId,
      userToUpdate,
      optionUser
    );

    res.status(200).send({
      statusCode: 200,
      message: "Utente modificato con successo",
      result,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

user.delete("/users/del/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "Utente già eliminato",
      });
    }
    res.status(200).send({
      statusCode: 200,
      message: "Eliminato con successo!",
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

module.exports = user;
