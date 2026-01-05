const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const session = require('express-session');
const postRouter = require('./routes/postRoute');
const userRouter = require('./routes/userRoute');
const { RedisStore } = require('connect-redis');

const { MONGO_IP, MONGO_PORT, MONGO_USER, MONGO_PASSWORD, SESSION_SECRET, REDIS_URL, REDIS_PORT } = require('./config/config');


let redisClient = createClient({
    legacyMode: true,
    socket: {
        host: REDIS_URL, // Use the service name defined in docker-compose.yml
        port: REDIS_PORT
    }
});
// This connection is established before any user requests
redisClient.connect().catch(console.error)

const app = express();


// Using mongo instead of IP address. Docker allows us to use service names as hostnames if both services are on the same network.
const monogURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

// If the docker container for mongo is not ready when the node app starts, we need to retry the connection
const connectWithRetry = () => {
    mongoose.connect(monogURL)
        .then(() => console.log('✅ Successfully connected to DB'))
        .catch((e) => {
            console.log(e);
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        });
}

connectWithRetry();

// Set up session middleware. Store sessions in Redis.
// Attaches req.session object to the request
// If no cookie with session ID is sent by the client, a new empty session is created = {}.
// At this point, req.session is available but not yet saved to Redis (because saveUninitialized: false)
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
        secure: false, // if true only transmit cookie over https - Set to true on production
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        httpOnly: true, // don't let JS code access cookies. Helps against XSS attacks
        maxAge: 60000 // (60s) session max age in milliseconds
    }
}))


// docker inspect <container_name> allows you to see the IP address of a container
// But it's better to use service names in Docker Compose setups for better portability and maintainability.

// docker network ls
// docker network inspect <network_name> allows you to see which containers are connected to a specific network.
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Deserialize JSON bodies into JS objects

app.get('/', (req, res) => {
    res.send('<h2> Hello, World!</h2>');
})

app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})