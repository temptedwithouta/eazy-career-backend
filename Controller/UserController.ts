import { Request, Response } from "express";
import UserService from "../Service/UserService";
import UserRepository from "../Repository/UserRepository";
import UserRegisterRequest from "../Model/UserRegisterRequest";
import ClientError from "../Error/ClientError";
import ServerError from "../Error/ServerError";
import UserRegisterResponse from "../Model/UserRegisterResponse";
import Logger from "../Config/Logger";
import UserLoginRequest from "../Model/UserLoginRequest";
import Db from "../Domain/Db";
import Database from "../Config/Database";
import OtpRepository from "../Repository/OtpRepository";
import OtpService from "../Service/OtpService";
import OtpSendRequest from "../Model/OtpSendRequest";
import OtpSendResponse from "../Model/OtpSendResponse";
import UserLoginResponse from "../Model/UserLoginResponse";
import dotenv from "dotenv";
import jose from "jose";
import TokenService from "../Service/TokenService";
import SessionService from "../Service/SessionService";
import SessionRepository from "../Repository/SessionRepository";
import SessionTypeRepository from "../Repository/SessionTypeRepository";
import Session from "../Domain/Session";
import HttpResponse from "../Model/HttpResponse";
import UserRoleRepository from "../Repository/UserRoleRepository";
import RoleRepository from "../Repository/RoleRepository";
import UserSfiaScoreRepository from "../Repository/UserSfiaScoreRepository";
import SfiaCategoryRepository from "../Repository/SfiaCategoryRepository";
import RecruiterRepository from "../Repository/RecruiterRepository";
import UserFindByIdRequest from "../Model/UserFindByIdRequest";
import UserFindByIdResponse from "../Model/UserFindByIdResponse";
import Util from "../Util/Util";
import CompanyRepository from "../Repository/CompanyRepository";
import PositionRepository from "../Repository/PositionRepository";
import UserUpdateRequest from "../Model/UserUpdateRequest";
import UserUpdateResponse from "../Model/UserUpdateResponse";
import UserUpdatePasswordRequest from "../Model/UserUpdatePasswordRequest";
import UserUpdatePasswordResponse from "../Model/UserUpdatePasswordResponse";
import UserUpdateEmailRequest from "../Model/UserUpdateEmailRequest";
import UserUpdateEmailResponse from "../Model/UserUpdateEmailResponse";
import CandidateRepository from "../Repository/CandidateRepository";
import UserFindSfiaScoreRequest from "../Model/UserFindSfiaScoreRequest";
import UserFindSfiaScoreResponse from "../Model/UserFindSfiaScoreResponse";
import UserUpdateSfiaScoreRequest from "../Model/UserUpdateSfiaScoreRequest";
import UserUpdateSfiaScoreResponse from "../Model/UserUpdateSfiaScoreResponse";

export default class UserController {
  private userService: UserService;

  private otpService: OtpService;

  private tokenService: TokenService;

  private sessionService: SessionService;

