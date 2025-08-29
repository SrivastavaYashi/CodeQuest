const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const adminMiddleware = async(req,res,next)=>
{
    try{

        const {token} = req.cookies
        if(!token)
            throw new Error("Token is not present");

        const payload = jwt.verify(token,process.env.JWT_KEY);

        const {_id} = payload;

        if(!_id)
            throw new Error("Invalid Token");

        const result = await User.findById(_id);

        if(payload.role!='admin')
            throw new Error("Invalid Token");
        
        if(!result)
          throw new Error("User Doesn't Exist");

        const IsBlocked = await redisClient.exists(`token:${token}`);
        
        if(IsBlocked)
            throw new Error("Invalid Token");

        console.log("admin result",result);

        req.result=result;

        next();
    }
    catch(err)
    {
       res.status(401).send("Error: "+err);
    }
}

module.exports=adminMiddleware;