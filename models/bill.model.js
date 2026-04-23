import mongoose from "mongoose";

const billSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    billStartDate:{
        type:Date,
    },
    billEndDate:{
        type:Date,
    },
    totalDays:{
        type:Number,
    },
    totalUnits:{
        type:Number,
        required:true,
    },
    costPerUnit:{
        type:Number,
    },
    totalAmount:{
        type:Number,
    },
    billFile:{
        type:String,
    }
},{timestamps:true});

const Bill = mongoose.model('Bill',billSchema);

export default Bill;