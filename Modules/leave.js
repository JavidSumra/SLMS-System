const db = require("../DataBase/db_connect");
const mongoose = require("mongoose");

let leaveschema = new mongoose.Schema({
    Name:{
        type:String
    },
    Reason:{
        type:String,
        required:true
    },
    Department:{
        type:String,
        required:true
    },
    outtime:{
        type:String,
        required:true
    },
    intime:{
        type:String,
        required:true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending"
      },
      professorstatus: {
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending"
      },
      finalstatus: {
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending"
      },
      approved: {
        type: Boolean,
        default: false
      },
      denied: {
        type: Boolean,
        default: false
      },
      stud: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student"
        },
        username: String
      },
      Date:{
        type:Date,
        default:Date.now()
      }
},{ timestamps: {},strictPopulate:false});

const leave = mongoose.model("Leave",leaveschema);

module.exports = leave;