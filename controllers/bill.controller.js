import Bill from '../models/bill.model.js';
import extractBillData from "../utils/extractBillData.js";

export const addBills = async(req,res,next)=>{
    try{
        const{
            billStartDate,
            billEndDate,
            totalDays,
            totalUnits,
            costPerUnit,
            totalAmount
        } = req.body;

        const userId = req.user._id;

        if(!totalUnits){
            return res.status(400).json({
                success:false,
                message:"Total units are required"
            })
        }

        let finalTotalDays = totalDays;

        if(!finalTotalDays){
            if(billStartDate && billEndDate){
                const start = new Date(billStartDate);
                const end = new Date(billEndDate);

                finalTotalDays = Math.ceil(
                    (end-start)/(1000*60*60*24)
                );

                if(finalTotalDays<=0){
                    return res.status(400).json({
                        success:false,
                        message:"Invalid bill date range"
                    })
                }
                }else{
                    res.status(400).json({
                        success:false,
                        messgae:'Provide either totaldays or bill start date & bill end date'
                    });
                }
            }

            let finalCostPerUnit = costPerUnit;
            let finalTotalAmount = totalAmount;

            if(!finalTotalAmount && finalCostPerUnit){
                finalTotalAmount = totalUnits*finalCostPerUnit;
            }

            if(!finalCostPerUnit && finalTotalAmount){
                finalCostPerUnit = finalTotalAmount/totalUnits;
            }

            if(!finalCostPerUnit && !finalTotalAmount){
                finalCostPerUnit=0;
                finalTotalAmount=0;
            }


            const bill = await Bill.create({
                user:userId,
                billStartDate,
                billEndDate,
                totalDays:finalTotalDays,
                totalUnits,
                costPerUnit:finalCostPerUnit,
                totalAmount:finalTotalAmount
            });

            res.status(200).json({
                success:true,
                message:"Bill added successfully",
                data:bill
            });
        }catch(error){
            next(error);
        }
    }

export const getBills = async(req,res,next)=>{
    try{
        const userId = req.user._id;

        const bills = await Bill.find({user:userId}).sort({billEndDate:-1});

        res.status(200).json({
            success:true,
            count:bills.length,
            data:bills
        });
    }catch(error){
        next(error);
    }
}

export const getBill = async(req,res,next)=>{
    try{
        const billId = req.params.id;
        const userId = req.user._id;

        const bill = await Bill.findOne({
            _id:billId,
            user:userId
        });

        if(!bill){
            return res.status(404).json({
                success:false,
                message:"Bill not found"
            });
        }

        res.status(200).json({
            success:true,
            data:bill
        });
    }catch(error){
        next(error);
    }
}

export const deleteBill = async(req,res,next)=>{
    try{
        const billId = req.params.id;
        const userId = req.user._id;

        const bill = await Bill.findOneAndDelete({
            _id:billId,
            user:userId
        });

        if(!bill){
            return res.status(404).json({
                success:false,
                message:"Bill not found or unauthorized"
            });
        }

        res.status(200).json({
            succes:true,
            message:"Bill deleted successfully"
        });
    }catch(error){
        next(error);
    }
}

export const uploadBill = async (req, res, next) => {
  try {
    // ── Check file exists ──────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // ── Extract data from bill using OCR ───────────────────────────────────────
    const { extractedData, rawText } = await extractBillData(filePath, mimeType);

    const {
      billStartDate,
      billEndDate,
      totalDays,
      totalUnits,
      costPerUnit,
      totalAmount
    } = extractedData;

    // ── Validate — totalUnits is the minimum required field ───────────────────
    if (!totalUnits) {
      return res.status(400).json({
        success: false,
        message: "Could not extract total units from the bill. Please upload a clearer image or PDF.",
        rawText, // send raw text to frontend for debugging
        hint: "Make sure the bill clearly shows units consumed (kWh)"
      });
    }

    // ── Save to database ───────────────────────────────────────────────────────
    const bill = await Bill.create({
      user: req.user._id,
      billStartDate,
      billEndDate,
      totalDays,
      totalUnits,
      costPerUnit,
      totalAmount,
      billFile: filePath
    });

    res.status(200).json({
      success: true,
      message: "Bill uploaded and data extracted successfully",
      extractedData: {
        billStartDate,
        billEndDate,
        totalDays,
        totalUnits,
        costPerUnit,
        totalAmount
      },
      data: bill
    });

  } catch (error) {
    next(error);
  }
};