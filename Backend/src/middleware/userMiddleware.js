const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const userMiddleware = async(req,res,next)=>
{
    try{

        const {token} = req.cookies
        console.log("token ");
        console.log(token);
        if(!token)
            throw new Error("Token is not present");

        const payload = jwt.verify(token,process.env.JWT_KEY);
        console.log("payload");
        console.log(payload);
        const {_id} = payload;
        console.log("_id");
        console.log(_id);

        if(!_id)
            throw new Error("Invalid Token");

        const result = await User.findById(_id);
        console.log("result");
        console.log(result);
        if(!result)
          throw new Error("User Doesn't Exist");

        const IsBlocked = await redisClient.exists(`token:${token}`);
        
        if(IsBlocked)
            throw new Error("Invalid Token");

        req.result=result;

        next();
    }
    catch(err)
    {
       res.status(401).send("Error: "+err);
    }
}

module.exports=userMiddleware;