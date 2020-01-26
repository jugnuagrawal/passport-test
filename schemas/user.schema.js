module.exports = {
    name: {
        type: 'String',
    },
    username: {
        type: 'String',
        required: true,
        unique: true,
    },
    password: {
        type: 'String',
    },
    accessToken: {
        type: 'String',
    },
    id: {
        type: 'String',
    },
    loginType: {
        type: 'String',
    },
    verified: {
        type: 'String',
    }
}