import Middleware from "./Middleware";
import { Request, Response, NextFunction } from "express";
import ClientError from "../Error/ClientError";
import Logger from "../Config/Logger";
import jose from "jose";
import Util from "../Util/Util";
import ClientErrors from "../Error/ClientErrors";
import dotenv from "dotenv";
import fs from "fs/promises";
import * as validationSchema from "../Validation/ValidationSchema";
import ServerError from "../Error/ServerError";
import Session from "../Domain/Session";
import SessionRepository from "../Repository/SessionRepository";
import Db from "../Domain/Db";
import Database from "../Config/Database";
import SessionType from "../Domain/SessionType";
import SessionTypeRepository from "../Repository/SessionTypeRepository";

export default abstract class IsAuthMiddleware implements Middleware {
  private sessionRepository: SessionRepository;

  private sessionTypeRepository: SessionTypeRepository;

  public constructor() {
    const db: Db = Database.getDb();

    this.sessionRepository = new SessionRepository(db);

    this.sessionTypeRepository = new SessionTypeRepository(db);
  }

  public index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.commonValidation(req, res);

      await this.specificValidation(req, res);

      next();
    } catch (e) {
      if (e instanceof ClientError) {
        Logger.getLogger().warn(`Client error - IsAuthMiddleware - index(req: Request, res: Response, next: NextFunction): ${e.code} - ${JSON.stringify(e.errors)}`);

        res.status(401).send().end();
      } else if (
        e instanceof jose.errors.JWTInvalid ||
        e instanceof jose.errors.JWSInvalid ||
        e instanceof jose.errors.JWTExpired ||
        e instanceof jose.errors.JWTClaimValidationFailed ||
        e instanceof jose.errors.JWSSignatureVerificationFailed ||
        e instanceof jose.errors.JOSEAlgNotAllowed
      ) {
        Logger.getLogger().warn(`Client error - IsAuthMiddleware - index(req: Request, res: Response, next: NextFunction): ${e.code} - ${JSON.stringify(e.message)}`);

        res.status(401).send().end();
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to run middleware - IsAuthMiddleware - index(req: Request, res: Response, next: NextFunction): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  private commonValidation = async (req: Request, res: Response): Promise<void> => {
    const token: string | undefined = req.get("authorization");

    if (!token) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization": ["Not valid"],
        })
      );
    }

    await Util.isFileExist(`Key/PublicKey.pem`);

    const publicPem: string = await fs.readFile(`${__dirname}/../Key/PublicKey.pem`, "utf-8");

    dotenv.config();

    const publicKey: jose.CryptoKey = await jose.importSPKI(publicPem, `${process.env.JWT_ALG}`);

    const jwt: jose.JWTVerifyResult = await jose.jwtVerify(token, publicKey);

    const validationResult = validationSchema.AuthTokenValidationSchema.safeParse(jwt);

    if (!validationResult.success) {
      throw new ClientError(401, "Request not valid", new ClientErrors().setHeadersErrors(Util.createHeadersErrors(validationResult.error)));
    }

    if (validationResult.data.protectedHeader.alg !== `${process.env.JWT_ALG}`) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.protectedHeader.alg": ["Not valid"],
        })
      );
    }

    if (validationResult.data.protectedHeader.typ !== `JWT`) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.protectedHeader.typ": ["Not valid"],
        })
      );
    }

    await Util.isFileExist(`Key/jwks.json`);

    const jwksJson: string = await fs.readFile(`${__dirname}/../Key/jwks.json`, "utf-8");

    const jwks: { keys: jose.JWK[] } = JSON.parse(jwksJson);

    if (!jwks.keys.filter((item) => item.kid === validationResult.data.protectedHeader.kid).length) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.protectedHeader.kid": ["Not valid"],
        })
      );
    }

    if (validationResult.data.payload.iss !== `${process.env.JWT_ISSUER}`) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.iss": ["Not valid"],
        })
      );
    }

    if (validationResult.data.payload.aud !== `${process.env.JWT_AUDIENCE}`) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.aud": ["Not valid"],
        })
      );
    }

    if (validationResult.data.payload.exp * 1000 < Date.now()) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.exp": ["Expired"],
        })
      );
    }

    if (validationResult.data.payload.nbf * 1000 > Date.now()) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.nbf": ["Not valid yet"],
        })
      );
    }

    req.headers.authorization = JSON.stringify(validationResult.data);
  };

  protected abstract specificValidation(req: Request, res: Response): Promise<void>;

  protected checkSession = async (id: number, sessionType: string[] | string): Promise<Session> => {
    const dbResponseSession: Session | null = await this.sessionRepository.findById(id);

    if (!dbResponseSession) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization": ["Session not found"],
        })
      );
    }

    if (dbResponseSession.expiredAt < new Date()) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization": ["Session expired"],
        })
      );
    }

    const dbResponseSessionType: SessionType | null = await this.sessionTypeRepository.findById(dbResponseSession.sessionTypeId);

    if (!dbResponseSessionType) {
      throw new ServerError(500, `Failed to check - SessionService - check(userId: number, id: number, sessionType: string): Session type not found`);
    }

    if (Array.isArray(sessionType)) {
      if (sessionType.filter((item) => item === dbResponseSessionType.name).length <= 0) {
        throw new ClientError(
          401,
          "Request not valid",
          new ClientErrors().setHeadersErrors({
            "headers.authorization": ["Session type not valid"],
          })
        );
      }
    } else {
      if (dbResponseSessionType.name !== sessionType) {
        throw new ClientError(
          401,
          "Request not valid",
          new ClientErrors().setHeadersErrors({
            "headers.authorization": ["Session type not valid"],
          })
        );
      }
    }

    return dbResponseSession;
  };
}
