const createError = require('http-errors')

const User = require('../Models/User.model')
const { userValidate } = require('../Helpers/validation')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../Helpers/jwt_service')
const client = require('../Helpers/connections_redis')
const { incr, expire, ttl } = require('../Models/limiter')

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const { error } = userValidate(req.body)

        if (error) {
            throw createError('err: ', error.details[0].message)
        }

        // if (!email || !password) {
        //     throw createError.BadRequest
        // }

        const isExist = await User.findOne({
            username: email
        })

        if (isExist) {
            throw createError.Conflict(`${email} is ready been registered`)
        }

        // Unsupport middleware pre
        // const isCreate = await User.create({
        //     username: email,
        //     password
        // })

        const user = new User({
            username: email,
            password
        })

        const savedUser = await user.save({ $set: { username: email, password } })

        return res.json({
            status: 'success',
            elements: savedUser
        })
    } catch (err) {
        next(err)
    }
}

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()

        const { userId } = await verifyRefreshToken(refreshToken)
        const accessToken = await signAccessToken(userId)
        const refToken = await signRefreshToken(userId)
        res.json({
            accessToken,
            refreshToken: refToken
        })
    } catch (err) {
        next(err)
    }
}

const login = async (req, res, next) => {
    try {
        // get ip
        const getIpUser = req.headers['x-forward-for'] || req.connection.remoteAddress
        const numRequest = await incr(getIpUser)

        // set expire and get ttl
        let _ttl
        if (numRequest === 1) {
            _ttl = 60
            await expire(getIpUser, _ttl)
        } else {
            _ttl = await ttl(getIpUser)
        }

        if (numRequest > 10) {
            return res.status(503).json({
                status: 'error',
                message: 'Server is busy!',
                numRequest
            })
        }

        const { email, password } = req.body
        const { error } = userValidate(req.body)

        if (error) {
            throw createError('err: ', error.details[0].message)
        }

        const user = await User.findOne({ username: email })
        if (!user) {
            throw createError.NotFound(`User not registered`)
        }

        const isValid = await user.isCheckPassword(password)
        if (!isValid) {
            throw createError.Unauthorized()
        }
        const accessToken = await signAccessToken(user._id)
        const refreshToken = await signRefreshToken(user._id)
        res.send({
            accessToken,
            refreshToken,
            numRequest,
            ttl: _ttl
        })
    } catch (err) {
        next(err)
    }
}

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()

        const { userId } = await verifyRefreshToken(refreshToken)
        client.del(userId.toString(), (err, reply) => {
            if (err) {
                throw createError.InternalServerError()
            }
            res.json({
                message: 'Logout!'
            })
        })
    } catch (err) {
        next(err)
    }
}

const getLists = (req, res, next) => {
    const listUsers = [
        {
            email: 'abc@gmail.com'
        },
        {
            email: 'def@gmail.com'
        },
    ]
    res.json({
        listUsers
    })
}

module.exports = {
    register,
    refreshToken,
    login,
    logout,
    getLists
}