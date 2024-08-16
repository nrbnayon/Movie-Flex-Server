const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
require("dotenv").config();

const port = process.env.PORT || 5000;
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

//middleware
app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB;

//MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const movieCollection = client.db("MovieFlex").collection("Movies");

    // Route to get all movies
    app.get("/top-movies", async (req, res) => {
      try {
        const movies = await movieCollection
          .find({})
          .sort({ rating: -1 })
          .limit(10)
          .toArray();

        res.status(200).json(movies);
      } catch (error) {
        console.error("Error retrieving top movies:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    app.get("/all-movies", async (req, res) => {
      const { page = 1, limit = 9 } = req.query;
      try {
        const movies = await movieCollection
          .find({})
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .toArray();
        const totalMovies = await movieCollection.countDocuments({});
        res.status(200).json({
          movies,
          totalPages: Math.ceil(totalMovies / limit),
          currentPage: parseInt(page),
        });
      } catch (error) {
        console.error("Error retrieving movies:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Server start
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(port, () => {
  console.log(`Server Running on port ${port}`);
});
