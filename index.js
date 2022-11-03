const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000; //precess er kono port thakle port use korbe r na hy 5000 port use korbe

//middle wares
app.use(cors());
app.use(express.json())

//console.log kore dekhte pari user and pass thik moto asche kina
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qlhnchw.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const serviceCollection = client.db("geniusCar").collection("services");
    const orderCollection = client.db('geniusCar').collection('orders'); //orders database

    //JWT Token
    app.post('/jwt', (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1hr'});
      res.send({token})
    })

    // 1. data load korar jonno API banabo
    app.get('/services', async (req, res) => {
      const query = {} // sobgula k pawar jonno
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services)
    })

    //2. specifically kono ekta id te jawar jonno API banate hobe
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }; // specific id'r neyar jonno
      const service = await serviceCollection.findOne(query);
      res.send(service)
    })

    //3. orders API
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result)
    })

    //4. sob gulo order pawar jonno
    app.get('/orders', async (req, res) => {
      let query = {}
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders)
    })

    // 6. update 
    app.patch('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: status
        }
      }
      const result = await orderCollection.updateOne(query, updatedDoc)
      res.send(result)
    })


    //5. delete API
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    })

  } finally {

  }
}
run().catch(console.dir);


//primary step get korbo
app.get('/', (req, res) => {
  res.send('genius car server is running')
})
// primary step listen korbo
app.listen(port, (req, res) => {
  console.log(`genius car server running on ${port}`);
})