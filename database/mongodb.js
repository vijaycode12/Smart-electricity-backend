import mongoose from "mongoose";
import dns from 'dns';

import {DB_URL,NODE_ENV} from '../config/env.js';

dns.setServers(["8.8.8.8", "1.1.1.1"]);

if(!DB_URL){
    throw new Error('Please define the MONGODB_URL');
}

const connectToDatabase = async()=>{
    try{
        await mongoose.connect(DB_URL);
        console.log(`Connected to database in ${NODE_ENV} mode`);
    }catch(error){
        console.log('Error in connecting to database');

        process.exit(1);
    }
}

export default connectToDatabase;