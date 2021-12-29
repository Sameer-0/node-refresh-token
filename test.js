//TESTING PASSWORD
// const hash = require('./app/utils/hash')

// ;(async function () {

//     let hashedPwd = await hash.hashPassword('pass@123')

//     console.log('hashedPwd: ', hashedPwd)

// })()

const User = require('./app/models/User');

let data = User.fetchAll().then(data => {
    console.log(data)
})