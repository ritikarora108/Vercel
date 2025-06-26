import { createClient } from "redis";
import { downloadS3Folder, uploadFile } from "./cloudflare";
import { buildProject, getAllFiles } from "./utils"

import path from "path"


const subscriber = createClient();
const publisher = createClient();
console.log("🔌 Connecting to Redis...");
subscriber.connect();
publisher.connect();
console.log("✅ Redis connection established");

async function main() {
    console.log("🚀 Starting deployment service...");
    while(1) {
        console.log("⏳ Waiting for build requests from queue...");
        const res = await subscriber.brPop(
            'build-queue',
            0
          );
        const id = res!.element;
        console.log(`📦 Received build request for project ID: ${id}`);
        
        console.log(`⬇️  Downloading project files from S3 for ID: ${id}`);
        await downloadS3Folder(`output/${id}`);
        console.log(`✅ Download completed for ID: ${id}`);

        console.log(`🔨 Starting build process for ID: ${id}`);
        await buildProject(id);
        console.log(`✅ Build completed for ID: ${id}`);

        console.log(`📁 Scanning built files for ID: ${id}`);
        const filePaths: string[] = [];
        await getAllFiles(path.join(__dirname, `output/${id}/dist`), filePaths);
        console.log(`📊 Found ${filePaths.length} files to upload for ID: ${id}`);

        console.log(`⬆️  Starting file upload process for ID: ${id}`);
        for (const filePath of filePaths) {
            const keyFilePath = filePath.substring(__dirname.length+1);
            console.log(`📤 Uploading: ${keyFilePath}`);
            await uploadFile(keyFilePath, filePath);
        }
        publisher.hSet('status', id, 'deployed');
        console.log(`🎉 Deployment completed successfully for ID: ${id}`);
        console.log("=".repeat(50));
    }
}
console.log(`🏃‍♂️ Deployment service is running...`);
main();