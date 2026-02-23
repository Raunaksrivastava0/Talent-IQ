
import { streamClient } from '../libs/stream.js';
import Session from '../models/Session.js';
export async function createSession(req, res) {
        try {
        const {problem,difficulty}= req.body;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        // Validate input
        if (!problem || !difficulty) {
            return res.status(400).json({ message: "Problem and difficulty are required" });
        }
        //generate a unique call ID for the session
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Create the session in the database
        const session  = await Session.create({problem,difficulty,host:userId,callId});

        //crete a Stream channel for the session using the callId as the channel ID
        await streamClient.video.call("default", callId).getOrCreate({
            data:{
                created_by_id:clerkId,
                custom:{problem,difficulty,sessionId:session._id.toString()},
            },
        });
        
        //chat messaging

        const channel = chatClient.channel("messaging", callId, {
            name:` ${problem} Session `,
            created_by_id:clerkId,
            members:[clerkId]
        })

        await channel.create();

        res.status(201).json({session});

} catch (error) {
    console.error("Error creating session:", error.message);
    res.status(500).json({message:"Internal Server error"});
}
}

export async function getActiveSessions(_, res) {
    try {
       const sessions = await Session.find({status:"active"})
       .populate("host","name profileImage email clerkId")
       .sort ({createdAt:-1})
       .limit(20);
         
       res.status(200).json({sessions});
   } catch (error) {
       console.error("Error fetching active sessions:", error.message);
       res.status(500).json({message:"Internal Server error"});
   }
}

export async function getMyRecentSessions(req, res) {
    try {
        //get session where the usesr is either host or participant
        const userId = req.user._id;
        await Session.find({
            status:"completed",
             $or:[{host:userId},{participants:userId}]
            })
            .sort({createdAt:-1})
            .limit(20);
        res.status(200).json({sessions});
    }  catch (error) {
        console.error("Error fetching recent sessions:", error.message);
        res.status(500).json({message:"Internal Server error"});
    }
}

export async function getSessionById(req, res) {
    try {
        const {id} = req.params;
        const session = await Session.findById(id)
        .populate("host","name profileImage email clerkId")
        .populate("participant","name profileImage email clerkId");

        if(!session){
            return res.status(404).json({message:"Session not found"});
        }
        res.status(200).json({session});
    } catch (error) {
        console.error("Error fetching session by ID:", error.message);
        res.status(500).json({message:"Internal Server error"});
    }
}

export async function joinSession(req, res) {
    try { 
        const {id} = req.params;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        const session = await Session.findById(id);

        if(!session){
            return res.status(404).json({message:"Session not found"});
        }

        if(session.status !== "active"){
            return res.status(400).json({message:"cannot join a completed session"});
        }
        if(session.host.toString() === userId.toString()){
            return res.status(400).json({message:"Host cannot join as participant"});
        }

        // check if the session is already full
        if(session.participants){
            return res.status(409).json({message:"Session is already full"});
        }

        session.participants = userId;
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({message:"Successfully joined session"});

    } catch (error) {
        console.log("Error joining session:", error.message);
        res.status(500).json({message:"Internal Server error"});
    }
}

export async function endSession(req, res) {
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);

        if(!session){
            return res.status(404).json({message:"Session not found"});
        }
        //only the host can end the session => check if the user is the host
        if(session.host.toString() !== userId.toString()){
            return res.status(403).json({message:"Only the host can end the session"});
        }
        // check if the session is already completed
        if(session.status === "completed"){
            return res.status(400).json({message:"Session is already completed"});
        }

        //delete the Stream video call channel
        const call= streamClient.video.call("default", session.callId);
        await call.delete({hard:true});

        //delete the chat channel
        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete();

        session.status = "completed";
        await session.save();

        res.status(200).json({message:"Session ended successfully"});
    } catch (error) {
        console.error("Error ending session:", error.message);
        res.status(500).json({message:"Internal Server error"});
    }
}
