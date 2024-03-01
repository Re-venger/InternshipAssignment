import mongoose from "mongoose";

const CallRecordSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAuths"
    },
    taskID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tasks"
    },
    callMade: {
        type: Boolean
    }

})


const CallRecord = mongoose.model("CallRecord", CallRecordSchema)
export default CallRecord