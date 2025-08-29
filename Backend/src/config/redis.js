const { createClient } =require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PAS,
    socket: {
        host: 'redis-17838.c257.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 17838
    }
});

module.exports=redisClient;