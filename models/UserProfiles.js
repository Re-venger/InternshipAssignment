import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userAuthSchema = new mongoose.Schema({
    username:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    created_at: {
        type: Date,
        require: true,
        default: Date.now
    }
})


// this implementation tells that before saving the users password just hash it, if it has not been previously hashed
userAuthSchema.pre('save', async function(next){
    const currentUser = this;

    if(!currentUser.isModified('password')){
        next();
    }
    try{
        const salt = await bcrypt.genSalt(10);
        currentUser.password = await bcrypt.hash(this.password, salt);
        next();
    }catch(error){
        return next(error);
    }
    
})

// this implementaion is for comparing the hashed password and the provided password
userAuthSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password, this.password);
}


const UserAuths = mongoose.model("UserAuths", userAuthSchema);
export default UserAuths;
