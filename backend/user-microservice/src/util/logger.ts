import bunyan from "bunyan";

export const log = bunyan.createLogger({
    name: "lms-user-backend",
});
