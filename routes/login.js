const express = require("express");
const login = express.Router();
const bcrypt = require("bcrypt");
const UserModel = require("../models/authormodel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

login.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "Nome utente errato o inesistente",
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        statusCode: 400,
        message: "Email o password errati",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Login effettuato con successo",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

module.exports = login;
