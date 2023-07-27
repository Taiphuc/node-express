const client = require('../Helpers/connections_redis')

const getIPpUser = req => {
    return ''
}

const incr = key => {
    return new Promise((resolve, reject) => {
        client.incr(key, (err, result) => {
            if (err) return reject(err)
            resolve(result)
        })
    })
}

const expire = (key, ttl) => {
    return new Promise((resolve, reject) => {
        client.expire(key, ttl, (err, result) => {
            if (err) return reject(err)
            resolve(result)
        })
    })
}

const ttl = key => {
    return new Promise((resolve, reject) => {
        client.ttl(key, (err, ttl) => {
            if (err) return reject(err)
            resolve(ttl)
        })
    })
}

module.exports = {
    incr,
    expire,
    ttl
}