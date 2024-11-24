class SETTINGS {
    public static USERS = {
        ADMIN: "ADMIN",
    };
    public static EMAIL = { 

        USER_NEW_PASSWORD_SEND: "user-new-password-send.ejs",
        PASSWORD_RESET: "password-reset.ejs",
        PASSWORD_CHANGED: "password-changed.ejs",
        USER_PASSWORD_RESET: "user-password-reset.ejs",
    };
    public static EMAIL_CONFIG = {
        username: "",
        password: "",
        host: "",
        port: 587,
    };
}

export { SETTINGS };
