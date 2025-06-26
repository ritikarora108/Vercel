import express from "express";
import { Request, Response } from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import {configDotenv} from "dotenv";

console.log("🚀 Starting request handler service...");
configDotenv();

console.log("📦 Initializing S3 client...");
const s3Client = new S3Client({
    region: "auto",
    credentials: {
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
        accessKeyId: process.env.ACCESS_KEY_ID!,
    },
    endpoint: process.env.ENDPOINT!
});

console.log("✅ S3 client initialized successfully");
console.log("🔧 Setting up Express app...");

const app = express();

// Middleware for logging all requests
app.use((req: Request, res: Response, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [${timestamp}] ${req.method} ${req.url} - Host: ${req.hostname}`);
    next();
});

app.get('/*path', async (req: Request, res: Response) => {
    console.log("🔄 Processing request...");
    
    const startTime = Date.now();
    const host = req.hostname;
    let id = host.split('.')[0];
    
    console.log(`🏷️  Host: ${host}`);
    console.log(`🆔 Extracted ID: ${id}`);
    
    let filePath = req.path;
    console.log(`📁 Requested file path: ${filePath}`);
    
    const s3Key = `output/${id}/dist${filePath}`;
    console.log(`🗂️  S3 Key: ${s3Key}`);
    
    try {
        console.log("🔍 Fetching object from S3...");
        const obj = await s3Client.send(new GetObjectCommand({
            Bucket: 'vercel',
            Key: s3Key
        }));
        
        console.log("✅ S3 object retrieved successfully");
        console.log("📊 Object metadata:", {
            contentType: obj.ContentType,
            contentLength: obj.ContentLength,
            lastModified: obj.LastModified,
            etag: obj.ETag
        });

        const type = filePath.endsWith("html") ? "text/html" : 
                    filePath.endsWith('css') ? 'text/css' : 
                    filePath.endsWith('js') ? 'application/javascript' :
                    'application/octet-stream';
        
        console.log(`🎯 Content-Type: ${type}`);
        
        res.set('Content-Type', type);
        
        console.log("📤 Sending response...");
        const response = await obj.Body!.transformToByteArray();
        res.send(response);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`✅ Request completed successfully in ${duration}ms`);
        
    } catch (error) {
        console.error("❌ Error processing request:", error);
        console.error("🔍 Error details:", {
            hostname: host,
            id: id,
            filePath: filePath,
            s3Key: s3Key
        });
        
        res.status(404).send('File not found');
        console.log("📤 Sent 404 response");
    }
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: any) => {
    console.error("💥 Unhandled error:", error);
    res.status(500).send('Internal Server Error');
});

app.listen(3001, () => {
    console.log("🎉 Server is running on port 3001");
    console.log("🌐 Ready to handle requests!");
});