import mongoose from "mongoose";





const courses_Schema = new mongoose.Schema({
    course_id:{type:String,unique:true,required:true},
    name:{type:String, required:true},
    duration:{type:String, required:true},
    department:{type:String,required:true},
    credits:{type:String,required:true},

});


const Courses_Offered = new mongoose.model('courses_offered',courses_Schema);
export {Courses_Offered};