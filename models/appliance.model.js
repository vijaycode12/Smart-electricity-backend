import mongoose from "mongoose";

const applianceSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    name:{
        type:String,
        required:[true,'Appliance name is required'],
        trim:true,
    },
    voltage:{
        type:Number,
        required:true,
        default:1000,
    },
    hoursPerDay:{
        type:Number,
        required:true,
    },
    days:{
        type:Number,
        required:false,
    },
    unitsConsumed:{
        type:Number,
        required:false,
    },
},{timestamps:true});

const Appliance = mongoose.model('Appliance',applianceSchema);

export default Appliance;