import express from "express"
import authControllerFunc from "../controller/authControllers.js";
import verifyToken from "../middlewares/verifyToken.js";

const authRouter = express.Router();

// creating the authentication routes for the user
authRouter.post("/registerUser", authControllerFunc.registerUser);
authRouter.post("/loginUser" , authControllerFunc.loginUser);
authRouter.post("/logoutUser" , authControllerFunc.logoutUser);

export default authRouter