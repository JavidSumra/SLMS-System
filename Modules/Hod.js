let DB = require("../DataBase/db_connect");
let mongoose = require("mongoose");
let validate = require("validator");

let hodschema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validate.isEmail(value)){
                console.log("Wrong Email")            
        };
        }
    },
    Password:{
        type:String,
        required:true
    },
    Department:{
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
});

hodschema.pre("save",async function(next){
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

let Hod = mongoose.model("HOD",hodschema);

module.exports = Hod;