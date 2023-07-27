const Redis = require('ioredis')

const client = new Redis({
    port: 6379,
    host: '127.0.0.1'
})

client.ping((err, pong) => {
    console.log(pong);
})

client.on("error", function (err) {
    console.error(err)
})

client.on("connect", function (err) {
    console.log('connected');
})

client.on("ready", function (err) {
    console.log('Redis is ready');
})

module.exports = client