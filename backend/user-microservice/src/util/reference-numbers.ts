import { findLatestUserRepo } from "../data-access/user.repo";
import { SETTINGS } from "../constants/commons.settings";


export const createUserRef = async () => {
    let user: any[];
    let userNo: any;
    user = await findLatestUserRepo();
    if (user.length > 0) {
        userNo = String(Number(user[0]?.refNo?.toString().slice(2)) + 1).padStart(4, "0");
    } else {
        userNo = String(1).padStart(4, "0");
    }
    return `IA${userNo}`;
};

