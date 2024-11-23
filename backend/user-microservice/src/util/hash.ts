import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    } catch (e) {
        throw { message: "Password hashing failed!" };
    }
};

// Password validation function as Has a minimum 8 Characters, Has at least one lowercase letter, Has at least one uppercase letter, Has at least one digit
export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    return passwordRegex.test(password);
};
export const validatePasswordCustomer = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);  
};
