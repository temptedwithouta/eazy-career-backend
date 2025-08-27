import UserRegisterRequest from "../Model/UserRegisterRequest";
import * as validationSchema from "../Validation/ValidationSchema";
import ClientError from "../Error/ClientError";
import UserRepository from "../Repository/UserRepository";
import User from "../Domain/User";
import bcrypt from "bcrypt";
import UserRegisterResponse from "../Model/UserRegisterResponse";
import UserRole from "../Domain/UserRole";
import UserSfiaScore from "../Domain/UserSfiaScore";
import ServerError from "../Error/ServerError";
import UserLoginRequest from "../Model/UserLoginRequest";
import Role from "../Domain/Role";
import SfiaCategory from "../Domain/SfiaCategory";
import ClientErrors from "../Error/ClientErrors";
import Util from "../Util/Util";
import dotenv from "dotenv";
import UserLoginResponse from "../Model/UserLoginResponse";
import Position from "../Domain/Position";
import Company from "../Domain/Company";
import Recruiter from "../Domain/Recruiter";
import Database from "../Config/Database";
import UserRegisterUnitOfWork from "../Infrastructure/UnitOfWork/UserRegisterUnitOfWork";
import UserFindByIdRequest from "../Model/UserFindByIdRequest";
import UserRoleRepository from "../Repository/UserRoleRepository";
import RoleRepository from "../Repository/RoleRepository";
import UserSfiaScoreRepository from "../Repository/UserSfiaScoreRepository";
import SfiaCategoryRepository from "../Repository/SfiaCategoryRepository";
import RecruiterRepository from "../Repository/RecruiterRepository";
import UserFindByIdResponse from "../Model/UserFindByIdResponse";
import CompanyRepository from "../Repository/CompanyRepository";
import PositionRepository from "../Repository/PositionRepository";
import UserUpdateRequest from "../Model/UserUpdateRequest";
import { Prisma } from "@prisma/client";
import UserUpdateUnitOfWork from "../Infrastructure/UnitOfWork/UserUpdateUnitOfWork";
import UserUpdateResponse from "../Model/UserUpdateResponse";
import UserUpdatePasswordRequest from "../Model/UserUpdatePasswordRequest";
import UserUpdatePasswordResponse from "../Model/UserUpdatePasswordResponse";
import UserUpdateEmailRequest from "../Model/UserUpdateEmailRequest";
import UserUpdateEmailResponse from "../Model/UserUpdateEmailResponse";
import Candidate from "../Domain/Candidate";
import CandidateRepository from "../Repository/CandidateRepository";
import UserFindSfiaScoreRequest from "../Model/UserFindSfiaScoreRequest";
import UserFindSfiaScoreResponse from "../Model/UserFindSfiaScoreResponse";
import UserUpdateSfiaScoreRequest from "../Model/UserUpdateSfiaScoreRequest";
import UserUpdateSfiaScoreResponse from "../Model/UserUpdateSfiaScoreResponse";
import UserUpdateSfiaScoreUnitOfWork from "../Infrastructure/UnitOfWork/UserUpdateSfiaScoreUnitOfWork";

export default class UserService {
  private userRepository: UserRepository;

  private userRoleRepository: UserRoleRepository;

  private roleRepository: RoleRepository;

  private userSfiaScoreRepository: UserSfiaScoreRepository;

  private sfiaCategoryRepository: SfiaCategoryRepository;

  private candidateRepository: CandidateRepository;

  private recruiterRepository: RecruiterRepository;

  private positionRepository: PositionRepository;

  private companyRepository: CompanyRepository;

  public constructor(
    userRepository: UserRepository,
    userRoleRepository: UserRoleRepository,
    roleRepository: RoleRepository,
    userSfiaScoreRepository: UserSfiaScoreRepository,
    sfiaCategoryRepository: SfiaCategoryRepository,
    candidateRepository: CandidateRepository,
    recruiterRepository: RecruiterRepository,
    positionRepository: PositionRepository,
    companyRepository: CompanyRepository
  ) {
    this.userRepository = userRepository;

    this.userRoleRepository = userRoleRepository;

    this.roleRepository = roleRepository;

    this.userSfiaScoreRepository = userSfiaScoreRepository;

    this.sfiaCategoryRepository = sfiaCategoryRepository;

    this.candidateRepository = candidateRepository;

    this.recruiterRepository = recruiterRepository;

    this.companyRepository = companyRepository;

    this.positionRepository = positionRepository;
  }

