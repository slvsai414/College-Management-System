import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { college_registration } from "./models/mongoose.js";
import { Courses_Offered } from "./models/courses.js";
import { student_data_details } from "./models/student_details.js";
import { std_attendance } from "./models/attendance.js";
import path from "path";
import { register } from "module";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import flash from "connect-flash";
import { error } from "console";
import { type } from "os";
import { get } from "http";






const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "WE GO JIM",
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error = req.flash('error');
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//DbConnect

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Mongodb is Connected");

})
.catch(()=>{
    console.log("Failed to Connect");
})



app.get("/", (req, res)=> {
    
});


app.get('/index',async(req, res)=> {

    //const User = req.user;
    if (req.isAuthenticated()) {
        res.render("index", { user:req.user })
        //console.log(user);
        
    }else{
        res.render('login')
    }
    
});


app.get("/studentInfo",async(req,res)=> {
    if (req.isAuthenticated()) {
        //const email = req.user.email;
        //console.log(email);
        res.render('studentInfo',{ Email:req.user.email });
    }else{
        res.render('login')
    }
})


app.get("/academic-management",async (req,res)=> {
    if (req.isAuthenticated()) {
    //const email = req.user.email;
    const course = await Courses_Offered.find({})
    //console.log(course)
    res.render("academic-management",{course_info:course,email:req.user.email});
    }else{
        res.render("login")
    }
});


app.get('/attendance',async (req,res)=>{
    if (req.isAuthenticated()) {

        res.render('attendance',{ Email: req.user.email });
    }else{
        res.render("login")
    }
});


app.post("/attd",async (req,res)=> {
    try{
        const stu_attendance = {
            RollNumber:req.body.RollNumber,
            Date:req.body.Date,
            status:req.body.status

    }

    const ATTENDANCE = await std_attendance.create(stu_attendance);
    res.status(201).send("Attendance Registered");
    console.log(ATTENDANCE)
    }catch(err) {
        console.log(err)
    }
});

app.get('/get_attd',async (req, res)=> {
    const roll_number = req.query.RollNumber;
    //console.log(roll_number)
    if (!roll_number) {
        return res.status(400).send("Roll Number is Required");
    }

    const get_attendance = await std_attendance.countDocuments({attendance: roll_number});
    //console.log(get_attendance)
    const percentage = (get_attendance/20)*100;
    //console.log(percentage)

});


app.get('/add_course',async(req,res)=> {
    res.render('add_course')
});



app.get("/register",(req, res)=>{
    res.render("register")
});

app.get('/login',(req, res)=>{
    res.render("login", { error:req.flash("error") });
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("An error occurred");
        }

        req.session.destroy((err)=>{
            if (err) {
                console.log(err);
                res.status(500).send("An error occurred");
            }
        });

        res.clearCookie('connect.sid');
        res.render('logged-out')
    });
});



app.get('/dashboard',async(req, res)=> {
    //console.log(user)
    if (req.isAuthenticated()){
    const students = await student_data_details.countDocuments({user_type: 'student'});
    const teachers = await college_registration.countDocuments({userType: 'teacher'});
    const courses_data = await Courses_Offered.find({});
    res.render("dashboard", {studentsLen: students, teachersLen: teachers, coursesData: courses_data.map(course => course.name)});
    }else{
        res.render("login")
    }
});



//Register_logic
app.post('/register',async (req, res)=>{
    try{
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password,10);
    const registration_data = {
        fullname:req.body.fullname,
        email:req.body.email,
        username:req.body.username,
        password:hashedPassword,
        
    };
    const registration = await college_registration.create(registration_data);
    //console.log(registration);
    res.render("login");
    }catch(err){
        console.log(err);
        res.status(500).send("Error registering users");
    }
});


//login_logic
app.post('/login',passport.authenticate('local', {
    successRedirect:"/index",
    failureRedirect:"/login",
    failureFlash: true
})
);




app.post('/academic',async(req, res)=>{
    try{
    const db_courses_data = {
        course_id:req.body.course_id,
        name:req.body.name,
        duration:req.body.duration,
        department:req.body.department,
        credits:req.body.credits,
    };
    const c_data = await Courses_Offered.create(db_courses_data);
    //console.log(c_data);
    res.status(201).send('Course added successfully');
    }
    catch(err){
        if (err.code === 11000){
            res.status(400).send("This Course Already Exist");
        }else{
            console.log(err);
            res.status(500).send("Backend Down!");
        }

    }
});




app.post('/studentInfo',async(req, res)=>{
    try{
        const student_data = {
            student_name:req.body.student_name,
            student_roll:req.body.student_roll,
            student_course:req.body.student_course,
            student_year:req.body.student_year
        }

        const students_data = await student_data_details.create(student_data);

        res.status(201).send("Data Added Sucessfully");
        //console.log(students_data);

    } catch(err) {
        if (err.code === 11000){
            res.status(400).send("The Data Already Exist");
        }else{
            console.log(err);
            res.status(500).send("Backend Down!!");
        }

    }
});



app.get("/get_info",async(req, res)=>{
    try {
        //
        //console.log(roll_number)
        const roll_number = req.query.get_rollnumber;
        //console.log(roll_number)
        if (!roll_number) {
            return res.status(400).send("Roll number is required");
        }

        
        //
        const student = await student_data_details.findOne({student_roll:roll_number});

        if (student) {
            const studentWithoutId = student.toObject();
            delete studentWithoutId._id;
            delete studentWithoutId.__v;
            //console.log(studentWithoutId);
            res.send({studentWithoutId});
            //console.log(student);
        }else{
            res.status(404).send("Data Not Found");
        }
    }
    catch(err){
        console.log(err);
        res.send(500).send("BackEnd Down!!");
    }
});



passport.use(new Strategy({ 
    usernameField: "email",
    passwordField: "password",
    passReqToCallback:true
},

    async function (req, email, password, cb){
    console.log(email)
    try{
        const user = await college_registration.findOne({email:req.body.email});
        if (!user) {
            return cb(null, false, {message:"User not found"});
        }
        const decrypt = await bcrypt.compare(password, user.password,);

        if(decrypt) {
            return cb(null, user);
        } else{
            return cb(null, false,{message:"Incorrect Password"});
        }
        //console.log(user);
        
    }catch(err){
        return cb(err);
    }
}));


passport.serializeUser((user, cb)=>{
    return cb(null, user)
});


passport.deserializeUser((user, cb)=>{
    return cb(null, user)
});


// app.get("",async(req, res)=>{
//     try {

//     }
//     catch(err){

//     }
// });




//Server
app.listen(port, () => {
    console.log(`The Server is Running in ${port}`);

});


