import mongoose from 'mongoose';


// not providing id as mongodb generates a unique id for each document
const userSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAuths"
    },
    phone_number: {
        type: Number,
        require: [true, "Phone Number is Required"]
    },
    priority: {
        type: Number,
        enum: [0,1,2],
        require: true
    }
})

const User = mongoose.model("Users", userSchema);
export default User;