const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

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

    const db = client.db("ideavault");
    const ideaCollection = db.collection("ideas");
    const commentsCollection = db.collection("comments");

    app.get("/trending", async (req, res) => {
      const result = await ideaCollection.find().limit(6).toArray();
      res.json(result);
    });

    app.post("/comment", async (req, res) => {
      const commentData = req.body;
      const result = await commentsCollection.insertOne(commentData);
      res.json(result);
    });

    app.get("/comment", async (req, res) => {
      const result = await commentsCollection.find().toArray();
      res.json(result);
    });
    app.get("/comment/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await commentsCollection
        .find({ userId: userId })
        .toArray();
      res.json(result);
    });
    app.delete("/comment/:id", async (req, res) => {
      const { id } = req.params;
      const result = await commentsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });
    app.patch("/comment/:id", async (req, res) => {
      const { id } = req.params;
      const commentUpdate = req.body;

      const result = await commentsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: commentUpdate },
      );
      res.json(result);
    });

    app.get("/idea", async (req, res) => {
  const { search = "", category = "" } = req.query;

  const query = {};

  if (search) {
    query.ideaTitle = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    query.category = category;
  }

  const ideas = await ideaCollection.find(query).toArray();

  res.send(ideas);
});
    
    app.get("/my-ideas/:userId", async (req, res) => {
      const { userId } = req.params;

      const result = await ideaCollection.find({ userId }).toArray();

      res.send(result);
    });

    app.post("/idea", async (req, res) => {
      const ideaData = req.body;
      const result = await ideaCollection.insertOne(ideaData);
      res.json(result);
    });

    app.get("/idea/:id", async (req, res) => {
      const { id } = req.params;
      const result = await ideaCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    app.patch("/idea/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      const result = await ideaCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.json(result);
    });

    app.delete("/idea/:id", async (req, res) => {
      const { id } = req.params;
      const result = await ideaCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running fine!");
});
app.listen(PORT, () => {
  console.log(`Server is runing on ${PORT}`);
});