  public register = async (userRegisterRequest: UserRegisterRequest): Promise<UserRegisterResponse> => {
    const validationResult: UserRegisterRequest = this.validateUserRegisterRequest(userRegisterRequest);

    const userRegisterResponse: UserRegisterResponse = await Database.dbTransaction(async (tx: Prisma.TransactionClient) => {
      const userRegisterUnitOfWork: UserRegisterUnitOfWork = new UserRegisterUnitOfWork(tx);

      if (await userRegisterUnitOfWork.getUserRepository().findByEmail(validationResult.email)) {
        throw new ClientError(
          400,
          "Request not valid",
          new ClientErrors().setBodyErrors({
            "body.email": ["Already exist"],
          })
        );
      }

      const dbResponseRole: Role | null = await userRegisterUnitOfWork.getRoleRepository().findByName(validationResult.role);

      if (!dbResponseRole) {
        throw new ClientError(
          400,
          "Request not valid",
          new ClientErrors().setBodyErrors({
            "body.role": ["Not valid"],
          })
        );
      }

      dotenv.config();

      const user: User = {
        name: validationResult.name,
        email: validationResult.email,
        password: await bcrypt.hash(validationResult.password, Number(process.env.SALT_ROUNDS)),
        dateOfBirth: new Date(validationResult.dateOfBirth),
        phoneNumber: validationResult.phoneNumber,
      };

      const dbResponseUser: User | null = await userRegisterUnitOfWork.getUserRepository().save(user);

      if (!dbResponseUser.id) {
        throw new ServerError(500, `Failed to save user role - UserService - register(userRegisterRequest: UserRegisterRequest): User id not found`);
      }

      const userRole: UserRole = {
        userId: dbResponseUser.id,
        roleId: dbResponseRole.id,
      };

      const dbResponseUserRole: UserRole = await userRegisterUnitOfWork.getUserRoleRepository().save(userRole);

      if (dbResponseRole.name === "Candidate") {
        if (!validationResult.sfiaScores) {
          throw new ClientError(
            400,
            "Request not valid",
            new ClientErrors().setBodyErrors({
              "body.sfiaScores": ["Not exist"],
            })
          );
        }

        const sfiaScores: UserSfiaScore[] = await Promise.all(
          Object.entries(validationResult.sfiaScores).map(async ([key, value]) => {
            const dbResponseSfiaCategory: SfiaCategory | null = await userRegisterUnitOfWork.getSfiaCategoryRepository().findByName(key);

            if (!dbResponseSfiaCategory) {
              throw new ClientError(
                400,
                "Request not valid",
                new ClientErrors().setBodyErrors({
                  [`body.sfiaScores.${key}`]: [`Property name not valid`],
                })
              );
            }

            if (!dbResponseUser.id) {
              throw new ServerError(500, `Failed to save sfia scores - UserService - register(userRegisterRequest: UserRegisterRequest): User id not found`);
            }

            return { userId: dbResponseUser.id, sfiaCategoryId: dbResponseSfiaCategory.id, score: value };
          })
        );

        const dbResponseUserSfiaScore: UserSfiaScore[] = await userRegisterUnitOfWork.getUserSfiaScoreRepository().save(sfiaScores);

        const candidate: Candidate = {
          portofolio: null,
          aboutMe: null,
          domicile: null,
          userId: dbResponseUser.id,
        };

        const dbResponseCandidate: Candidate = await userRegisterUnitOfWork.getCandidateRepository().save(candidate);

        return {
          user: dbResponseUser,
        };
      } else if (dbResponseRole.name === "Recruiter") {
        const position: Position = await (async () => {
          if (!validationResult.position) {
            throw new ClientError(
              400,
              "Request not valid",
              new ClientErrors().setBodyErrors({
                "body.position": ["Not exist"],
              })
            );
          }

          const dbResponsePositionFindByName: Position | null = await userRegisterUnitOfWork.getPositionRepository().findByName(validationResult.position);

          if (!dbResponsePositionFindByName) {
            const position: Position = {
              name: validationResult.position,
            };

            const dbResponsePositionSave: Position = await userRegisterUnitOfWork.getPositionRepository().save(position);

            return dbResponsePositionSave;
          }

          return dbResponsePositionFindByName;
        })();

        const company: Company = await (async () => {
          if (!validationResult.company) {
            throw new ClientError(
              400,
              "Request not valid",
              new ClientErrors().setBodyErrors({
                "body.company": ["Not exist"],
              })
            );
          }

          const dbResponseCompanyFindByName: Company | null = await userRegisterUnitOfWork.getCompanyRepository().findByName(validationResult.company);

          if (!dbResponseCompanyFindByName) {
            const company: Company = {
              name: validationResult.company,
            };

            const dbResponseCompanySave: Company = await userRegisterUnitOfWork.getCompanyRepository().save(company);

            return dbResponseCompanySave;
          }

          return dbResponseCompanyFindByName;
        })();

        if (!position.id) {
          throw new ServerError(500, `Failed to save recruiter - UserService - register(userRegisterRequest: UserRegisterRequest): Position id not found`);
        }

        if (!company.id) {
          throw new ServerError(500, `Failed to save recruiter - UserService - register(userRegisterRequest: UserRegisterRequest): Company id not found`);
        }

        const recruiter: Recruiter = {
          userId: dbResponseUser.id,
          positionId: position.id,
          companyId: company.id,
        };

        const dbResponseRecruiter: Recruiter = await userRegisterUnitOfWork.getRecruiterRepository().save(recruiter);

        return {
          user: dbResponseUser,
        };
      }

      throw new ServerError(500, `Failed to save sfia scores or recruiter - UserService - register(userRegisterRequest: UserRegisterRequest): Role not exist`);
    });

    return userRegisterResponse;
  };

