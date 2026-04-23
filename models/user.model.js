import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true,'Username is required'],
        trim:true,
        minLength:2,
        maxLength:20
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        trim:true,
        lowercase:true,
        match:[/\S+@\S+\.\S+/,'Please fill a valid email address'],
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minLength:[6,'Password should atleast six characters'],
    },
},{timestamps:true});

const User = mongoose.model('User',userSchema);

export default User;