import { Request, Response } from "express";
import OtpService from "../Service/OtpService";
import Database from "../Config/Database";
import Db from "../Domain/Db";
import UserRepository from "../Repository/UserRepository";
import OtpRepository from "../Repository/OtpRepository";
import ClientError from "../Error/ClientError";
import ServerError from "../Error/ServerError";
import Logger from "../Config/Logger";
import OtpSendRequest from "../Model/OtpSendRequest";
import OtpSendResponse from "../Model/OtpSendResponse";
import OtpVerifyRequest from "../Model/OtpVerifyRequest";
import OtpVerifyResponse from "../Model/OtpVerifyResponse";
import SessionService from "../Service/SessionService";
import SessionRepository from "../Repository/SessionRepository";
import Session from "../Domain/Session";
import TokenService from "../Service/TokenService";
import jose from "jose";
import dotenv from "dotenv";
import SessionTypeRepository from "../Repository/SessionTypeRepository";
import HttpResponse from "../Model/HttpResponse";
import Util from "../Util/Util";
import ClientErrors from "../Error/ClientErrors";

export default class OtpController {
  private otpService: OtpService;

  private sessionService: SessionService;

  private tokenService: TokenService;

  public constructor() {
    const db: Db = Database.getDb();

    const userRepository: UserRepository = new UserRepository(db);

    const otpRepository: OtpRepository = new OtpRepository(db);

    const sessionRepository: SessionRepository = new SessionRepository(db);

    const sessionTypeRepository: SessionTypeRepository = new SessionTypeRepository(db);

    this.otpService = new OtpService(userRepository, otpRepository);

    this.sessionService = new SessionService(sessionRepository, sessionTypeRepository);

    this.tokenService = new TokenService();
  }

  public send = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to send - OtpController - send(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const otpSendRequest: OtpSendRequest = {
        ...req.body,
        userId: Number(authorizationHeader.payload.sub),
      };

      const otpSendResponse: OtpSendResponse = await this.otpService.send(otpSendRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        Logger.getLogger().warn(`Client error - OtpController - send(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

        res.status(401).send().end();
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to send - OtpController - send(req: Request, res: Response) - ${req.body}: ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public verify = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to send - OtpController - send(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const otpVerifyRequest: OtpVerifyRequest = {
        ...req.body,
        userId: Number(authorizationHeader.payload.sub),
      };

      const otpVerifyResponse: OtpVerifyResponse = await this.otpService.verify(otpVerifyRequest);

      if (!authorizationHeader.payload.jti) {
        throw new ClientError(
          401,
          "Request not valid",
          new ClientErrors().setHeadersErrors({
            "headers.authorization.payload.jti": ["Not found"],
          })
        );
      }

      const tokenType: string = `${authorizationHeader.payload.jti.split("-")[0]}`;

      if (tokenType === "auth") {
        res.status(200).send().end();
      } else {
        const session: Session = await this.sessionService.create(otpVerifyResponse.otp.userId, "USER_AUTH", 60 * 24 * 60 * 60 * 1000);

        dotenv.config();

        const tokenHeader: jose.JWTHeaderParameters = {
          alg: `${process.env.JWT_ALG}`,
          typ: "JWT",
        };

        const tokenPayload: jose.JWTPayload = {
          iss: process.env.JWT_ISSUER,
          sub: String(session.userId),
          aud: process.env.JWT_AUDIENCE,
          exp: session.expiredAt.getTime() / 1000,
          nbf: Date.now() / 1000,
          iat: Date.now() / 1000,
          jti: `auth-${session.id}`,
        };

        const token: string = await this.tokenService.generateAuthToken(tokenHeader, tokenPayload);

        res.status(200).json(new HttpResponse().setData({ token })).end();
      }
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - OtpController - verify(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to verify - OtpController - verify(req: Request, res: Response) - ${req.body}: ${e}`);

        res.status(500).send().end();
      }
    }
  };
}
