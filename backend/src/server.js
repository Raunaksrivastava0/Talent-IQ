import express from 'express';
import path from 'path';
import cors from 'cors';
import { serve } from '/inngest/express';
import { clerkMiddleware } from '@clerk/express'

import { ENV } from './libs/env.js';
import { connectDB } from './libs/db.js';
import { inngest,functions } from './libs/inngest.js';

import chatRoutes from './routes/chatRoutes.js';

const app = express();

const __dirname = path.resolve();

//middleware
app.use(express.json());
// credentials:true meaning?? => server allows browser to include cookies to be sent/received
app.use(cors({origin: ENV.CLIENT_URL,Credentials:true}));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({client: inngest, functions}));
app.use("/api/chat", chatRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ msg: "Server is healthy" });
});

// make our app ready for deployment
if(ENV.NODE_ENV==='production'){
    app.use(express.static(path.join(__dirname,'../frontend/dist')));

    app.get('/{*any}',(req,res)=>{
        res.sendFile(path.join(__dirname,'../frontend/dist/index.html'));
    });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});

  } catch (error) {
    console.error('Failed to start server:', error);
  } 
};
startServer();
