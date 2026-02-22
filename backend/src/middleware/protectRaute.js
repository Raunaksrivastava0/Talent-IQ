import {requireAuth } from '@clerk/express'
import User from '../models/User.js';

export const protectRoute = [
    requireAuth(), // this will check if the user is authenticated and adds the auth object to the request
    async (req,res,next)=>{
        try {
            const clerkId = req.auth().userId; // get the user ID from the auth object
            if(!clerkId){
                return res.status(401).json({msg:"Unauthorized-invalid token"});
            }
            //find the user in the database using the clerkId
            const user = await User.findOne({clerkId}); // find the user in the database using the clerkId
            if(!user){
                return res.status(404).json({msg:"Unauthorized-user not found"});
            }
            req.user = user; // add the user object to the request for use in the next middleware or route handler
            next(); // call the next middleware or route handler
        } catch (error) {
            console.error("Error in protectRoute middleware:", error);
            res.status(500).json({msg:"Server error"});
        }
    },
];