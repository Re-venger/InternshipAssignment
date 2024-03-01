import mongoose from "mongoose";

const SubTaskSchema = new mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tasks",
        require: [true, "Title is not set"]
    },
    status: {
        type: Number, enum: [0, 1], default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: { 
        type: String, 
    },
    deleted_at: {
        type: String,
    }

})

const SubTasks = mongoose.model("SubTasks", SubTaskSchema)
export default SubTasks