import { uploadFileService } from "../services/file.service";
import { log } from "../util/logger";

export const uploadFile = async (req, res) => {
    try {
        const fileData = await uploadFileService(req.files);
        res.send(fileData);
    } catch (e) {
        log.error(e);
        res.status(400).send(e);
    }
};
