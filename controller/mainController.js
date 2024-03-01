import jwt from "jsonwebtoken";
import Tasks from "../models/Task.js";
import SubTasks from "../models/SubTask.js";
import authControllerFunc from "./authControllers.js";
import moment from "moment-timezone";



const createTask = async (req, res) => {

    const token = req.cookies.userBrowsedSession;
    const decodeToken = jwt.decode(token);
    const r_user_details = authControllerFunc.decryptPayload(decodeToken.payloadGen)

    if (!r_user_details || !r_user_details['uid']) {
        return res.status(404).json({
            status: "Failed",
            message: "Inavlid Request. User Not Found"
        })
    }


    try {
        const { title, description, due_date} = req.body;

        if (title && description && due_date) {

            // converting the due date to miliseconds for easy comparisons and storing
            const dueDate = moment(due_date).valueOf();

            if (dueDate < moment().valueOf()) {
                return res.status(400).json({
                    message: "Due Date cannot be less than current"
                })
            }



            const formatedDate = moment(due_date, "DD-MM-YYYY").format("DD-MM-YYYY HH:mm:ss")

            const newTask = new Tasks({ userID: r_user_details.uid, title, description, due_Date: formatedDate });


            await newTask.save();
            return res.status(200).json({
                status: "Success",
                message: newTask
            })
        } else {
            return res.status(403).json({
                status: "Failed",
                message: "No input was provided"
            })
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            status: "Error",
            message: err
        })
    }
}




/* api path for creating the sub processes */
const createSubTasks = async (req, res) => {
    try {
        const { task_id } = req.body;
        const hasFoundTask = await Tasks.findById({ _id: task_id });
        if (hasFoundTask) {
            const newSubtaks = new SubTasks({ task_id });
            await newSubtaks.save();
            return res.status(201).json({
                status: "Success",
                message: "Sub tasks has been created"
            })
        }
        else {
            !res.status(404).json({
                status: "Failed",
                message: "Task Id Not Found"
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            message: `Server Error: ${error}`
        })
    }
}


const getUserTasks = async (req, res) => {

    const { priority, due_date, page = 1, pageLen = 10 } = req.body

    try {
        const token = req.cookies.userBrowsedSession;
        const decodeToken = jwt.decode(token);
        const r_user_details = authControllerFunc.decryptPayload(decodeToken.payloadGen);

        if (!r_user_details || !r_user_details.uid) {
            return res.status(400).json({
                status: "Failed!",
                message: "Auth Token Error"
            })
        }

        const queryFormat = {
            userID: r_user_details.uid
        }
        const params_sort_page = {
            sort: { priority: 1 },
            skip: (page - 1) * pageLen,
            limit: pageLen,
        };


        if (priority) {
            queryFormat.priority = priority
        }
        if (due_date) {
            const formatedDate = moment(due_date, "DD-MM-YYYY").format("DD-MM-YYYY HH:mm:ss")
            queryFormat.due_date = formatedDate;
        }

        const allTasks = await Tasks.find(queryFormat, null, params_sort_page);
        return res.status(302).json({
            status: "Success",
            allTasks: allTasks
        })

    } catch (error) {
        console.log(error);
    }

}

const getUserSubTasks = async (req, res) => {

    try {
        const { task_id } = req.body;
        const token = req.cookies.userBrowsedSession;
        const decodeToken = jwt.decode(token);
        const r_user_details = authControllerFunc.decryptPayload(decodeToken.payloadGen);

        if (!r_user_details || !r_user_details.uid) {
            return res.status(400).json({
                status: "Failed!",
                message: "Auth Token Error"
            })
        }

        const queryFormat = {
            userID: r_user_details.uid
        }
        if (task_id) {
            queryFormat.task_id = task_id;
        }

        const allTasks = await Tasks.find(queryFormat)

        const allSubTasks = await Promise.all(allTasks.map(async(subT) => {
            const subtask = await SubTasks.find({ task_id: subT._id.toHexString() })
            return subtask.length != 0 ? subtask : null
        }))

        return res.status(302).json({
            status: "Success",
            allSubTasks: allSubTasks
        })

    } catch (error) {
        console.log(error);
    }

}




const updateTask = async (req, res) => {
    try {
        const { task_id } = req.params;
        const { due_date, status } = req.body;

        
        const query = {
            status,
            updated_at: moment().format("DD-MM-YYYY HH:mm:ss")
        }

        if (due_date && due_date.length != 0){
            const formatedDate = moment(due_date, "DD-MM-YYYY").format("DD-MM-YYYY HH:mm:ss")
            query.due_Date = formatedDate;
        }


        const updatedTask = await Tasks.findByIdAndUpdate(
            { _id: task_id },
            { $set: query },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const updateSubtask = async (req, res) => {
    try {
        const { subtask_id } = req.params;
        const { status } = req.body;

        const updatedSubtask = await SubTasks.findByIdAndUpdate(
            { _id: subtask_id },
            { $set: { status } },
            { new: true }
        );

        if (!updatedSubtask) {
            return res.status(404).json({ message: 'Subtask not found' });
        }
        res.status(200).json({ message: 'Subtask updated successfully', subtask: updatedSubtask });
    } catch (error) {
        console.error('Error updating subtask:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const deleteTask = async (req, res) => {
    try {
        const { task_id } = req.params;
        const getTask = await Tasks.findByIdAndUpdate({
            _id: task_id,
        }, {
            $set: { deleted_at: moment().format("DD-MM-YYYY HH:mm:ss") }
        })
        if (getTask) {
            res.status(200).json({
                status: "Success",
                message: "Task Deleted !"
            })

        } else {
            res.status(404).json({
                status: "Failed",
                message: "No such task found"
            })

        }
    } catch (error) {
        console.log("Task delete error : ", error);
    }
}



const deleteSubTask = async (req, res) => {
    try {
        const { subtask_id } = req.params;
        const getTask = await SubTasks.findByIdAndUpdate({
            _id: subtask_id,
        }, {
            $set: { deleted_at: moment().format("DD-MM-YYYY HH:mm:ss") }
        })
        if (getTask) {
            res.status(200).json({
                status: "Success",
                message: "Task Deleted !"
            })

        } else {
            res.status(404).json({
                status: "Failed",
                message: "No such task found"
            })

        }
    } catch (error) {
        console.log("Task delete error : ", error);
    }
}



const formatDate = (due_date) => {
    const dateFrags = due_date.split('-');
    const formattedDate = `${dateFrags[2]}-${dateFrags[1]}-${dateFrags[0]}`;
    return formattedDate
}



const taskObject = {
    createTask,
    createSubTasks,
    getUserTasks,
    getUserSubTasks,
    updateTask,
    updateSubtask,
    deleteTask,
    deleteSubTask
}


export default taskObject;