  public constructor() {
    const db: Db = Database.getDb();

    const userRepository: UserRepository = new UserRepository(db);

    const userRoleRepository: UserRoleRepository = new UserRoleRepository(db);

    const roleRepository: RoleRepository = new RoleRepository(db);

    const userSfiaScoreRepository: UserSfiaScoreRepository = new UserSfiaScoreRepository(db);

    const sfiaCategoryRepository: SfiaCategoryRepository = new SfiaCategoryRepository(db);

    const positionRepository: PositionRepository = new PositionRepository(db);

    const companyRepository: CompanyRepository = new CompanyRepository(db);

    const otpRepository: OtpRepository = new OtpRepository(db);

    const sessionRepository: SessionRepository = new SessionRepository(db);

    const sessionTypeRepository: SessionTypeRepository = new SessionTypeRepository(db);

    const candidateRepository: CandidateRepository = new CandidateRepository(db);

    const recruiterRepository: RecruiterRepository = new RecruiterRepository(db);

    this.userService = new UserService(userRepository, userRoleRepository, roleRepository, userSfiaScoreRepository, sfiaCategoryRepository, candidateRepository, recruiterRepository, positionRepository, companyRepository);

    this.otpService = new OtpService(userRepository, otpRepository);

    this.tokenService = new TokenService();

    this.sessionService = new SessionService(sessionRepository, sessionTypeRepository);
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRegisterRequest: UserRegisterRequest = req.body;

      const userRegisterResponse: UserRegisterResponse = await this.userService.register(userRegisterRequest);

      if (!userRegisterResponse.user.id) {
        throw new ServerError(500, `Failed to create session - UserController - register(req: Request, res: Response): User id not exist`);
      }

      const otpSendRequest: OtpSendRequest = {
        userId: userRegisterResponse.user.id,
      };

      const otpSendResponse: OtpSendResponse = await this.otpService.send(otpSendRequest);

      const session: Session = await this.sessionService.create(userRegisterResponse.user.id, "OTP_PENDING", 1 * 60 * 60 * 1000);

      dotenv.config();

      const tokenHeader: jose.JWTHeaderParameters = {
        alg: `${process.env.JWT_ALG}`,
        typ: "JWT",
      };

      const tokenPayload: jose.JWTPayload = {
        iss: process.env.JWT_ISSUER,
        sub: String(userRegisterResponse.user.id),
        aud: process.env.JWT_AUDIENCE,
        exp: session.expiredAt.getTime() / 1000,
        nbf: Date.now() / 1000,
        iat: Date.now() / 1000,
        jti: `otp-${session.id}`,
      };

      const token: string = await this.tokenService.generateAuthToken(tokenHeader, tokenPayload);

      res.status(200).json(new HttpResponse().setData({ token })).end();
    } catch (e) {
      if (e instanceof ClientError) {
        res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to register - UserController - register(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const userLoginRequest: UserLoginRequest = req.body;

      const userLoginResponse: UserLoginResponse = await this.userService.login(userLoginRequest);

      if (!userLoginResponse.user.id) {
        throw new ServerError(500, `Failed to create session - UserController - login(req: Request, res: Response): User id not exist`);
      }

      const otpSendRequest: OtpSendRequest = {
        userId: userLoginResponse.user.id,
      };

      const otpSendResponse: OtpSendResponse = await this.otpService.send(otpSendRequest);

      const session: Session = await this.sessionService.create(userLoginResponse.user.id, "OTP_PENDING", 1 * 60 * 60 * 1000);

      dotenv.config();

      const tokenHeader: jose.JWTHeaderParameters = {
        alg: `${process.env.JWT_ALG}`,
        typ: "JWT",
      };

      const tokenPayload: jose.JWTPayload = {
        iss: process.env.JWT_ISSUER,
        sub: String(userLoginResponse.user.id),
        aud: process.env.JWT_AUDIENCE,
        exp: session.expiredAt.getTime() / 1000,
        nbf: Date.now() / 1000,
        iat: Date.now() / 1000,
        jti: `otp-${session.id}`,
      };

      const token: string = await this.tokenService.generateAuthToken(tokenHeader, tokenPayload);

      res.status(200).json(new HttpResponse().setData({ token })).end();
    } catch (e) {
      if (e instanceof ClientError) {
        Logger.getLogger().warn(`Client error - UserController - login(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

        res.status(401).send().end();
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to login - UserController - login(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to find by id - UserController - findById(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const userFindByIdRequest: UserFindByIdRequest = {
        id: Number(authorizationHeader.payload.sub),
      };

      const userFindByIdResponse: UserFindByIdResponse = await this.userService.findById(userFindByIdRequest);

      res
        .status(200)
        .json(
          new HttpResponse().setData({
            user: userFindByIdResponse,
          })
        )
        .end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - UserController - findById(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to find by id - UserController - findById(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public findSfiaScore = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to find sfia score - UserController - findSfiaScore(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const userFindSfiaScoreRequest: UserFindSfiaScoreRequest = {
        id: Number(authorizationHeader.payload.sub),
      };

      const userFindSfiaScoreResponse: UserFindSfiaScoreResponse = await this.userService.findSfiaScore(userFindSfiaScoreRequest);

      res
        .status(200)
        .json(
          new HttpResponse().setData({
            sfiaScores: userFindSfiaScoreResponse.sfiaScores,
          })
        )
        .end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - UserController - findSfiaScore(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to find sfia score - UserController - findSfiaScore(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to update - UserController - update(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const userUpdateRequest: UserUpdateRequest = {
        ...req.body,
        id: Number(authorizationHeader.payload.sub),
      };

      const userUpdateResponse: UserUpdateResponse = await this.userService.update(userUpdateRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - UserController - update(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to update - UserController - update(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public updateSfiaScore = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to update sfia score - UserController - updateSfiaScore(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const userUpdateSfiaScoreRequest: UserUpdateSfiaScoreRequest = {
        ...req.body,
        id: Number(authorizationHeader.payload.sub),
      };

      const userUpdateSfiaScoreResponse: UserUpdateSfiaScoreResponse = await this.userService.updateSfiaScore(userUpdateSfiaScoreRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - UserController - updateSfiaScore(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to update sfia score - UserController - updateSfiaScore(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to update password - UserController - updatePassword(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const userUpdatePasswordRequest: UserUpdatePasswordRequest = {
        ...req.body,
        id: Number(authorizationHeader.payload.sub),
      };

      const userUpdatePasswordResponse: UserUpdatePasswordResponse = await this.userService.updatePassword(userUpdatePasswordRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        Logger.getLogger().warn(`Client error - UserController - updatePassword(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

        res.status(401).send().end();
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to update password - UserController - updatePassword(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public updateEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to update email - UserController - updateEmail(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const userUpdateEmailRequest: UserUpdateEmailRequest = {
        ...req.body,
        id: Number(authorizationHeader.payload.sub),
      };

      const userUpdateEmailResponse: UserUpdateEmailResponse = await this.userService.updateEmail(userUpdateEmailRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - UserController - updateEmail(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to update email - UserController - updateEmail(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };
}
