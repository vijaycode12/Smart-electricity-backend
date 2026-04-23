import mongoose from "mongoose";

const analyticsSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    month:{
        type:String,
        required:true,
    },
    totalUnits:{
        type:Number,
        required:true,
    },
    totalCost:{
        type:Number,
        required:true,
    },
    highestUsageAppliance:{
        type:String,
    },
    suggestions:[
        {
            type:String,
        }
    ],
},{timestamps:true});

const Analytics = mongoose.model('Analytics',analyticsSchema);

export default Analytics;