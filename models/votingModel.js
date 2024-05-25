const mongoose = require('mongoose');

const VotingSchema = mongoose.Schema(
    {
        address:{
            type: String,
            require: true,
        },
        name:{
            type: String,
            require:[true, "Please enter voting name!"]
        },
        votingActive:{
            type: Boolean
        },
        creator:{
            type: String,
            require:[true, "Creator is required!"]
        },
        startDateTime:{
            type: Date
        },
        endDateTime: {
            type:Date
        },
        img: {
            type:String
        }
        
    }
)
const Voting = mongoose.model("VotingInstancescollection", VotingSchema);
module.exports = Voting;