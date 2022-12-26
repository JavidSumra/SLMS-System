const DB = require("../DataBase/db_connect");
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const studentschema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            const check = validator.isEmail(value);
            if(!check){
                console.log("Invalid Email");
            }
        }
    },
    MONumber:{
        type:Number,
        required:true,
        unique:true
    },
    PRN:{
        type:String,
        required:true,
        unique:true
    },
    Password:{
        type:String,
        required:true
    },
    Date:{
        type:Date,
        default:Date.now()
    },
    leaves:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Leave"
        }
    ]
},{timestamps:true,strictPopulate:false});

studentschema.pre("save",async function(next){
    try {
        if(this.isModified("Password")){
            const salt = await bcrypt.genSalt(12);
            this.Password = await bcrypt.hash(this.Password, salt);
        }
        next();
    } catch (error) {
        console.log(error)
    }
})

const student = mongoose.model("Student",studentschema);

module.exports = student;