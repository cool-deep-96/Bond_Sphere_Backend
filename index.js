require('dotenv').config();
const connect = require ('./setups/mongoDB');
connect();

const cloudinaryConnect = require('./setups/cloudinary');
cloudinaryConnect();



const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors())

// const routes = express.Router();

// const authMiddleware = require('./middlewares/authMiddleware');
// app.use(authMiddleware.statusCheck);

const userRoutes= require('./routes/userRoutes')
app.use('/api/userRoutes', userRoutes);

const postRoutes= require('./routes/postRoutes')
app.use('/api/postRoutes', postRoutes);



// const postRoutes = require('./routes/postRoutes');
// app.use('/api/posts', postRoutes);

app.get('/',(req, res) => {
    res.send("<h1> server is running successfully </h1>")
});

app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running');
});
