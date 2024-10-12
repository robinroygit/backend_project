import dotenv from "dotenv"
import { google } from "googleapis";



dotenv.config({path:"./.env"});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


// Use module.exports if using CommonJS module system or switch to ES6 exports
const oauth2client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage'  
);

export { oauth2client }; 