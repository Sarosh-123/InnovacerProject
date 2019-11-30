const express=require('express');
const bodyParser=require('body-parser')
const path=require('path');
const exprhbs=require('express-handlebars')
const nodemailer=require('nodemailer')
const smtpTransport=require('nodemailer-smtp-transport')
const app=express();
const Nexmo=require('nexmo');
const ejs=require('ejs');
var cookieParser = require('cookie-parser');
app.use(cookieParser())
const {host,visitor}=require('./db')
app.engine('handlebars',exprhbs());
app.set('view engine','handlebars');
app.use('/public',express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
const nexmo=new Nexmo({
  apiKey:'686f829b',
  apiSecret:'UlMtb3ecfqGDZZjw'
},{debug:true});
app.get('/',(req,res)=>{
  res.render('index',{layout:false})
})
app.post('/checkin',(req,res)=>{
    //  sessionStorage.clear();
    res.render('contact',{layout:false});
})
app.post('/send',async(req,res)=>{
 
  var item1 = await host.create({
   Name:req.body.name1,
   Phone:req.body.phone1,
   email:req.body.email1
  })
  var item2=await visitor.create({
    Name:req.body.name,
    Phone:req.body.phone,
    email:req.body.email,
    hostId:item1.id,
    address:req.body.company,
    checkin:new Date().toLocaleString()
  })
  res.cookie('id',item2.id,{maxAge: 7*24*60*60*1000}); 
    console.log(req.cookies.id)
    const output=`
    <h1>You have got a visitors request</h1>
    <ul>
    <li>Name:${req.body.name}</li>
    <li>Mob:${req.body.phone}</li>
    <li>email:${req.body.email}</li>
    </ul>
    <p>${req.body.message}</p>
    `
    let transporter = nodemailer.createTransport(smtpTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'a9236437500@gmail.com', // generated ethereal user
          pass: 'Sarosh123#' // generated ethereal password
        },
        tls:{
            rejectUnauthorized:false
        }
      }));
    
      // send mail with defined transport object
      let mailOptions={
        from: '"You have got a visitor" <a9236437500@gmail.com>', // sender address
        to: req.body.email1, // list of receivers
        subject: "Visit request", // Subject line
        text: "Hello world?", // plain text body
        html: output // html body
      };
      transporter.sendMail(mailOptions,(error,info)=>{

    if(error){
        return console.log(error);
    }
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
     
     })
     res.render('redirect',{layout:false});
     const mob=req.body.phone1;
     const text=`
            Visitor Details
     Name:${req.body.name}
     mob:${req.body.phone}
     email:${req.body.email}
     Visit address:${req.body.company}
     Message From Visitor:
     ${req.body.message}
     `
     nexmo.message.sendSms(
       'Nexmo' ,'+917428454965',text,{type:'unicode'},
       (err,response)=>{
         if(err){
           console.log(err)
         }
         else{
           console.dir(response)
         }
       }
     )
})
app.post('/checkout',async(req,res)=>{
  let item1=await visitor.findOne({where:{id:req.cookies.id}})
  let item2=await host.findOne({where:{id:item1.hostId}})
 
  const output=`
    <h1>Thanks For Visiting</h1>
    <ul>
    <li>Host Name:${item2.Name}</li>
    <li>Host Mob:${item2.Phone}</li>
    <li>Host email:${item2.email}</li>
    <li>Address Visited:${item1.address}</li>
    <li>Checkin Time:${item1.checkin}</li>
    <li>Checkout Time:${new Date().toLocaleString()}
    </ul>
    `
    let transporter = nodemailer.createTransport(smtpTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'a9236437500@gmail.com', // generated ethereal user
          pass: 'Sarosh123#' // generated ethereal password
        },
        tls:{
            rejectUnauthorized:false
        }
      }));
    
      // send mail with defined transport object
      let mailOptions={
        from: '"Thanks for The visit!" <a9236437500@gmail.com>', // sender address
        to: item1.email, // list of receivers
        subject: "Visit Finished", // Subject line
        text: "Hello world?", // plain text body
        html: output // html body
      };
      transporter.sendMail(mailOptions,(error,info)=>{

    if(error){
        return console.log(error);
    }
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
      
     })
    const mob=item1.Phone;
     const text=`
            Thanks For The Visit
     Host Details:
     Name:${item2.Name}
     mob:${item2.Phone}
     email:${item2.email}
     Visit address:${item1.address}
     Checkin Time:${item1.checkin}
     Checkout Time:${new Date().toLocaleString()}
     `
     nexmo.message.sendSms(
       'Nexmo' ,'+917428454965',text,{type:'unicode'},
       (err,response)=>{
         if(err){
           console.log(err)
         }
         else{
           console.dir(response)
         }
       })
     res.render('index',{layout:false})
})
app.listen(3000,()=>{
console.log('server has started')
})