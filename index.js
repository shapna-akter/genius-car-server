const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

    //token er jnno function
    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).send({ message: 'unauthorize access' })
      }

      const token = authHeader.split(' ')[1];

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
          return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next()
      })
    }

    //1. Get JWT Token
    app.post('/jwt', (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      res.send({ token })
    })

    // 1. data load korar jonno API banabo
    app.get('/services', async (req, res) => {
      const search = req.query.search;
      console.log(search);
      let query = {};
      if (search.length) {
        query = {
          $text: {
            $search: search
          }
        }
      }
        const order = req.query.order === 'asc' ? 1 : -1; // sort er joono ei line
        const cursor = serviceCollection.find(query).sort({ price: order }); //price sort korechi
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
    app.post('/orders', verifyJWT, async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result)
    })

    //4. Orders API. sob gulo order pawar jonno
    app.get('/orders', verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      console.log(decoded);

      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: 'unauthorize access' })
      }
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
    app.patch('/orders/:id', verifyJWT, async (req, res) => {
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
    app.delete('/orders/:id', verifyJWT, async (req, res) => {
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