const express = require("express");
const PostModel = require("../models/postmodel");
const validatePost = require("../middlewares/validatePost");
const posts = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pippo13",
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

posts.post(
  "/posts/cloudUpload",
  cloudUpload.single("cover"),
  async (req, res) => {
    try {
      console.log("ciaoo");
      res.status(200).json({ cover: req.file.path });
    } catch (e) {
      res.status(500).send({
        statusCode: 500,
        message: "Errore interno del server",
      });
    }
  }
);

posts.post("/posts/upload", upload.single("cover"), async (req, res) => {
  const url = "http://localhost:4040";

  console.log(req.file);

  try {
    const imgUrl = req.file.filename;
    res.status(200).json({ cover: `${url}/public/${imgUrl}` });
  } catch (e) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

posts.get("/posts", async (req, res) => {
  const { page = 1, pageSize = 6, sortBy = "createdAt:desc" } = req.query;
  const [sortField, sortOrder] = sortBy.split(":");

  const sortOptions = {};
  sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;

  try {
    const posts = await PostModel.find()
      .populate("author")
      .sort(sortOptions)
      .limit(Number(pageSize))
      .skip((Number(page) - 1) * Number(pageSize));

    const totalPost = await PostModel.count();

    res.status(200).send({
      statusCode: 200,
      currentPage: Number(page),
      totalPages: Math.ceil(totalPost / Number(pageSize)),
      totalPost,
      posts,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

posts.post("/posts/create", validatePost, async (req, res) => {
  const newPost = new PostModel({
    title: req.body.title,
    cover: req.body.cover,
    author: req.body.author,
    content: req.body.content,
  });
  try {
    const post = await newPost.save();

    res.status(201).send({
      statusCode: 201,
      message: "Post save succesfully",
      payload: post,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
      error,
    });
  }
});

posts.patch("/posts/update/:postId", async (req, res) => {
  const { postId } = req.params;
  const postExist = await PostModel.findById(postId);

  if (!postExist) {
    return res.status(404).send({
      statusCode: 404,
      message: "This post does not exist!",
    });
  }

  try {
    const dataToUpdate = req.body;

    const options = { new: true };
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { content: dataToUpdate.content },
      options
    );

    if (!updatedPost) {
      return res.status(404).send({
        statusCode: 404,
        message: "Questo post non esiste!",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "Post edited successfully",
      result: updatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});

posts.delete("/posts/delete/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await PostModel.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).send({
        statusCode: 404,
        message: "Post già eliminato",
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

module.exports = posts;
