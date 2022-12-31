"use strict"
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const Passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
const bodyparser = require("body-parser")
let otp = require('otp-generator');//It is let Variable because otp is not constant
const sendMail = require('./nodemailer');
const port = process.env.PORT || 3000;

//Module
const student = require("./Modules/student");
const Hod = require("./Modules/Hod");
const Professor = require("./Modules/Professor");
const { update } = require('./Modules/student');
const Leave = require("./Modules/leave");
const { error } = require('console');
const leave = require('./Modules/leave');


//Path
const viewspath = path.join(__dirname, "./views");

app.set("view engine", "ejs");
app.set("views", viewspath);

app.use(bodyparser.json())
app.use(express.urlencoded({ extended: true })); //Support Encoded Bodies
app.use(cookieParser('secretstringforcokkies'))
app.use(
  session({
    secret: "secretstringforsession",
    resave: false,
    saveUninitialized: false,
    cookie:{secure:false,maxAge:60000}
  })
);
app.use(flash());
app.use(express.json());
//for Authentication
app.use(Passport.initialize());
app.use(Passport.session());


//OTP Generator
otp = otp.generate(5,{ upperCaseAlphabets:false, specialChars:false,lowerCaseAlphabets:false },{expiresIn:'60s'});

//For Save Email
let saveEmail;
//For Date
let date = new Date();
let todaydate = date.getDate();
let month = date.getMonth()+1;
let year = date.getFullYear();

let today = (todaydate+"/"+month+"/"+year).toString();

//For Recipt Number
let recipt = 0;
recipt=recipt.toString();
let nameofstudent;
let enrollmentNo;
let find;

app.get("/", (req, res) => {
  res.status(201).render("Login",{LoginError:req.flash("LoginError"),RegisterSuccess:req.flash("Register-success")});
});

app.get("/Register", (req, res) => {
  try {
    res.status(201).render("Registration",{Passerror:req.flash("Pass-Error"),DetailError:req.flash("Detail-Error")});
  } catch (error) {
    console.log(error);
  }
});

app.get("/forgotpass", (req, res) => {
  try {
    res.status(201).render("Forgot",{EmailError:req.flash("Email-Error")});
  } catch (error) {
    console.log(error);
  }
});

app.get("/forgotpassprofessor", (req, res) => {
  try {
    res.status(201).render("ForgotP",{EmailError:req.flash("Email-Error")});
  } catch (error) {
    console.log(error);
  }
});

app.get("/forgotpasshod", (req, res) => {
  try {
    res.status(201).render("ForgotH",{EmailError:req.flash("Email-Error")});
  } catch (error) {
    console.log(error);
  }
});

app.get("/hod/login",(req,res)=>{
  try {
    res.status(201).render("LoginH")
  } catch (error) {
    console.log(error)
  }
});

app.get("/hod/home",async (req,res)=>{
  try {
    find = await Leave.find({})
    res.status(201).render("hodhome",{find})
  } catch (error) {
    console.log(error)
  }
});

app.get("/professor/login",(req,res)=>{
  try {
    res.status(201).render("LoginP")
  } catch (error) {
    console.log(error)
  }
});

app.get("/OTP",(req,res)=>{
  try {
    res.status(201).render("OTP",{EmailSuccess:req.flash("Email-Success")})
  } catch (error) {
    console.log(error)
  }
})

app.get("/Home",async (req,res)=>{
  try {

    find = await Leave.find({});
    find.Name = nameofstudent;

   
    if(find){
      // console.log("Hello");
      res.status(201).render("Home",{nameofstudent,today,find});
    }
    else{
      res.status(201).render("Home",{nameofstudent,enrollmentNo,today});
    }
  } catch (error) {
    console.log(error)
  }
});

app.get("/applyforleave",(req,res)=>{
  try {
    res.status(201).render("ApplyLeave",{today,recipt,nameofstudent})
  } catch (error) {
    console.log(error)
  }
})

app.get("/OTPH",(req,res)=>{
  try {
    res.status(201).render("OTPH",{Emailsuccess:req.flash("Email-success")})
  } catch (error) {
    console.log(error)
  }
});

app.get("/OTPP",(req,res)=>{
  try {
    res.status(201).render("OTPP",{Emailsuccess:req.flash("Email-success")})
  } catch (error) {
    console.log(error)
  }
});

