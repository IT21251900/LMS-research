import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { SETTINGS } from "../constants/commons.settings";
import { getExtension } from "../util/files";

const credentials = {
    accessKeyId: SETTINGS.AWS.accessKeyId,
    secretAccessKey: SETTINGS.AWS.secretAccessKey,
};

const s3 = new S3Client({ region: SETTINGS.AWS.region, credentials });

export const uploadFileService = async (data) => {
    if (!data || Object.keys(data).length === 0) {
        throw { message: "No files were uploaded." };
    }
    const { file, files } = data;

    if (file) {
        return await upload(file);
    } else if (files) {
        const uploadedFilesList = [];
        if (_.isArray(files)) {
            for (const singleFile of files) {
                const data = await upload(singleFile);
                uploadedFilesList.push(data);
            }
        } else {
            const data = await upload(files);
            uploadedFilesList.push(data);
        }
        return uploadedFilesList;
    }
};

const upload = async (file) => {
    const extension = getExtension(file.mimetype);
    const fileName = `${uuidv4()}${extension}`;
    const command = new PutObjectCommand({
        Bucket: SETTINGS.AWS.bucketName,
        Key: `${SETTINGS.AWS.folder}/${fileName}`, // File name you want to save as in S3
        Body: file.data,
        ContentType: file.mimetype,
        ACL: "public-read",
    });
    try {
        const data: any = await s3.send(command);
        return {
            uid: data.ETag,
            name: fileName,
            status: "done",
            url: `${SETTINGS.AWS.baseUrl}/${SETTINGS.AWS.folder}/${fileName}`,
        };
    } catch (e) {
        throw e;
    }
};
