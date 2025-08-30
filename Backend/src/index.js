const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieparser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const aiRouter = require("./routes/aiChatting")
const cors = require('cors');
const videoRouter = require('./routes/videoCreator');



app.use(cors({
  // origin:'http://localhost:5173',
  origin: 'https://codequest-frontend-fi6f.onrender.com', 
  credentials:true
}))

app.use(express.json());
app.use(cookieparser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use('/video',videoRouter)


const InitializeConnection =async()=>
{
   try{
    await Promise.all([main(),redisClient.connect()]);
    console.log("DB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log("server listening at port number: " + PORT);
     });
   }
   catch(err)
   {
     console.log("Error: "+err);
   }

}

InitializeConnection();




