import mongoose from "mongoose";


    

const college_registration_Schema = new mongoose.Schema({
    fullname: { type: String, 
        required: true 
    },
    email: { type: String, 
        required: true, unique: true 
    },
    username: { type: String, 
        required: true 
    },
    password: { type: String, 
        required: true 
    },

});



const college_registration = new mongoose.model("registration_data", college_registration_Schema);
export {college_registration};


  



