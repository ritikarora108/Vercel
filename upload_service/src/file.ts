import fs, { Dirent } from "fs";
import path from "path";

export const getAllFiles = async (localDirPath: string, filePaths: string[]) => {
    try {
        const items = await new Promise<Dirent<string>[]>((resolve, reject) => {
            fs.readdir(localDirPath, {withFileTypes: true}, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            })
        })

        for (const item of items) {
            const localItemPath = path.join(localDirPath, item.name);

            if (item.isDirectory()) {
                // Recursively call for subdirectories 
                await getAllFiles(localItemPath, filePaths);
                
            } else if (item.isFile()) {
                filePaths.push(localItemPath.replaceAll('\\', '/'));
            }
        }


    } catch (err: any) {
        // Handle errors, e.g., if the directory doesn't exist or permissions are denied.
        if (err.code === 'ENOENT') {
            console.error(`Error: Directory not found at "${localDirPath}"`);
        } else {
            console.error(`Error accessing directory "${localDirPath}":`, err);
        }
        
    }
}