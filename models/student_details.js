import mongoose from "mongoose";


const student_data_Schema = new mongoose.Schema({

    student_name: {
        type: String,
        required:true,

    },
    student_roll: {
        type: String,
        required:true,
        unique:true
    },
    student_course:{
        type: String,
        required:true
    },
    student_year:{
        type: Number,
        required:true
    },
    user_type:{
        type: String,
        default: "student"
    }
});

const student_data_details = new mongoose.model("student_data", student_data_Schema);
export { student_data_details };