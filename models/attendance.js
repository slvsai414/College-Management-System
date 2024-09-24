import mongoose from "mongoose";


const student_attendance = new mongoose.Schema( {
    RollNumber : {
        type : String,
        required: true,
    },

    Date : {
        type : Date,
        required: true,
    },

    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    }

});


const std_attendance = new mongoose.model('Attendance', student_attendance);
export { std_attendance };