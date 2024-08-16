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
    const userCollection = client.db("MovieFlex").collection("allUsers");

    //JWT
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(
        user,
        process.env.ACCESS_TOKEN_SECRET,

        { expiresIn: "1h" }
      );
      res.send({ token });
    });

    // verify jwt token
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "forbidden access" });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    };

    app.get("/users", verifyToken, async (req, res) => {
      const searchQuery = req.query.search || "";
      const filter = {
        $or: [
          { userName: { $regex: searchQuery, $options: "i" } },
          { userEmail: { $regex: searchQuery, $options: "i" } },
        ],
      };

      try {
        const users = await userCollection.find(filter).toArray();
        res.send(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error." });
      }
    });

    app.get("/state", async (req, res) => {
      try {
        const result = await statsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send("Failed to fetch reviews");
      }
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { userEmail: user.userEmail };
      try {
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res
            .status(409)
            .send({ message: "User already exists", insertedId: null });
        } else {
          const result = await userCollection.insertOne(user);
          await statsCollection.updateOne(
            { _id: new ObjectId("665ce46ccce6c97b84e3c1a4") },
            { $inc: { totalUsers: 1 } },
            { upsert: true }
          );

          res.status(201).send(result);
        }
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).send("Failed to insert user");
      }
    });
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
      const {
        page = 1,
        limit = 9,
        query,
        category,
        rating,
        minPrice,
        maxPrice,
        sortBy,
      } = req.query;

      let filter = {};
      let sort = {};

      // Search by movie name
      if (query) {
        filter.name = { $regex: new RegExp(query, "i") };
      }

      // Filter by category
      if (category) {
        filter.category = category;
      }

      // Filter by rating
      if (rating) {
        filter.rating = { $gte: parseFloat(rating) };
      }

      // Filter by price range
      if (minPrice && maxPrice) {
        filter.price = {
          $gte: parseFloat(minPrice),
          $lte: parseFloat(maxPrice),
        };
      }

      // Sorting logic
      if (sortBy === "createdAtDesc") {
        sort.createdAt = -1;
      } else if (sortBy === "createdAtAsc") {
        sort.createdAt = 1;
      } else if (sortBy === "priceAsc") {
        sort.price = 1;
      } else if (sortBy === "priceDesc") {
        sort.price = -1;
      }

      try {
        const movies = await movieCollection
          .find(filter)
          .sort(sort)
          .skip((page - 1) * parseInt(limit))
          .limit(parseInt(limit))
          .toArray();
        const totalMovies = await movieCollection.countDocuments(filter);
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
