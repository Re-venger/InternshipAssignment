import mongoose from 'mongoose';


// not providing id as mongodb generates a unique id for each document
const userKeysSchema = new mongoose.Schema({
    userID: {
        type: String,
        require: true
    },
    privateKey: {
        type: String,
        require: true
    },
    publicKey: {
        type: String,
        require: true
    }
})

const UserKeys = mongoose.model('UserKeys', userKeysSchema);
export default UserKeys;