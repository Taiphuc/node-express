const mongoose = require('mongoose')
require('dotenv').config()

function newConnection(uri) {
    const conn = mongoose.createConnection(uri)

    conn.on('connected', () => {
        console.log(`Mongodb::: connected:::${conn.name}`);
    })

    conn.on('disconnected', () => {
        console.log(`Mongodb::: disconnected:::${conn.name}`);
    })

    conn.on('error', (error) => {
        console.log(`Mongodb::: error:::${JSON.stringify(error)}`);
    })

    process.on('SIGINT', async () => {
        await conn.close()
        process.exit(0)
    })
    return conn
}

const testConnection = newConnection(process.env.URI_MONGODB_TEST)
const userConnection = newConnection(process.env.URI_MONGODB_USER)

module.exports = {
    testConnection,
    userConnection
}