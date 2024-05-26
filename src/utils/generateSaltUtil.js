import bcrypt from "bcryptjs";

async function generateSalt() {
    return await bcrypt.genSalt(10);
};

export default generateSalt;
