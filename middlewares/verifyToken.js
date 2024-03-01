import jwt from "jsonwebtoken"
import UserKeys from "../models/UserKeys.js";
import authControllerFunc from "../controller/authControllers.js";

const verifyToken = async (req, res, next) => {
    const token = req.cookies.userBrowsedSession;
    const decodeToken = jwt.decode(token);
    const r_user_details = authControllerFunc.decryptPayload(decodeToken.payloadGen)
    console.log(typeof(r_user_details));
    try {

        if (!r_user_details || !r_user_details.uid) {
            return res.status(403).json({
                message: 'Invalid token'
            })
        }
        const findUserPubKey = await UserKeys.findOne({ userID: r_user_details.uid, publicKey: { $exists: true } });
        if (!findUserPubKey) {
            return res.status(403).json({ message: 'Public key not found for the user' });
        }

        jwt.verify(token, findUserPubKey.publicKey, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Token verification failed' });
            }
            req.user = user;
            next();
        })
    } catch (err) {
        console.log('token verification failed due to :', err.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default verifyToken;