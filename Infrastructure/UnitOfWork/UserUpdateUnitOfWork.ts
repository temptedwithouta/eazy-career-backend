import { Prisma } from "@prisma/client";
import CompanyRepository from "../Repository/CompanyRepository";
import PositionRepository from "../Repository/PositionRepository";
import RecruiterRepository from "../Repository/RecruiterRepository";
import RoleRepository from "../Repository/RoleRepository";
import UserRepository from "../Repository/UserRepository";
import UserRoleRepository from "../Repository/UserRoleRepository";
import CandidateRepository from "../Repository/CandidateRepository";

export default class UserUpdateUnitOfWork {
  private userRepository: UserRepository;

  private userRoleRepository: UserRoleRepository;

  private roleRepository: RoleRepository;

  private positionRepository: PositionRepository;

  private companyRepository: CompanyRepository;

  private candidateRepository: CandidateRepository;

  private recruiterRepository: RecruiterRepository;

  public constructor(tx: Prisma.TransactionClient) {
    this.userRepository = new UserRepository(tx);

    this.userRoleRepository = new UserRoleRepository(tx);

    this.roleRepository = new RoleRepository(tx);

    this.positionRepository = new PositionRepository(tx);

    this.companyRepository = new CompanyRepository(tx);

    this.candidateRepository = new CandidateRepository(tx);

    this.recruiterRepository = new RecruiterRepository(tx);
  }

  public getUserRepository(): UserRepository {
    return this.userRepository;
  }

  public getUserRoleRepository(): UserRoleRepository {
    return this.userRoleRepository;
  }

  public getRoleRepository(): RoleRepository {
    return this.roleRepository;
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
