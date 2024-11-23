import ejs from "ejs";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import { SETTINGS } from "../constants/commons.settings";

export const sendEmailService = async (type, data, to, subject, file?) => {
    try {
        const filePath = path.join(__dirname, `../html-templates/${type}`);
        const html = fs.readFileSync(filePath, "utf8");
        const parsed = ejs.render(html, data);
        const transporter = nodemailer.createTransport({
            service: "Outlook365",
            host: SETTINGS.EMAIL_CONFIG.host,
            port: SETTINGS.EMAIL_CONFIG.port,
            secure: false,
            requireTLS: true,
            auth: {
                user: SETTINGS.EMAIL_CONFIG.username,
                pass: SETTINGS.EMAIL_CONFIG.password,
            },
        });
        const attachments = [];
        if (file) {
            attachments.push({
                filename: file.fileName,
                content: file.stream,
            });
        }
        await transporter.sendMail({
            from: SETTINGS.EMAIL_CONFIG.username,
            to, 
            subject, 
            html: parsed,
            attachments,
        });
    } catch (e) {
        throw e;
    }
};
