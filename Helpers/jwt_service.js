const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('../Helpers/connections_redis')

const signAccessToken = async (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId
        }
        const secret = process.env.ACCESS_TOKEN_SECRET
        const options = {
            expiresIn: '1h'
        }

        JWT.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token)
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    const secret = process.env.ACCESS_TOKEN_SECRET
    if (!req.headers['authorization']) {
        return next(createError.Unauthorized)
    }
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]

    JWT.verify(token, secret, (err, payload) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') {
                return next(createError.Unauthorized())
            }
            return next(createError.Unauthorized(err.message))
        }
        req.payload = payload
        next()
    })
}

const signRefreshToken = async (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId
        }
        const secret = process.env.REFRESH_TOKEN_SECRET
        const options = {
            expiresIn: '1y'
        }

        JWT.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            client.set(userId.toString(), token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                if (err) {
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    })
}

const verifyRefreshToken = async (refreshToken) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.REFRESH_TOKEN_SECRET
        JWT.verify(refreshToken, secret, (err, payload) => {
            if (err) {
                return reject(err)
            }
            client.get(payload.userId, (err, reply) => {
                if (err) {
                    return reject(createError.InternalServerError())
                }
                if (refreshToken === reply) {
                    return resolve(payload)
                }
                return reject(createError.Unauthorized())
            })
        })
    })
}

module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken
}