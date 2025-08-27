import { Prisma } from "@prisma/client";
import UserSfiaScoreRepository from "../../Repository/UserSfiaScoreRepository";
import UserRoleRepository from "../../Repository/UserRoleRepository";
import RoleRepository from "../../Repository/RoleRepository";
import SfiaCategoryRepository from "../../Repository/SfiaCategoryRepository";

export default class UserUpdateSfiaScoreUnitOfWork {
  private userRoleRepository: UserRoleRepository;

  private roleRepository: RoleRepository;

  private sfiaCategoryRepository: SfiaCategoryRepository;

  private userSfiaScoreRepository: UserSfiaScoreRepository;

  public constructor(tx: Prisma.TransactionClient) {
    this.userRoleRepository = new UserRoleRepository(tx);

    this.roleRepository = new RoleRepository(tx);

    this.sfiaCategoryRepository = new SfiaCategoryRepository(tx);

    this.userSfiaScoreRepository = new UserSfiaScoreRepository(tx);
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

  public getUserSfiaScoreRepository(): UserSfiaScoreRepository {
    return this.userSfiaScoreRepository;
  }
}
