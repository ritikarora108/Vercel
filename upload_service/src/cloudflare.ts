// fileName => output/id123/src/App.jsx
// localFilePath => /c/Users/arora/Desktop/Dev/Harkirat/Vercel/dist/output/id123/src/App.jsx

import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"


import { configDotenv } from "dotenv"
configDotenv();

console.log("🌐 Initializing S3 client for Cloudflare R2 (upload service)...");
const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.ENDPOINT!,
    credentials: {
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
        accessKeyId: process.env.ACCESS_KEY_ID!
    }

})
console.log("✅ S3 client initialized successfully (upload service)");

export const uploadFile = async (fileName: string, localFilePath: string) => {
    console.log(`📤 Starting upload for file: ${fileName}`);
    console.log(`📂 Local file path: ${localFilePath}`);
    
    try {
        console.log(`📖 Reading file content: ${localFilePath}`);
        const fileContent = await new Promise<Buffer>((resolve, reject) => {
            fs.readFile(localFilePath, (err, content) => {
                if (err) reject(err);
                else resolve(content);
            })
        })

        console.log(`📊 File size: ${fileContent.length} bytes`);
        console.log(`🚀 Uploading to S3 bucket 'vercel' with key: ${fileName}`);
        
        await s3Client.send(new PutObjectCommand({
            Body: fileContent,
            Bucket: `vercel`,
            Key: fileName
        }));

        console.log(`✅ Successfully uploaded: ${fileName}`);

    } catch (error) {
        console.error(`❌ Error uploading ${fileName}:`, error);
    }
}