import Appliance from '../models/appliance.model.js';
import Bill from '../models/bill.model.js';

export const addAppliances = async(req,res,next)=>{
    try{
        const{
            name,
            voltage,
            hoursPerDay,
            days
        } = req.body;

        const userId = req.user._id;

        if(!name || !voltage || !hoursPerDay){
            return res.status(400).json({
                success:false,
                message:"Name,Voltage,Hours per day are required"
            });
        }

        let finalDays = days;

        if(!finalDays){
            const latestBill = await Bill.findOne({user:userId}).sort({billEndDate:-1});

            if(!latestBill){
                return res.status(400).json({
                    success:false,
                    message:"No bill found.Provide days manually or upload a bill"
                });
            }

            finalDays = latestBill.totalDays;
        }

        if (!finalDays) {
            return res.status(400).json({
                success: false,
                message: 'Days is required to calculate units consumed.',
                cause: 'You have not uploaded any bill yet. Either enter the number of days manually in the Days field, or upload a bill first so days can be auto-fetched.',
                action: 'Please enter days manually or go to Bills page and add a bill first.'
        })
    }
        const unitsConsumed = (voltage*hoursPerDay*finalDays)/1000;

        const appliance = await Appliance.create({
            user:userId,
            name,
            voltage,
            hoursPerDay,
            days:finalDays,
            unitsConsumed
        });

        res.status(200).json({
            success:true,
            message:"Appliance added successfully",
            data:appliance
        });
    }catch(error){
        next(error);
    }
}

export const getAppliances = async(req,res,next)=>{
    try{
        const userId = req.user._id;

        const appliances = await Appliance.find({user:userId}).sort({createdAt:-1});

        res.status(200).json({
            success:true,
            count:appliances.length,
            data:appliances
        });
    }catch(error){
        next(error);
    }
}

export const updateAppliance = async(req,res,next)=>{
    try{
        const applianceId = req.params.id;
        const userId = req.user._id;

        const{
            name,
            voltage,
            hoursPerDay,
            days,
        } = req.body;

        const appliance = await Appliance.findOne({
            _id:applianceId,
            user:userId
        });

        if(!appliance){
            res.status(404).json({
                success:false,
                message:"Appliance not found",
            });
        }

        if (name) appliance.name = name;
        if (voltage) appliance.voltage = voltage;
        if (hoursPerDay) appliance.hoursPerDay = hoursPerDay;

        let finalDays = days;

        if(!finalDays){
            const latestBill = await Bill.findOne({user:userId}).sort({billEndDate:-1});

            if(latestBill){
                finalDays = latestBill.totalDays;
            }else{
                finalDays = appliance.days;
            }
        }

        appliance.days = days;

        appliance.unitsConsumed = (appliance.voltage * appliance.hoursPerDay * appliance.days)/1000;

        await appliance.save();

        res.status(200).json({
            success:true,
            message:"Appliance updated successfully",
            data:appliance
        });
    }catch(error){
        next(error);
    }
}

export const deleteAppliance = async(req,res,next)=>{
    try{
        const applianceId = req.params.id;
        const userId = req.user._id;

        const appliance = await Appliance.findOneAndDelete({
            _id:applianceId,
            user:userId
        });

        if(!appliance){
            return res.status(404).json({
                success:false,
                message:"Appliance not found"
            });
        }

        res.status(200).json({
            success:true,
            message:"Appliance deleted successfully"
        });
    }catch(error){
        next(error);
    }
}