import UserKeys from "../models/UserKeys.js";
import UserAuths from "../models/UserProfiles.js";
import User from "../models/User.js"
import dotenv from "dotenv"
import jwt from "jsonwebtoken";
import crypto from "crypto";
dotenv.config()


// controller function for registering the user
const registerUser = async (req, res) => {
    try {
        const { username, email, password, phone, priority  } = req.body;

        const findExisting = await UserAuths.findOne({ email });
        if (!findExisting) {
            const newUser = new UserAuths({ username, email, password });
            await newUser.save();
            await generateUserKeys(newUser._id.toHexString());
            const user = new User({userID: newUser._id.toHexString(), phone_number: phone, priority: priority})
            await user.save();
            res.status(201).json({ message: user });
        } else if (findExisting) {
            res.status(400).json({ status: 'error', message: 'User already Exists !!' });
        } else {
            res.status(400).json({ status: 'error', message: 'Invalid or missing parameter' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });

    }
}




// controller function for loggin-in the user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const foundUser = await UserAuths.findOne({ email });
        if (!foundUser) {
            return res.status(404).json({ error: 'User Not Found' });
        }
        const comparePassRes = await foundUser.comparePassword(password);
        if (!comparePassRes) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        const Token = await createToken(foundUser);
        res.cookie('userBrowsedSession', Token, { httpOnly: true });
        return res.status(200).json({
            status: "Login Success",
            User: foundUser
        })
    } catch (error) {
        console.log(error);
    }
}

const logoutUser = (req, res) => {
    res.clearCookie('userBrowsedSession');
    return res.status(200).json({ status: 'Logout successful' });
};






















// in order to increase the security we user RS256 system for storing and verifying the user requests 
const generateUserKeys = async (userID) => {
    try {
        const findExisting = await UserKeys.findOne({ userID })
        if (!findExisting) {
            const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            })

            const userkeys = new UserKeys({ userID, privateKey, publicKey });
            await userkeys.save();
            console.log("Key created");
        } else {
            console.log("Users Keys already exsists");
        }
    } catch (error) {
        console.log("Key generation error: ", error);
    }
}



const createToken = async (user) => {
    try {
        const userID = user._id.toHexString();
        const findUserKey = await UserKeys.findOne({ userID });
        const { privateKey } = findUserKey;
        const payloadGen = await encryptPayload({
            uid: user._id.toHexString(),
            email: user.email
        })
        console.log("Encrypted: ", payloadGen);
        const token = jwt.sign({payloadGen}, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h'
        })
        return token;
    } catch (error) {
        throw error;
    }
}




const encryptPayload = async (payload) => {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.PAYLOAD_ENCRYPTION_KEY);
    let encryptedPayload = cipher.update(JSON.stringify(payload), 'utf-8', 'base64');
    encryptedPayload += cipher.final('base64');
    return encryptedPayload;
}

const decryptPayload = (encryptedPayload)=>{
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.PAYLOAD_ENCRYPTION_KEY);
    let decryptedPayload = decipher.update(encryptedPayload, 'base64', 'utf-8');
    decryptedPayload += decipher.final('utf-8');
    return JSON.parse(decryptedPayload);
  }



const authControllerFunc = {
    registerUser,
    loginUser,
    logoutUser,
    decryptPayload
}


export default authControllerFunc;
