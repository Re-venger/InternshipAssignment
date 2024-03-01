import express from "express"
import connectDB from "./utils/dbConnection.js";
import authRouter from "./routes/authRoutes.js";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import tasksRouter from "./routes/taskRoutes.js";
import callScheduler from "./controller/callScheduler.js"
import taskSchdule from "./controller/scheduleController.js";
dotenv.config()




const app = express();

// setting app to process json
app.use(express.json());
app.use(cookieParser());



// setting up the api routes
app.use('/auth', authRouter);
app.use('/user', tasksRouter);



// cron schedules
callScheduler.start();
taskSchdule.start();

process.on('exit',()=>{
    callScheduler.stop();
    taskSchdule.stop();
})



// check if database connection is active then start the server.
if (connectDB()) {

    app.listen(process.env.PORT, () => {
        console.log(`Server Running on http://localhost:${process.env.PORT}`);
    })



}


