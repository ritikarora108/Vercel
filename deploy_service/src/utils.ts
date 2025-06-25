import { exec } from "child_process"
import path from "path";
import fs, {Dirent} from "fs";


export const buildProject = (id: string) => {
    console.log(`🔨 Starting build process for project ID: ${id}`);
    console.log(`📂 Working directory: ${path.join(__dirname, `output/${id}`)}`);
    
    return new Promise((resolve) => {
        console.log(`📦 Installing dependencies for ID: ${id}...`);
        const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`);

        child.stdout?.on('data', function(data) {
            console.log(`📤 Build stdout: ${data}`);
        });
        child.stderr?.on('data', function(data) {
            console.log(`⚠️  Build stderr: ${data}`);
        });

        child.on('close', function(code) {
            console.log(`✅ Build process completed for ID: ${id} with exit code: ${code}`);
            console.log(`🎯 Build promise resolved for ID: ${id}`);
           resolve("")
        });

    })
}

export const getAllFiles = async (localDirPath: string, filePaths: string[]) => {
    console.log(`🔍 Scanning directory: ${localDirPath}`);
    try {
        const items = await new Promise<Dirent<string>[]>((resolve, reject) => {
            fs.readdir(localDirPath, {withFileTypes: true}, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            })
        })

        console.log(`📁 Found ${items.length} items in directory: ${localDirPath}`);

        for (const item of items) {
            const localItemPath = path.join(localDirPath, item.name);

            if (item.isDirectory()) {
                console.log(`📂 Processing subdirectory: ${item.name}`);
                // Recursively call for subdirectories 
                await getAllFiles(localItemPath, filePaths);
                
            } else if (item.isFile()) {
                console.log(`📄 Found file: ${item.name}`);
                filePaths.push(localItemPath.replaceAll('\\', '/'));
            }
        }

        console.log(`✅ Directory scan completed for: ${localDirPath}`);

    } catch (err: any) {
        // Handle errors, e.g., if the directory doesn't exist or permissions are denied.
        if (err.code === 'ENOENT') {
            console.error(`❌ Error: Directory not found at "${localDirPath}"`);
        } else {
            console.error(`❌ Error accessing directory "${localDirPath}":`, err);
        }
        
    }
}