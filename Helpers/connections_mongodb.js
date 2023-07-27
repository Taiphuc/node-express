const mongoose = require('mongoose')

const conn = mongoose.createConnection('mongodb://localhost:27017/test')

conn.on('connected', () => {
    console.log(`Mongodb::: connected:::${conn.name}`);
})

conn.on('disconnected', () => {
    console.log(`Mongodb::: disconnected:::${conn.name}`);
})

conn.on('error', (error) => {
    console.log(`Mongodb::: error:::${JSON.stringify(error)}`);
})

process.on('SIGINT', async() => {
    await conn.close()
    process.exit(0)
})

module.exports = conn