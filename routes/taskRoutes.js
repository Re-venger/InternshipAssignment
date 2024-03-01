import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import taskObject from "../controller/mainController.js";


// setting up the router for creating the tasks 

const tasksRouter = express.Router()


// each time the request is verified that it is comming for the current logged in user or not
tasksRouter.post('/createTasks', verifyToken, taskObject.createTask);
tasksRouter.post('/createSubTasks', verifyToken, taskObject.createSubTasks);
tasksRouter.post('/getUserTasks', verifyToken, taskObject.getUserTasks);
tasksRouter.post('/getUserSubTasks', verifyToken, taskObject.getUserSubTasks);


// updating the tasks
tasksRouter.put('/updateUserTasks/:task_id', verifyToken, taskObject.updateTask);
tasksRouter.put('/updateUserSubTasks/:subtask_id', verifyToken, taskObject.updateSubtask);


// deleting the tasks
tasksRouter.delete('/deleteUserTasks/:task_id', verifyToken, taskObject.deleteTask);
tasksRouter.delete('/deleteUserSubTasks/:subtask_id', verifyToken, taskObject.deleteSubTask);

export default tasksRouter