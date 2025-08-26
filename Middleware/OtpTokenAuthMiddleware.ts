import IsAuthMiddleware from "./IsAuthMiddleware";
import { Request, Response } from "express";
import ClientError from "../Error/ClientError";
import jose from "jose";
import ClientErrors from "../Error/ClientErrors";
import Session from "../Domain/Session";
import ServerError from "../Error/ServerError";

export default class OtpTokenAuthMiddleware extends IsAuthMiddleware {
  protected specificValidation = async (req: Request, res: Response): Promise<void> => {
    const authorizationJson: string | undefined = req.headers.authorization;

    if (!authorizationJson) {
      throw new ServerError(500, "Failed to run middleware - AuthTokenAuthMiddleware - specificValidation(req: Request, res: Response): Authorization header not found");
    }

    const authorization: jose.JWTVerifyResult = JSON.parse(authorizationJson);

    if (!authorization.payload.jti) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.jti": ["Not found"],
        })
      );
    }

    if (!new RegExp(/^otp|auth\-[0-9]+$/).test(authorization.payload.jti)) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.jti": ["Not valid"],
        })
      );
    }

    const sessionId: number = Number(authorization.payload.jti.split("-")[1]);

    const dbResponseSession: Session = await this.checkSession(sessionId, ["OTP_PENDING", "USER_AUTH"]);

    const userId: number = Number(authorization.payload.sub);

    if (userId !== dbResponseSession.userId) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    }
  };
}