app.get("/history",async (req,res)=>{

  find = await Leave.find({});
  find.Name = nameofstudent;

  try {
    res.status(201).render("History",{find,nameofstudent});
  } catch (error) {
    console.log(error)
  }
})

app.post("/Register", async (req, res) => {
  const detail = new student({
    Name: req.body.Name,
    Email: req.body.Email,
    MONumber: req.body.Mobile,
    PRN: req.body.PRN,
    Password: req.body.Password,
  });
  const Pass = req.body.Password;
  const confirmpass = req.body.ConPass;
  const email = req.body.Email;
  const test = student.findOne({ Email: email });
  // try{
  if (confirmpass != Pass) {
    req.flash("Pass-Error","Password Not Match");
    res.status(201).redirect("/Register")
  }
  // else if(test){
  //   req.flash("Detail-Error","Provided Detail Already Present");
  //   res.status(201).redirect("/Register")
  // }
  else
  {
      const save = await detail.save();
      req.flash("Register-success","Register Successfully Now You Can Login")
      res.status(201).redirect("/");
  }
// }catch(error){
//     console.log("Error");
//     req.flash("server-error","Error in Detail")
//     res.redirect("/Register")
//   }
// });
})

app.post("/login", async (req, res) => {
  try {
    const PRN = req.body.PRN;
    const email = req.body.Email;
    const Password = req.body.Pass;

    let result = await student.findOne({ Email: email });

    if (result.Email == email && result.PRN == PRN && await bcrypt.compare(req.body.Pass, result.Password)) 
      {
          let studentname = result.Name.split(" ")[0];
          nameofstudent = studentname;
          enrollmentNo = result.PRN;
          // console.log(enrollmentNo)
           res.status(201).redirect("/Home");
      }
       else {
        req.flash("LoginError","Login Detail Not Match")
        res.status(201).redirect("/")
      }
    }
   catch (error) {
    console.log(error);
  }
});
app.post("/hod/login", async (req, res) => {
  try {
    const email = req.body.Email;
    const Password = req.body.Password;
    console.log(email+"\n"+Password)
    let result = await Hod.findOne({ Email: email });

    if (result.Email == email && result.Password == Password) 
      {
         
          // console.log(enrollmentNo)
           res.status(201).redirect("/hod/home");
      }
       else {
        req.flash("LoginError","Login Detail Not Match")
        res.status(201).redirect("/")
      }
    }
   catch (error) {
    console.log(error);
  }
});



app.post("/forgot",async(req,res)=>{
    try {

        let getemail = await req.body.email;

        let checkdbofstudent = await student.findOne({Email:getemail})

        if(checkdbofstudent){
          saveEmail=checkdbofstudent.Email;
            await sendMail(getemail,"Reset Password OTP",`Hi ${checkdbofstudent.Name},\nWe received a request to Reset Your Password to the Account ${getemail}.\n\nPlease Enter Below Code This Code Expires in 2 Minute Befast Please,\n\nOTP:${otp}\n\nThank You,\nTeam SPCE`);
            req.flash("Email-Success","Email Sent Successfully")
            res.status(201).redirect("/OTP");
          }
        else{
            req.flash("Email-Error","Email Not Found");
            res.status(201).redirect("/forgotpass")
        }
        
    } catch (error) {
        console.log(error);
    }
});

app.post("/forgot/Hod",async(req,res)=>{
  try {

      const getemail = req.body.email;

      const checkdbofhod = Hod.findOne({Email:getemail});
      if(checkdbofstudent){
        saveEmail=checkdbofhod.Email;
          await sendMail(getemail,"Reset Password OTP",`Hi ${checkdbofhod.Name},\nWe received a request to Reset Your Password to the Account ${getemail}.\n\nPlease Enter Below Code This Code Expires in 2 Minute Befast Please,\n\nOTP:${otp}\n\nThank You,\nTeam SPCE`);
          req.flash("Email-Success","Email Sent Successfully")
          res.status(201).redirect("/OTPH")
      }
      else{
        req.flash("Email-Error","Email Not Found")
        res.status(201).redirect("/forgotpasshod")
      }
      
  } catch (error) {
      console.log(error);
  }
});

