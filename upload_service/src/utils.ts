const MAX_LEN = 5;
const subset = "1234567890qwertyuiopasdfghjklzxcvbnm"

export const generateId = () => {
    console.log("🆔 Generating unique deployment ID...");
    let id = "";
    for (let i = 0; i < MAX_LEN; i++){
        id += subset[Math.floor(Math.random() * subset.length)];
    }
    console.log(`✅ Generated deployment ID: ${id}`);
    return id;
}