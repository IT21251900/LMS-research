import { getWelcomeMessage } from "../controllers";
import { userAuthRouter } from "./user.auth.route";
import { permissionRouter } from "./permission.routes";
import { roleRouter } from "./role.routes";

export const routes = (app) => {
    app.get("/", getWelcomeMessage);
    app.use("/user", userAuthRouter);
    app.use("/roles", roleRouter);
    app.use("/permission", permissionRouter);
};
