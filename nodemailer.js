const { send } = require('express/lib/response');
const  node = require('nodemailer')
require('dotenv').config();
// const random = Math.floor(1000+Math.random()*9000);
module.exports = async (email,subject,text) =>{
    
    const transporter =  node.createTransport(
        {
            service:'gmail',
            host:'smtp.gmail.com',
            port:465,
            secure:true,
            auth:{
                user:"javidsumara987@gmail.com",
                pass:'jxje ucas twaa ylvu'
            }
        }
       );
       
       let messagedetail = {
           from:"javidsumara987@gmail.com",
           to:email,
           subject:subject,
           text:text
       };
       
      let send = await transporter.sendMail(messagedetail,function(err,data){
           if(err)
           {
               console.log(err)
           }
           else{
               console.log("Email Sent Successfully")
           }
       })
}