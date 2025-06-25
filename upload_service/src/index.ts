import express, { Request, Response } from "express";
import cors from "cors";
import { generateId } from "./utils";
import simpleGit from "simple-git"
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./cloudflare"
import { createClient } from "redis";

const publisher = createClient();
publisher.connect();

const app = express();
app.use(cors());
app.use(express.json());


app.post('/deploy', async (req: Request, res: Response) => {
    const repoUrl = req.body.repoUrl;
    const id = generateId();
    await simpleGit().clone(repoUrl, path.join(__dirname, `./output/${id}`));

    const filePaths: string[] = [];
    await getAllFiles(path.join(__dirname, `output/${id}`), filePaths);
    

    

    for (const filePath of filePaths) {
        const keyFilePath = filePath.substring(__dirname.length+1);
        await uploadFile(keyFilePath, filePath);
    }

    publisher.lPush('build-queue', id);

    res.json({ id });

})


app.listen(3000, () => {
    console.log(`Server is running on port: 3000`);
})


