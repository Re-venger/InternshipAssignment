import cron from "node-cron";
import User from "../models/User.js"
import Tasks from "../models/Task.js";
import moment from "moment";
import twilio from "twilio";
import dotenv from "dotenv"
dotenv.config()


const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const getUserWithPriority = async (prior) => {
    const users = await User.find({ priority: prior });
    return users;
}

const getAllDueTasks = async () => {
    const currDate = moment().format("DD-MM-YY HH:mm:ss")
    const tasks = await Tasks.find({ due_Date: { $lt: currDate }, status: { $ne: "DONE" } });
    const dueTasksID = tasks.map((tid) => {
        return {
            taskid: tid._id.toHexString(),
            userid: tid.userID.toHexString()
        }
    })

    const uniqueOverdueUserIds = Array.from(new Set(dueTasksID))
    return uniqueOverdueUserIds
}

const callUser = async (userPhoneNumber) => {
    const completePhoneNumber = "+91"+userPhoneNumber
    try {
      const call = await client.calls.create({
        url: 'http://demo.twilio.com/docs/voice.xml', 
        to: completePhoneNumber,
        from: process.env.TWILIO_PHONE,
      });
  
      console.log(`Call SID: ${call.sid}`);
    } catch (error) {
      console.error('Error making Twilio call:', error.message);
    }
  };

const callSchedule = cron.schedule("* * 12 * * *", async () => {
    try {
        for (let priority = 0; priority <= 2; priority++) {
            const users = await getUserWithPriority(priority);
            const tasks = await getAllDueTasks();
            for (const user of users) {
                const userTasks = tasks.filter((task) => task.userid === user.userID.toHexString());
                for (const task of userTasks) {
                    console.log(`Calling user ${user.userID.toHexString()} for task ${task.taskid}`);
                    callUser(user.phone_number)
                }
            }
        }
    } catch (error) {
        console.error("Error calling users:", error);
    }
})

export default callSchedule;