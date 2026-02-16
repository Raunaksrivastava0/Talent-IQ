import {StreamChat} from 'stream-chat';
import { ENV } from './env';

const apikey = ENV.STREAMS_API_KEY;
const apisecret = ENV.STREAMS_API_SECRET;

if(!apikey || !apisecret){
    console.error('Missing Stream API key or secret');
}

export const chatClient = StreamChat.getInstance(apikey, apisecret);

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

//todo: add another method to generate token

