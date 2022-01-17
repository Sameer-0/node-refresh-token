//TESTING PASSWORD
const hash = require('./app/utils/hash')

hash.hashPassword('pass@123').then(result => {
    console.log(result)
})

  


// const User = require('./app/models/User');

// let data = User.fetchAll().then(data => {
//     console.log(data)
// })