import {S3Client, GetObjectCommand, ListObjectsCommand, PutObjectCommand} from '@aws-sdk/client-s3'
import { configDotenv } from "dotenv";
import fs from "fs";
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
configDotenv();

console.log("🌐 Initializing S3 client for Cloudflare R2...");
const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.ENDPOINT!,
    credentials: {
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
        accessKeyId: process.env.ACCESS_KEY_ID!
    }

})
console.log("✅ S3 client initialized successfully");

export const downloadS3Folder = async (prefix: string) => {
    console.log(`📥 Starting S3 folder download for prefix: ${prefix}`);
    const input = {
        Bucket: 'vercel',
        Prefix: prefix,
    };

    console.log(`🔍 Listing objects with prefix: ${prefix}`);
    const command = new ListObjectsCommand(input);
    const { Contents } = await s3Client.send(command);
    
    if (!Contents || Contents.length === 0) {
        console.log("⚠️  No files found to download.");
        return;
    }

    console.log(`📊 Found ${Contents.length} files to download`);

    // Download files concurrently with controlled concurrency
    const concurrencyLimit = 5;
    const chunks = [];
    
    for (let i = 0; i < Contents.length; i += concurrencyLimit) {
        chunks.push(Contents.slice(i, i + concurrencyLimit));
    }

    console.log(`🔄 Processing ${chunks.length} chunks with concurrency limit of ${concurrencyLimit}`);

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        console.log(`📦 Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} files`);
        
        await Promise.all(
            chunk.map(async (content) => {
                try {
                    console.log(`⬇️  Downloading: ${content.Key}`);
                    const obj = await s3Client.send(
                        new GetObjectCommand({ Bucket: 'vercel', Key: content.Key }),
                    );
                    
                    if (obj.Body) {
                        const finalOutputPath = path.join(__dirname, content.Key || "");
                        const dirName = path.dirname(finalOutputPath);

                        if (!fs.existsSync(dirName)) {
                            console.log(`📁 Creating directory: ${dirName}`);
                            fs.mkdirSync(dirName, { recursive: true });
                        }

                        // Use streams for better memory efficiency
                        if (obj.Body instanceof Readable) {
                            console.log(`💾 Writing file using stream: ${content.Key}`);
                            const writeStream = fs.createWriteStream(finalOutputPath);
                            await pipeline(obj.Body, writeStream);
                        } else {
                            // Fallback for non-stream bodies
                            console.log(`💾 Writing file using buffer: ${content.Key}`);
                            const buffer = await obj.Body.transformToByteArray();
                            fs.writeFileSync(finalOutputPath, buffer);
                        }
                        
                        console.log(`✅ Downloaded: ${content.Key}`);
                    }
                } catch (error) {
                    console.error(`❌ Error downloading ${content.Key}:`, error);
                }
            })
        );
        console.log(`✅ Completed chunk ${chunkIndex + 1}/${chunks.length}`);
    }
    
    console.log("🎉 All files downloaded successfully.\n");
}


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