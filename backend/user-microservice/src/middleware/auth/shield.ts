import * as fs from "fs";
import jwt from "jsonwebtoken";
import { log } from "../../util/logger";
import { findOneUserRepo } from "../../data-access/user.repo";
import { SETTINGS } from "../../constants/commons.settings";

class Shield {
  public publicKey: any;

  constructor(publicKey) {
    this.publicKey = publicKey;
  }

  public authorize(req, res, next, permissions) {
    if (permissions.some((e) => req.user.permissions.indexOf(e) > -1)) {
      next();
    } else {
      log.error("Authorization Failed");
      return res
        .status(403)
        .send({
          code: 1004,
          message: "You do not have permission to perform this action",
        });
    }
  }

  public verifyJWT(
    req,
    res,
    next,
    publicKey,
    permissions,
    token,
    role?,
    userType?
  ) {
    const key = fs.readFileSync(publicKey, "utf8");

    const decodeOptions = {
      algorithms: ["RS256"],
    };

    jwt.verify(token, key, decodeOptions, async (error, data) => {
      if (error) {
        log.error("Authentication Failed || JWT Expired");
        return res.status(403).send({
          code: 1003,
          message: "Authentication Failed || JWT Expired",
        });
      } else {
        req.user = {
          userId: data.userId,
          roleName: data.roleName,
          userType: data.userType,
          permissions: data.permissions,
        };

        const user = await findOneUserRepo({
          _id: data.userId,
          active: true,
          archived: false,
        });
        if (!user) {
          log.error("Authentication Failed - User Deleted or Deactivated");
          return res.status(403).send({
            code: 403,
            message: "Authentication Failed - User Deleted or Deactivated",
          });
        }

        if (role && req.user.roleName !== role) {
          log.error("Authentication Failed - Route Not Permitted");
          return res.status(403).send({
            code: 403,
            message: "Authentication Failed - Route Not Permitted",
          });
        }
        if (userType && userType !== req.user.userType) {
          log.error("Authentication Failed - Route Not Permitted");
          return res.status(403).send({
            code: 403,
            message: "Authentication Failed - Route Not Permitted",
          });
        }
        log.info("Jwt verified");
        if (permissions) {
          this.authorize(req, res, next, permissions);
        } else {
          next();
        }
      }
    });
  }

  public extractBearerToken(
    req,
    res,
    next,
    publicKey,
    permissions,
    authHeader,
    role?,
    userType?
  ) {
    const headerAr = authHeader.split(" ");

    if (headerAr[0] !== "Bearer") {
      log.error("Prefix Bearer is not found in authorization header");
      return res.status(401).send({
        code: 401,
        message: 'Prefix "Bearer" is not found in authorization header',
      });
    }

    const token = headerAr[1];

    if (!token || token === "null" || token === " ") {
      log.error("Bearer Token not found");
      return res
        .status(401)
        .send({ code: 401, message: "Bearer Token not found" });
    }

    this.verifyJWT(
      req,
      res,
      next,
      publicKey,
      permissions,
      token,
      role,
      userType
    );
  }

  public auth(role?, userType?) {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (typeof authHeader === "undefined") {
        log.error("Authorization header not set");
        res.status(401).send({
          code: 401,
          message: "Authorization header not set",
        });
      } else {
        this.extractBearerToken(
          req,
          res,
          next,
          this.publicKey,
          null,
          authHeader,
          role,
          userType
        );
      }
    };
  }

  public authWithPermission(permissions, role?) {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (typeof authHeader === "undefined") {
        log.error("Authorization header not set");
        return res.status(401).send({
          code: 401,
          message: "Authorization header not set",
        });
      } else {
        this.extractBearerToken(
          req,
          res,
          next,
          this.publicKey,
          permissions,
          authHeader,
          role
        );
      }
    };
  }
}

export { Shield };
