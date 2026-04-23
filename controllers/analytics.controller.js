import Appliance from "../models/appliance.model.js";
import Bill from "../models/bill.model.js";

export const getMonthly = async(req,res,next)=>{
    try{
        const userId = req.user._id;

        const bills = await Bill.find({user:userId}).sort({billEndDate:-1});

        const monthlyData = bills.map(bill=>({
            month:bill.billEndDate.toISOString().slice(0,7),
            totalUnits:bill.totalUnits,
            totalAmount:bill.totalAmount,
            totalDays:bill.totalDays
        }));

        res.status(200).json({
            success:true,
            data:monthlyData
        });
    }catch(error){
        next(error);
    }
}

export const getAppliance = async(req,res,next)=>{
    try{
        const userId = req.user._id;

        const appliances = await Appliance.find({user:userId});

        const totalUnits = appliances.reduce((sum,a)=>sum+a.unitsConsumed,0);

        const breakDown = appliances.map(a=>({
            name:a.name,
            units:a.unitsConsumed,
            percentage:totalUnits?((a.unitsConsumed/totalUnits)*100).toFixed(2):0
        }));

        res.status(200).json({
            success:true,
            data:breakDown
        });
    }catch(error){
        next(error);
    }
}

export const getPredictions = async(req,res,next)=>{
    try{
        const userId = req.user._id;

        const bills = await Bill.find({user:userId}).sort({billEndDate:-1});

        if(bills.length===0){
            return res.status(400).json({
                success:false,
                message:"No billing history available for prediction"
            });
        }

        const avgUnits = bills.reduce((sum,b)=>sum+b.totalUnits,0)/bills.length;
        const avgCost = bills.reduce((sum,b)=>sum+b.totalAmount,0)/bills.length;

        res.status(200).json({
            success:true,
            predictedUnits:Math.round(avgUnits),
            predictedCost:Math.round(avgCost)
        });
    }catch(error){
        next(error);
    }
}

export const getSuggestions = async(req,res,next)=>{
    try{
        const userId = req.user._id;

        const appliances = await Appliance.find({user:userId});

        let suggestions=[];

        appliances.forEach(a=>{
            if(a.voltage>1500){
                suggestions.push(`${a.name} consumes high power.Consider using energy efficient model`)
            }

            if(a.hoursPerDay>10){
                suggestions.push(`${a.name} runs for long hours.Try reducing`);
            }
        });

        if(suggestions.length===0){
            suggestions.push("Great job! Your appliance usage looks efficent");
        }

        res.status(200).json({
            success:true,
            data:suggestions
        });
    }catch(error){
        next(error);
    }
}

export const getAlerts = async(req,res,next)=>{
    try{
        const userId = req.user._id;

        const bills = await Bill.find({user:userId}).sort({billEndDate:-1});

        if(bills.length<2){
            return res.status(200).json({
                success:true,
                data:["Not enough data for alerts"]
            });
        }

        const latest = bills[0];
        const previous = bills[1];

        let alerts= [];

        if(latest.totalUnits>previous.totalUnits*1.2){
            alerts.push("Your electricity usage increased more than 20% compared to last month");
        }

        if(latest.totalAmount>previous.totalAmount*1.2){
            alerts.push("Your bill amount significantly increased this month.");
        }

        if(alerts.length===0){
            alerts.push("No unusual spikes detected");
        }

        res.status(200).json({
            success:true,
            data:alerts
        });
    }catch(error){
        next(error);
    }
}

export const getEfficiency = async(req,res,next)=>{
    try{
        const userId = req.user._id;

        const bills = await Bill.find({user:userId});

        if(bills.length===0){
            return res.status(400).json({
                success:false,
                message:"No data available"
            });
        }

        const avgUnits = bills.reduce((sum,b)=>sum+b.totalUnits,0)/bills.length;

        let score = 100;

        if(avgUnits>500) score-=30;
        else if(avgUnits>300) score-=20;
        else if(avgUnits>200) score-=10;

        res.status(200).json({
            success:true,
            efficiencyScore:score
        });
    }catch(error){
        next(error);
    }
}