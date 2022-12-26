const DB = require("../DataBase/db_connect");
const mongoose = require("mongoose");
const validate = require("validator");

let professorSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique:true
    },
    Department:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    },
    Date:{
        type:Date,
        default:Date.now()
    },
    leaves:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Leave"
    }
    ]
});

professorSchema.pre("save",async function(next){
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

let Professor = mongoose.model("Professor",professorSchema);

module.exports = Professor;