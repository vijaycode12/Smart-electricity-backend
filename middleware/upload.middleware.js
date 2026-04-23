import multer from "multer";

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"upload/bills/");
    },

    filename:function(req,file,cb){
        const uniqueName = Date.now()+"-"+file.originalname;
        cb(null,uniqueName);
    }
});

const fileFilter = (req,file,cb)=>{
    const allowedType=[
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf"
    ];

    if(allowedType.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error("Only PDF,JPG,PNG are allowed"),false);
    }
};

export const uploadBillFile = multer({
    storage,
    fileFilter
});