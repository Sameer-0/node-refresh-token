const {
    scrypt,
    randomBytes
} = require('crypto');
require('dotenv').config()


module.exports = {

    hashPassword: (password) => {
        return new Promise(resolve => {
            scrypt('pass@123', process.env.SALT_ARR, 64, (err, derivedKey) => {
                if (err) throw err;
                resolve(derivedKey.toString('hex'));
            });
        })
    }

}





// ede5957a89ea630c96780ea0a00b4d86497dbe9c28e1d0ac7e10a2abd1ad2f1743f3bb80282b1944d577bb45fab0d038b6969ad3b6c2d13b3462ceaea349e39b
// ede5957a89ea630c96780ea0a00b4d86497dbe9c28e1d0ac7e10a2abd1ad2f1743f3bb80282b1944d577bb45fab0d038b6969ad3b6c2d13b3462ceaea349e39b