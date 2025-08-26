import Db from "../Domain/Db";
import JobApplication from "../Domain/JobApplication";
import ServerError from "../Error/ServerError";
import { Prisma } from "@prisma/client";
import { FilterApplicant } from "../Type/Type";
import Util from "../Util/Util";
import User from "../Domain/User";

export default class JobApplicationRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByJobIdAndUserId = async (jobId: number, userId: number): Promise<JobApplication | null> => {
    try {
      const dbResponse: JobApplication | null = await this.db.jobApplications.findUnique({
        where: {
          jobId_userId: {
            jobId: jobId,
            userId: userId,
          },
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by job id and user id - JobApplicationRepository - findByJobIdAndUserId(jobId: number, userId: number): ${e}`);
    }
  };

  public save = async (jobApplication: JobApplication): Promise<JobApplication> => {
    try {
      const dbResponse: JobApplication = await this.db.jobApplications.create({
        data: jobApplication,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - JobApplicationRepository - save(jobApplication: JobApplication): ${e}`);
    }
  };

  public findByJobId = async (skip: number, take: number, jobId: number, search: string | undefined, filter: FilterApplicant): Promise<{ data: User[]; total: number }> => {
    try {
      const isSearchExist: boolean = search ? true : false;

      const isFilterExist: boolean = Util.isObjectPropertyValid(filter, true);

      const withQuery: string[] = [
        `"table_1" as (select "u".* from "Users" "u" inner join "UserRoles" "ur" on "u"."id" = "ur"."userId" inner join "Roles" "r" on "ur"."roleId" = "r"."id" where "r"."name" = 'Candidate')`,
        `"table_2" as (select "t1".*, "c"."portofolio" "portofolio", "c"."aboutMe" "aboutMe", "c"."domicile" "domicile" from "table_1" "t1" inner join "Candidates" "c" on "t1"."id" = "c"."userId")`,
        `"table_3" as (select "t2".*, (case when "ja"."userId" is null then false else true end) "isApplied", "jas"."name" "applicationStatus" from "table_2" "t2" left join (select * from "JobApplications" where "jobId" = ${jobId}) "ja" on "t2"."id" = "ja"."userId" left join "JobApplicationStatus" "jas" on "ja"."statusId" = "jas"."id")`,
        `"table_4" as (select "t3".*, public.check_sfia_compatibility(${jobId}, "t3"."id") "isRecommended" from "table_3" "t3")`,
      ];

      const mainQuery: Record<string, string[]> = {
        select: [`select "id", "name", "email", "dateOfBirth", "phoneNumber", "portofolio", "aboutMe", "domicile", "applicationStatus", "isRecommended", "isApplied" from "table_4"`, `select count("id") as total from "table_4"`],
        where: [
          `${Object.entries(filter)
            .map(([key, value]) => {
              if (value) {
                if (key === "applicationStatus") {
                  return `"applicationStatus" = '${value}'`;
                } else if (key === "applied") {
                  return `"isApplied" = ${value}`;
                } else if (key === "recommended") {
                  return `"isRecommended" = ${value}`;
                }
              }
            })
            .join(" and ")}`,
          `"name" ilike '%${search}%'`,
        ],
        orderBy: [`order by "name"`],
        pagination: [`offset ${skip} rows fetch next ${take} rows only`],
      };

      let selectQuery: string;

      let totalQuery: string;

      if (isFilterExist && isSearchExist) {
        selectQuery = Util.queryBuilder(withQuery, `${mainQuery.select[0]} where ${mainQuery.where[0]} ${isSearchExist ? `and ${mainQuery.where[1]}` : ``} ${mainQuery.orderBy[0]} ${mainQuery.pagination[0]}`);

        totalQuery = Util.queryBuilder(withQuery, `${mainQuery.select[1]} where ${mainQuery.where[0]} ${isSearchExist ? `and ${mainQuery.where[1]}` : ``} `);
      } else if (isFilterExist) {
        selectQuery = Util.queryBuilder(withQuery, `${mainQuery.select[0]} where ${mainQuery.where[0]} ${mainQuery.orderBy[0]} ${mainQuery.pagination[0]}`);

        totalQuery = Util.queryBuilder(withQuery, `${mainQuery.select[1]} where ${mainQuery.where[0]}`);
      } else if (isSearchExist) {
        selectQuery = Util.queryBuilder(withQuery, `${mainQuery.select[0]} where ${mainQuery.where[1]} ${mainQuery.orderBy[0]} ${mainQuery.pagination[0]}`);

        totalQuery = Util.queryBuilder(withQuery, `${mainQuery.select[1]} where ${mainQuery.where[1]}`);
      } else {
        selectQuery = Util.queryBuilder(withQuery, `${mainQuery.select[0]} ${mainQuery.orderBy[0]} ${mainQuery.pagination[0]}`);

        totalQuery = Util.queryBuilder(withQuery, `${mainQuery.select[1]}`);
      }

      const data = await this.db.$queryRaw<User[]>(Prisma.raw(selectQuery));

      const total = await this.db.$queryRaw<{ total: number }[]>(Prisma.raw(totalQuery));

      return {
        data: data,
        total: Number(total[0].total),
      };
    } catch (e) {
      throw new ServerError(500, `Failed to find by job id - JobApplicationRepository - findByJobId(jobId: number): ${e}`);
    }
  };

  public update = async (jobApplication: JobApplication): Promise<JobApplication> => {
    try {
      const dbResponse: JobApplication = await this.db.jobApplications.update({
        where: {
          jobId_userId: {
            jobId: jobApplication.jobId,
            userId: jobApplication.userId,
          },
        },
        data: jobApplication,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - JobApplicationRepository - update(jobApplication: JobApplication): ${e}`);
    }
  };
}
