const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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


app.get('/', (req, res) =>{
    res.send('genius car server is running')
})

app.listen(port, (req, res) =>{
    console.log(`genius car server running on ${port}`);
})