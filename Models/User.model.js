const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { testConnection, userConnection } = require('../Helpers/connections_multi_mongodb')
const bcrypt = require('bcrypt')

const TestSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const UserSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

TestSchema.pre('save', async function (next) {
    try {
        console.log(`Called before save::::`, this.password);
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(this.password, salt)
        this.password = hashPassword
        next()
    } catch (err) {
        next(err)
    }
})

TestSchema.methods.isCheckPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (err) {
        next(err)
    }
}

module.exports =
    testConnection.model('user', TestSchema)
    // user: userConnection.model('user', UserSchema)
