const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.niazoeb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toysCollection = client.db("toyDb").collection("toys");

    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.get("/toysByCategory/:category", async (req, res) => {
      console.log(req.params.id);
      const jobs = await toysCollection
        .find({
          status: req.params.category,
        })
        .toArray();
      res.send(jobs);
    });

    app.post("/addToy", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await toysCollection.insertOne(body);
      if (result?.insertedId) {
        return res.send(result);
      } else {
        return res.send({
          message: "can not added toy please try again",
          status: false,
        });
      }
    });


    // Send a ping to confirm a successful connection
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

app.get("/", (req, res) => {
  res.send("Toy server is running...");
});
app.listen(port, () => {
  console.log(`Toy server is running on port ${port}`);
});
