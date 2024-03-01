import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAuths"
    },
    title:{ 
        type: String,
        require: [true, "Title is not set"]
    },
    description:{ 
        type: String,
        require: [true, "description is not set"]
    },
    priority:{ 
        type: Number,
        enum: [0, 1, 2, 3],
        default: 3
    },
    status:{ 
        type: String,
        enum: ["TODO", "IN_PROGRESS", "DONE"],
        default: "TODO"
    },
    due_Date:{ 
        type: String,
        require: true
    },
    created_at:{
        type: Date,
        default: Date.now
    },
    updated_at: { 
        type: String
    },
    deleted_at: { 
        type: String
    },

})


const Tasks = mongoose.model("Tasks", TaskSchema)
export default Tasks