  private validateUserRegisterRequest = (userRegisterRequest: UserRegisterRequest): UserRegisterRequest => {
    const validationResult = validationSchema.UserRegisterRequestValidationSchema.safeParse(userRegisterRequest);

    if (!validationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(validationResult.error)));
    }

    return validationResult.data;
  };

  public login = async (userLoginRequest: UserLoginRequest): Promise<UserLoginResponse> => {
    const validationResult: UserLoginRequest = this.validateUserLoginRequest(userLoginRequest);

    const dbResponseUser: User | null = await this.userRepository.findByEmail(validationResult.email);

    if (!dbResponseUser) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.email": ["Not found"],
        })
      );
    }

    if (!(await bcrypt.compare(validationResult.password, dbResponseUser.password))) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.password": ["Not match"],
        })
      );
    }

    return {
      user: dbResponseUser,
    };
  };

  private validateUserLoginRequest = (userLoginRequest: UserLoginRequest): UserLoginRequest => {
    const validationResult = validationSchema.UserLoginRequestValidationSchema.safeParse(userLoginRequest);

    if (!validationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(validationResult.error)));
    }

    return validationResult.data;
  };

  public findById = async (userFindByIdRequest: UserFindByIdRequest): Promise<UserFindByIdResponse> => {
    const validationResult: UserFindByIdRequest = this.validateUserFindByIdRequest(userFindByIdRequest);

    const dbResponseUser: User | null = await this.userRepository.findById(validationResult.id);

    if (!dbResponseUser) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    }

    const dbResponseUserRole: UserRole | null = await this.userRoleRepository.findByUserId(validationResult.id);

    if (!dbResponseUserRole) {
      throw new ServerError(500, `Failed to find by id - UserService - findById(userFindByIdRequest: UserFindByIdRequest): User role not found`);
    }

    const dbResponseRole: Role | null = await this.roleRepository.findById(dbResponseUserRole.roleId);

    if (!dbResponseRole) {
      throw new ServerError(500, `Failed to find by id - UserService - findById(userFindByIdRequest: UserFindByIdRequest): Role not found`);
    }

    if (dbResponseRole.name === "Candidate") {
      const dbResponseCandidate: Candidate | null = await this.candidateRepository.findByUserId(validationResult.id);

      if (!dbResponseCandidate) {
        throw new ServerError(500, `Failed to find by id - UserService - findById(userFindByIdRequest: UserFindByIdRequest): Candidate not found`);
      }

      return {
        name: dbResponseUser.name,
        email: dbResponseUser.email,
        dateOfBirth: dbResponseUser.dateOfBirth,
        phoneNumber: dbResponseUser.phoneNumber,
        portofolio: dbResponseCandidate.portofolio,
        aboutMe: dbResponseCandidate.aboutMe,
        domicile: dbResponseCandidate.domicile,
      };
    } else {
      const dbResponseRecruiter: Recruiter | null = await this.recruiterRepository.findByUserId(validationResult.id);

      if (!dbResponseRecruiter) {
        throw new ServerError(500, `Failed to find by id - UserService - findById(userFindByIdRequest: UserFindByIdRequest): Recruiter not found`);
      }

      const dbResponsePosition: Position | null = await this.positionRepository.findById(dbResponseRecruiter.positionId);

      if (!dbResponsePosition) {
        throw new ServerError(500, `Failed to find by id - UserService - findById(userFindByIdRequest: UserFindByIdRequest): Position not found`);
      }

      const dbResponseCompany: Company | null = await this.companyRepository.findById(dbResponseRecruiter.companyId);

      if (!dbResponseCompany) {
        throw new ServerError(500, `Failed to find by id - UserService - findById(userFindByIdRequest: UserFindByIdRequest): Recruiter not found`);
      }

      return {
        name: dbResponseUser.name,
        email: dbResponseUser.email,
        dateOfBirth: dbResponseUser.dateOfBirth,
        phoneNumber: dbResponseUser.phoneNumber,
        position: dbResponsePosition.name,
        company: dbResponseCompany.name,
      };
    }
  };

  private validateUserFindByIdRequest = (userFindByIdRequest: UserFindByIdRequest): UserFindByIdRequest => {
    const validationResult = validationSchema.UserFindByIdRequestValidationSchema.safeParse(userFindByIdRequest);

    if (!validationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    }

    return validationResult.data;
  };

  public findSfiaScore = async (userFindSfiaScoreRequest: UserFindSfiaScoreRequest): Promise<UserFindSfiaScoreResponse> => {
    const validationResult: UserFindSfiaScoreRequest = this.validateUserFindSfiaScoreRequest(userFindSfiaScoreRequest);

    const dbResponseUserRole: UserRole | null = await this.userRoleRepository.findByUserId(validationResult.id);

    if (!dbResponseUserRole) {
      throw new ServerError(500, `Failed to find sfia score - UserService - findSfiaScore(userFindSfiaScoreRequest: UserFindSfiaScoreRequest): User role not found`);
    }

    const dbResponseRole: Role | null = await this.roleRepository.findById(dbResponseUserRole.roleId);

    if (!dbResponseRole) {
      throw new ServerError(500, `Failed to find sfia score - UserService - findSfiaScore(userFindSfiaScoreRequest: UserFindSfiaScoreRequest): Role not found`);
    }

    if (dbResponseRole.name !== "Candidate") {
      throw new ClientError(
        403,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Role not have access"],
        })
      );
    }

    const dbResponseUserSfiaScore: UserSfiaScore[] = await this.userSfiaScoreRepository.findByUserId(validationResult.id);

    const sfiaScores: Record<string, number> = {};

    await Promise.all(
      dbResponseUserSfiaScore.map(async (item) => {
        const dbResponseSfiaCategory: SfiaCategory | null = await this.sfiaCategoryRepository.findById(item.sfiaCategoryId);

        if (!dbResponseSfiaCategory) {
          throw new ServerError(500, `Failed to find sfia score - UserService - findSfiaScore(userFindSfiaScoreRequest: UserFindSfiaScoreRequest): Sfia category not found`);
        }

        sfiaScores[dbResponseSfiaCategory.name] = item.score;
      })
    );

    return {
      sfiaScores: sfiaScores,
    };
  };

  private validateUserFindSfiaScoreRequest = (userFindSfiaScoreRequest: UserFindSfiaScoreRequest): UserFindSfiaScoreRequest => {
    const validationResult = validationSchema.UserFindSfiaScoreRequestValidationSchema.safeParse(userFindSfiaScoreRequest);

    if (!validationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    }

    return validationResult.data;
  };

  public update = async (userUpdateRequest: UserUpdateRequest): Promise<UserUpdateResponse> => {
    const validationResult: UserUpdateRequest = this.validateUserUpdateRequest(userUpdateRequest);

    const userUpdateResponse: UserUpdateResponse = await Database.dbTransaction(async (tx: Prisma.TransactionClient) => {
      const userUpdateUnitOfWork: UserUpdateUnitOfWork = new UserUpdateUnitOfWork(tx);

      const dbResponseUserFindById: User | null = await userUpdateUnitOfWork.getUserRepository().findById(validationResult.id);

      if (!dbResponseUserFindById) {
        throw new ClientError(
          401,
          "Request not valid",
          new ClientErrors().setHeadersErrors({
            "headers.authorization.payload.sub": ["Not valid"],
          })
        );
      }

      const user: User = {
        id: validationResult.id,
        name: validationResult.name,
        email: dbResponseUserFindById.email,
        password: dbResponseUserFindById.password,
        dateOfBirth: new Date(validationResult.dateOfBirth),
        phoneNumber: validationResult.phoneNumber,
      };

      const dbResponseUserUpdate: User = await userUpdateUnitOfWork.getUserRepository().update(user);

      const dbResponseUserRole: UserRole | null = await userUpdateUnitOfWork.getUserRoleRepository().findByUserId(validationResult.id);

      if (!dbResponseUserRole) {
        throw new ServerError(500, `Failed to update - UserService - update(userUpdateRequest: UserUpdateRequest): User role not found`);
      }

      const dbResponseRole: Role | null = await userUpdateUnitOfWork.getRoleRepository().findById(dbResponseUserRole.roleId);

      if (!dbResponseRole) {
        throw new ServerError(500, `Failed to update - UserService - update(userUpdateRequest: UserUpdateRequest): Role not found`);
      }

      if (dbResponseRole.name === "Candidate") {
        const dbResponseCandidateFindByUserId: Candidate | null = await userUpdateUnitOfWork.getCandidateRepository().findByUserId(validationResult.id);

        if (!dbResponseCandidateFindByUserId) {
          throw new ServerError(500, `Failed to update - UserService - update(userUpdateRequest: UserUpdateRequest): Candidate not found`);
        }

        const candidate: Candidate = {
          id: dbResponseCandidateFindByUserId.id,
          portofolio: validationResult.portofolio ?? dbResponseCandidateFindByUserId.portofolio,
          aboutMe: validationResult.aboutMe ?? dbResponseCandidateFindByUserId.aboutMe,
          domicile: validationResult.domicile ?? dbResponseCandidateFindByUserId.domicile,
          userId: dbResponseCandidateFindByUserId.userId,
        };

        const dbResponseCandidateUpdate: Candidate = await userUpdateUnitOfWork.getCandidateRepository().update(candidate);
      } else {
        const dbResponseRecruiterFindByUserId: Recruiter | null = await userUpdateUnitOfWork.getRecruiterRepository().findByUserId(validationResult.id);

        if (!dbResponseRecruiterFindByUserId) {
          throw new ServerError(500, `Failed to update - UserService - update(userUpdateRequest: UserUpdateRequest): Recruiter not found`);
        }

        const recruiter: Recruiter = {
          id: dbResponseRecruiterFindByUserId.id,
          userId: validationResult.id,
          positionId: dbResponseRecruiterFindByUserId.positionId,
          companyId: dbResponseRecruiterFindByUserId.companyId,
        };

        if (!validationResult.position) {
          throw new ClientError(
            400,
            "Request not valid",
            new ClientErrors().setBodyErrors({
              "body.position": ["Not found"],
            })
          );
        }

        const dbResponsePositionFindByName: Position | null = await userUpdateUnitOfWork.getPositionRepository().findByName(validationResult.position);

        if (dbResponsePositionFindByName && dbResponsePositionFindByName.id) {
          recruiter["positionId"] = dbResponsePositionFindByName.id;
        } else {
          const position: Position = {
            name: validationResult.position,
          };

          const dbResponsePositionSave: Position | null = await userUpdateUnitOfWork.getPositionRepository().save(position);

          if (!dbResponsePositionSave || !dbResponsePositionSave.id) {
            throw new ServerError(500, `Failed to update - UserService - update(userUpdateRequest: UserUpdateRequest): Failed to save new position`);
          }

          recruiter["positionId"] = dbResponsePositionSave.id;
        }

        if (!validationResult.company) {
          throw new ClientError(
            400,
            "Request not valid",
            new ClientErrors().setBodyErrors({
              "body.company": ["Not found"],
            })
          );
        }

        const dbResponseCompanyFindByName: Company | null = await userUpdateUnitOfWork.getCompanyRepository().findByName(validationResult.company);

        if (dbResponseCompanyFindByName && dbResponseCompanyFindByName.id) {
          recruiter["companyId"] = dbResponseCompanyFindByName.id;
        } else {
          const company: Company = {
            name: validationResult.company,
          };

          const dbResponseCompanySave: Company | null = await userUpdateUnitOfWork.getCompanyRepository().save(company);

          if (!dbResponseCompanySave || !dbResponseCompanySave.id) {
            throw new ServerError(500, `Failed to update - UserService - update(userUpdateRequest: UserUpdateRequest): Failed to save new company`);
          }

          recruiter["companyId"] = dbResponseCompanySave.id;
        }

        const dbResponseRecruiterUpdate: Recruiter = await userUpdateUnitOfWork.getRecruiterRepository().update(recruiter);
      }

      return {
        user: dbResponseUserUpdate,
      };
    });

    return userUpdateResponse;
  };

  private validateUserUpdateRequest = (userUpdateRequest: UserUpdateRequest): UserUpdateRequest => {
    const headersValidationResult = validationSchema.UserUpdateRequestValidationSchema.pick({ id: true }).safeParse({ id: userUpdateRequest.id });

    const bodyValidationResult = validationSchema.UserUpdateRequestValidationSchema.omit({ id: true }).safeParse(Util.deleteObjectProperty(userUpdateRequest, "id"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  public updateSfiaScore = async (userUpdateSfiaScoreRequest: UserUpdateSfiaScoreRequest): Promise<UserUpdateSfiaScoreResponse> => {
    const validationResult: UserUpdateSfiaScoreRequest = this.validateUserUpdateSfiaScoreRequest(userUpdateSfiaScoreRequest);

    const userUpdateSfiaScoreResponse: UserUpdateSfiaScoreResponse = await Database.dbTransaction(async (tx: Prisma.TransactionClient) => {
      const userUpdateSfiaScoreUnitOfWork: UserUpdateSfiaScoreUnitOfWork = new UserUpdateSfiaScoreUnitOfWork(tx);

      const dbResponseUserRole: UserRole | null = await userUpdateSfiaScoreUnitOfWork.getUserRoleRepository().findByUserId(validationResult.id);

      if (!dbResponseUserRole) {
        throw new ServerError(500, `Failed to update sfia score - UserService - updateSfiaScore(userUpdateSfiaScoreRequest: UserUpdateSfiaScoreRequest): User role not found`);
      }

      const dbResponseRole: Role | null = await userUpdateSfiaScoreUnitOfWork.getRoleRepository().findById(dbResponseUserRole.roleId);

      if (!dbResponseRole) {
        throw new ServerError(500, `Failed to update sfia score - UserService - updateSfiaScore(userUpdateSfiaScoreRequest: UserUpdateSfiaScoreRequest): Role not found`);
      }

      if (dbResponseRole.name !== "Candidate") {
        throw new ClientError(
          403,
          "Request not valid",
          new ClientErrors().setHeadersErrors({
            "headers.authorization.payload.sub": ["Role not have access"],
          })
        );
      }

      const sfiaScores: UserSfiaScore[] = await Promise.all(
        Object.entries(validationResult.sfiaScores).map(async ([key, value]) => {
          const dbResponseSfiaCategory: SfiaCategory | null = await userUpdateSfiaScoreUnitOfWork.getSfiaCategoryRepository().findByName(key);

          if (!dbResponseSfiaCategory) {
            throw new ClientError(
              400,
              "Request not valid",
              new ClientErrors().setBodyErrors({
                [`body.sfiaScores.${key}`]: [`Property name not valid`],
              })
            );
          }

          return { userId: validationResult.id, sfiaCategoryId: dbResponseSfiaCategory.id, score: value };
        })
      );

      const dbResponseUserSfiaScore: UserSfiaScore[] = await Promise.all(
        sfiaScores.map(async (item) => {
          const dbResponse: UserSfiaScore = await userUpdateSfiaScoreUnitOfWork.getUserSfiaScoreRepository().update(item);

          return dbResponse;
        })
      );

      return { sfiaScores: dbResponseUserSfiaScore };
    });

    return userUpdateSfiaScoreResponse;
  };

  private validateUserUpdateSfiaScoreRequest = (userUpdateSfiaScoreRequest: UserUpdateSfiaScoreRequest): UserUpdateSfiaScoreRequest => {
    const headersValidationResult = validationSchema.UserUpdateSfiaScoreRequestValidationSchema.pick({ id: true }).safeParse({ id: userUpdateSfiaScoreRequest.id });

    const bodyValidationResult = validationSchema.UserUpdateSfiaScoreRequestValidationSchema.omit({ id: true }).safeParse(Util.deleteObjectProperty(userUpdateSfiaScoreRequest, "id"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  public updatePassword = async (userUpdatePasswordRequest: UserUpdatePasswordRequest): Promise<UserUpdatePasswordResponse> => {
    const validationResult: UserUpdatePasswordRequest = this.validateUserUpdatePasswordRequest(userUpdatePasswordRequest);

    const dbResponseUserFindById: User | null = await this.userRepository.findById(validationResult.id);

    if (!dbResponseUserFindById) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    }

    if (!(await bcrypt.compare(validationResult.oldPassword, dbResponseUserFindById.password))) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.oldPassword": ["Not valid"],
        })
      );
    }

    dotenv.config();

    const user: User = {
      id: validationResult.id,
      name: dbResponseUserFindById.name,
      email: dbResponseUserFindById.email,
      password: await bcrypt.hash(validationResult.newPassword, Number(process.env.SALT_ROUNDS)),
      dateOfBirth: dbResponseUserFindById.dateOfBirth,
      phoneNumber: dbResponseUserFindById.phoneNumber,
    };

    const dbResponseUserUpdate: User = await this.userRepository.update(user);

    return {
      user: dbResponseUserUpdate,
    };
  };

  private validateUserUpdatePasswordRequest = (userUpdatePasswordRequest: UserUpdatePasswordRequest): UserUpdatePasswordRequest => {
    const headersValidationResult = validationSchema.UserUpdatePasswordRequestValidationSchema.pick({ id: true }).safeParse({ id: userUpdatePasswordRequest.id });

    const bodyValidationResult = validationSchema.UserUpdatePasswordRequestValidationSchema.omit({ id: true }).safeParse(Util.deleteObjectProperty(userUpdatePasswordRequest, "id"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  public updateEmail = async (userUpdateEmailRequest: UserUpdateEmailRequest): Promise<UserUpdateEmailResponse> => {
    const validationResult: UserUpdateEmailRequest = this.validateUserUpdateEmailRequest(userUpdateEmailRequest);

    const dbResponseUserFindByEmail: User | null = await this.userRepository.findByEmail(validationResult.newEmail);

    if (dbResponseUserFindByEmail) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.email": ["Already exist"],
        })
      );
    }

    const dbResponseUserFindById: User | null = await this.userRepository.findById(validationResult.id);

    if (!dbResponseUserFindById) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    }

    const user: User = {
      id: validationResult.id,
      name: dbResponseUserFindById.name,
      email: validationResult.newEmail,
      password: dbResponseUserFindById.password,
      dateOfBirth: dbResponseUserFindById.dateOfBirth,
      phoneNumber: dbResponseUserFindById.phoneNumber,
    };

    const dbResponseUserUpdate: User = await this.userRepository.update(user);

    return {
      user: dbResponseUserUpdate,
    };
  };

  private validateUserUpdateEmailRequest = (userUpdateEmailRequest: UserUpdateEmailRequest): UserUpdateEmailRequest => {
    const headersValidationResult = validationSchema.UserUpdateEmailRequestValidationSchema.pick({ id: true }).safeParse({ id: userUpdateEmailRequest.id });

    const bodyValidationResult = validationSchema.UserUpdateEmailRequestValidationSchema.omit({ id: true }).safeParse(Util.deleteObjectProperty(userUpdateEmailRequest, "id"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };
}
