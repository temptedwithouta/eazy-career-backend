import UserRepository from "../Repository/UserRepository";
import RoleRepository from "../Repository/RoleRepository";
import UserRoleRepository from "../Repository/UserRoleRepository";
import SfiaCategoryRepository from "../Repository/SfiaCategoryRepository";
import UserSfiaScoreRepository from "../Repository/UserSfiaScoreRepository";
import PositionRepository from "../Repository/PositionRepository";
import CompanyRepository from "../Repository/CompanyRepository";
import RecruiterRepository from "../Repository/RecruiterRepository";
import { Prisma } from "@prisma/client";
import CandidateRepository from "../Repository/CandidateRepository";

export default class UserRegisterUnitOfWork {
  private userRepository: UserRepository;

  private roleRepository: RoleRepository;

  private userRoleRepository: UserRoleRepository;

  private sfiaCategoryRepository: SfiaCategoryRepository;

  private userSfiaScoreRepository: UserSfiaScoreRepository;

  private positionRepository: PositionRepository;

  private companyRepository: CompanyRepository;

  private candidateRepository: CandidateRepository;

  private recruiterRepository: RecruiterRepository;

  public constructor(tx: Prisma.TransactionClient) {
    this.userRepository = new UserRepository(tx);

    this.roleRepository = new RoleRepository(tx);

    this.userRoleRepository = new UserRoleRepository(tx);

    this.sfiaCategoryRepository = new SfiaCategoryRepository(tx);

    this.userSfiaScoreRepository = new UserSfiaScoreRepository(tx);

    this.positionRepository = new PositionRepository(tx);

    this.companyRepository = new CompanyRepository(tx);

    this.candidateRepository = new CandidateRepository(tx);

    this.recruiterRepository = new RecruiterRepository(tx);
  }

  public getUserRepository(): UserRepository {
    return this.userRepository;
  }

  public getRoleRepository(): RoleRepository {
    return this.roleRepository;
  }

  public getUserRoleRepository(): UserRoleRepository {
    return this.userRoleRepository;
  }

  public getSfiaCategoryRepository(): SfiaCategoryRepository {
    return this.sfiaCategoryRepository;
  }

  public getUserSfiaScoreRepository(): UserSfiaScoreRepository {
    return this.userSfiaScoreRepository;
  }

  public getPositionRepository(): PositionRepository {
    return this.positionRepository;
  }

  public getCompanyRepository(): CompanyRepository {
    return this.companyRepository;
  }

  public getCandidateRepository(): CandidateRepository {
    return this.candidateRepository;
  }

  public getRecruiterRepository(): RecruiterRepository {
    return this.recruiterRepository;
  }
}