app.post("/forgot/Professor",async(req,res)=>{
  try {

      const getemail = req.body.email;

      const checkdbofprofessor = Professor.findOne({Email:getemail});
      if(checkdbofstudent){
        saveEmail=checkdbofprofessor.Email;
          await sendMail(getemail,"Reset Password OTP",`Hi ${checkdbofprofessor.Name},\nWe received a request to Reset Your Password to the Account ${getemail}.\n\nPlease Enter Below Code This Code Expires in 2 Minute Befast Please,\n\nOTP:${otp}\n\nThank You,\nTeam SPCE`);
          req.flash("Email-success","Email Send Successfully")
          res.status(201).redirect("/OTPP");
      }
      else{
          req.flash("Email-error","Email Not Found");
          res.status(201).redirect("/forgotpassprofessor")
      }
      
  } catch (error) {
      console.log(error);
  }
});


app.post("/otp",async (req,res)=>{
   try {
    let getotp = req.body.value;
    getotp=getotp.join('');
    if(getotp===otp){
      res.status(201).render("Passreset");
    }
   } catch (error) {
    req.flash("Otp-Error","OTP Not Match")
    res.status(201).redirect("/OTP")
   }
});
app.post("/otp/hod",async (req,res)=>{
  try {
   let getotp = req.body.value;
   getotp=getotp.join('');
   if(getotp===otp){
     res.status(201).render("PassresetH");
   }
  } catch (error) {
   console.log(error);
  }
});
app.post("/otp/professor",async (req,res)=>{
  try {
   let getotp = req.body.value;
   getotp=getotp.join('');
   if(getotp===otp){
     res.status(201).render("PassresetP");
   }
  } catch (error) {
   console.log(error);
  }
});

app.post("/reset",async (req,res)=>{
    let newpass = req.body.Newpass;
    let confirm = req.body.Connewpass;
    // console.log(newpass+" "+confirm)
    if(newpass == confirm){
    let update = await PassUpdate(student._id,newpass,student);
    res.status(201).render("Login")
    }
    else
    {
      console.log("Error 1")
    }
});

app.post("/reset/hod",async (req,res)=>{
  let newpass = req.body.Newpass;
  let confirm = req.body.Connewpass;
  // console.log(newpass+" "+confirm)
  if(newpass == confirm){
  let update = await PassUpdate(Hod._id,newpass,Hod);
  res.status(201).render("Login")
  }
  else
  {
    console.log("Error 1")
  }
});

app.post("/reset/professor",async (req,res)=>{
  let newpass = req.body.Newpass;
  let confirm = req.body.Connewpass;
  // console.log(newpass+" "+confirm)
  if(newpass == confirm){
  let update = await PassUpdate(Professor._id,newpass,Professor);
  res.status(201).render("Login")
  }
  else
  {
    console.log("Error 1")
  }
});

app.post("/leave",async (req,res)=>{
  //  try {
      
  //     student.findById(req.params.id)
  //     .populate("Leave")
  //     .exec((error,Student)=>{
  //       if(error){
  //         console.log(error);
  //       }
  //       else{
  //         Leave.create((err,newleave) => {
  //           if(err){
  //             console.log(err)
  //           }
  //           else{
  //             newleave = new Leave({
  //               Name: nameofstudent,
  //               Reason:req.body.Reason,
  //               Department:req.body.Sem,
  //               outtime:req.body.outtime,
  //               intime:req.body.intime
  //             });

  //             newleave.save();

  //             Student.leaves.push(newleave)
  //             console.log("completed");

  //             Student.save();
  //           }
  //         })
  //       }
  //     })
     
      

  //     res.status(201).redirect("/Home");
  //  } catch (error) {
  //   console.log(error);
  //  }

      let newleave = new Leave({
                  Name: nameofstudent,
                  Reason:req.body.Reason,
                  Department:req.body.Sem,
                  outtime:req.body.outtime,
                  intime:req.body.intime
                });
            let result = await newleave.save();
            
            res.redirect("/Home");
});


const PassUpdate = async (_id,newpass,db) => {
  try {
    let Password = await bcrypt.hash(newpass,12);
    const result = await db.findByIdAndUpdate({_id},{
      $set:{
        Password:Password,
      }},
      {
      new:true,
      useFindAndModify:true
      }
    )
    await result.save();
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

app.listen(port, () => {
  console.log(`Serever Start on Port Number:${port}`);
});
