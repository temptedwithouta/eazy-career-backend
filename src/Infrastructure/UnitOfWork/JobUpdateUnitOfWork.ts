import RoleRepository from "../../Repository/RoleRepository";
import UserRoleRepository from "../../Repository/UserRoleRepository";
import SfiaCategoryRepository from "../../Repository/SfiaCategoryRepository";
import { Prisma } from "@prisma/client";
import JobSfiaScoreRepository from "../../Repository/JobSfiaScoreRepository";
import EmploymentTypeRepository from "../../Repository/EmploymentTypeRepository";
import JobStatusRepository from "../../Repository/JobStatusRepository";
import JobRepository from "../../Repository/JobRepository";

export default class JobUpdateUnitOfWork {
  private userRoleRepository: UserRoleRepository;

  private roleRepository: RoleRepository;

  private sfiaCategoryRepository: SfiaCategoryRepository;

  private jobSfiaScoreRepository: JobSfiaScoreRepository;

  private employmentTypeRepository: EmploymentTypeRepository;

  private jobStatusRepository: JobStatusRepository;

  private jobRepository: JobRepository;

  public constructor(tx: Prisma.TransactionClient) {
    this.userRoleRepository = new UserRoleRepository(tx);

    this.roleRepository = new RoleRepository(tx);

    this.sfiaCategoryRepository = new SfiaCategoryRepository(tx);

    this.jobSfiaScoreRepository = new JobSfiaScoreRepository(tx);

    this.employmentTypeRepository = new EmploymentTypeRepository(tx);

    this.jobStatusRepository = new JobStatusRepository(tx);

    this.jobRepository = new JobRepository(tx);
  }

  public getUserRoleRepository(): UserRoleRepository {
    return this.userRoleRepository;
  }

  public getRoleRepository(): RoleRepository {
    return this.roleRepository;
  }

  public getSfiaCategoryRepository(): SfiaCategoryRepository {
    return this.sfiaCategoryRepository;
  }

  public getJobSfiaScoreRepository(): JobSfiaScoreRepository {
    return this.jobSfiaScoreRepository;
  }

  public getEmploymentTypeRepository(): EmploymentTypeRepository {
    return this.employmentTypeRepository;
  }

  public getJobStatusRepository(): JobStatusRepository {
    return this.jobStatusRepository;
  }

  public getJobRepository(): JobRepository {
    return this.jobRepository;
  }
}
