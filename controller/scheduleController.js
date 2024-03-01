import cron from "node-cron"
import Tasks from "../models/Task.js"
import moment from "moment";



const priorityLevels = {
    "EXTREME": 0,
    "HIGH": 1,
    "MEDIUM": 2,
    "LOW": 3,
}


const taskSchdule = cron.schedule('0 0 0 * * *', async () => {
    try {
        const all_rem_tasks = await Tasks.find({ status: { $ne: "DONE" } });
        all_rem_tasks.map(async(task)=>{

            const currDate = moment();
            const dueDate = moment(task.due_Date, "DD-MM-YYYY HH:mm:ss");
            const duration = dueDate.diff(currDate, 'days');

            if(duration < 1){
                task.priority = priorityLevels['EXTREME'];
            }else if(duration == 1){
                task.priority = priorityLevels['HIGH'];
            }else if(duration > 1 && duration <= 2){
                task.priority = priorityLevels["MEDIUM"];
            }else{
                task.priority = priorityLevels["LOW"]
            }
            await task.save();
        })

    }catch(error){
        console.log(error);
    }
})



export default taskSchdule;