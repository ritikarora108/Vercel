// fileName => output/id123/src/App.jsx
// localFilePath => /c/Users/arora/Desktop/Dev/Harkirat/Vercel/dist/output/id123/src/App.jsx

import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"


import { configDotenv } from "dotenv"
configDotenv();


const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.ENDPOINT!,
    credentials: {
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
        accessKeyId: process.env.ACCESS_KEY_ID!
    }

})

export const uploadFile = async (fileName: string, localFilePath: string) => {
    try {
        const fileContent = await new Promise<Buffer>((resolve, reject) => {
            fs.readFile(localFilePath, (err, content) => {
                if (err) reject(err);
                else resolve(content);
            })
        })

        
        
        await s3Client.send(new PutObjectCommand({
            Body: fileContent,
            Bucket: `vercel`,
            Key: fileName
        }));


    } catch (error) {
        console.log(error);
    }
}