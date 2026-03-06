import {StreamChat} from 'stream-chat';
import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from './env.js';

const apikey = ENV.STREAMS_API_KEY;
const apisecret = ENV.STREAMS_API_SECRET;

if(!apikey || !apisecret){
    console.error('Missing Stream API key or secret');
}

export const chatClient = StreamChat.getInstance(apikey, apisecret);//This is for chat features
export const streamClient= new StreamClient(apikey, apisecret);//This will be used for video calls

export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUser(userData);
        console.log("Stream user upserted successfully:", userData);
    } catch (error) {
        console.error('Error upserting Stream user:', error);
    }
};

export const deleteStreamUser = async (userId) => {
    try {
        await chatClient.deleteUser(userId);
        console.log(`Stream user ${userId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting Stream user:', error);
    }
};


