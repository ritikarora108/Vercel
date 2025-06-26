// Example of simple react js app: "https://github.com/AHMED1CB/youtube-clone-client


import express, { Request, Response } from "express";
import cors from "cors";
import { generateId } from "./utils";
import simpleGit from "simple-git"
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./cloudflare"
import { createClient, RedisArgument } from "redis";

console.log("🔌 Connecting to Redis...");
const publisher = createClient();
publisher.connect();
const subscriber = createClient();
subscriber.connect();
console.log("✅ Connected to Redis...");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 Starting upload service...");

app.post('/deploy', async (req: Request, res: Response) => {
    console.log("📥 Received deployment request");
    console.log("📋 Request body:", req.body);
    
    const repoUrl = req.body.repoUrl;
    console.log(`🔗 Repository URL: ${repoUrl}`);
    
    const id = generateId();
    console.log(`🆔 Generated deployment ID: ${id}`);
    
    console.log(`📂 Cloning repository to: ${path.join(__dirname, `./output/${id}`)}`);
    await simpleGit().clone(repoUrl, path.join(__dirname, `./output/${id}`));
    console.log(`✅ Repository cloned successfully for ID: ${id}`);

    console.log(`📁 Scanning files for ID: ${id}`);
    const filePaths: string[] = [];
    await getAllFiles(path.join(__dirname, `output/${id}`), filePaths);
    console.log(`📊 Found ${filePaths.length} files to upload for ID: ${id}`);

    console.log(`⬆️  Starting file upload process for ID: ${id}`);
    for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const keyFilePath = filePath.substring(__dirname.length+1);
        console.log(`📤 Uploading file ${i + 1}/${filePaths.length}: ${keyFilePath}`);
        await uploadFile(keyFilePath, filePath);
    }
    console.log(`✅ All files uploaded for ID: ${id}`);

    console.log(`📨 Adding build request to queue for ID: ${id}`);
    publisher.lPush('build-queue', id);
    console.log(`✅ Build request queued for ID: ${id}`);
    publisher.hSet("status",id, 'uploaded');
    console.log(`Status ${id}: uploaded`);

    console.log(`🎉 Deployment request completed for ID: ${id}`);
    res.json({ id });
})


app.get('/status', async (req, res) => {
    const id = req.query.id;
    console.log(id);
    const status = await subscriber.hGet('status', id as RedisArgument);
    res.json({
        status
    })

 
})

app.listen(3000, () => {
    console.log(`🌐 Upload service is running on port: 3000`);
    console.log("📡 Ready to accept deployment requests");
})


