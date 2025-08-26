import Db from "../Domain/Db";
import Job from "../Domain/Job";
import ServerError from "../Error/ServerError";
import { Prisma, PrismaClient } from "@prisma/client";
import Util from "../Util/Util";
import { FilterJob } from "../Type/Type";

export default class JobRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (job: Job): Promise<Job> => {
    try {
      const dbResponse: Job = await this.db.jobs.create({
        data: job,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - JobRepository - save(job: Job): ${e}`);
    }
  };

  public findAll = async (skip: number, take: number, userId: number, role: string, search: string | undefined, filter: FilterJob): Promise<{ data: Job[]; total: number }> => {
    try {
      const isSearchExist: boolean = search ? true : false;

      const isFilterExist: boolean = Util.isObjectPropertyValid(filter, true);

      const withQuery: string[] = [
        `table_1 as (select "j".*, (case when "sj"."userId" is null then false else true end) "isSaved" from "Jobs" "j" left join (select * from "SavedJobs" "sj" where "sj"."userId" = ${userId}) "sj" on "j"."id" = "sj"."jobId")`,
        `table_2 as (select "t1".*, (case when "ja"."userId" is null then false else true end) "isApplied", (case when "ja"."userId" is null then null else "jps"."name" end) "applicationStatus" from "table_1" "t1" left join (select * from "JobApplications" "ja" where "ja"."userId" = ${userId}) "ja" on "t1"."id" = "ja"."jobId" left join "JobApplicationStatus" "jps" on "ja"."statusId" = "jps"."id")`,
        `table_3 as (select "t2".*, "u"."name" "recruiterName", "u"."email" "recruiterEmail", "u"."phoneNumber" "recruiterPhoneNumber", "c"."name" "recruiterCompany", "p"."name" "recruiterPosition" from "table_2" "t2" inner join "Users" "u" on "t2"."userId" = "u"."id" inner join "Recruiters" "r" on "u"."id" = "r"."userId" inner join "Companies" "c" on "r"."companyId" = "c"."id" inner join "Positions" "p" on "r"."positionId" = "p"."id")`,
        `table_4 as (select "t3".*, "js"."name" "status" from "table_3" "t3" inner join "JobStatus" "js" on "t3"."statusId" = "js"."id")`,
        `table_5 as (select "t4".*, "et"."name" "employmentType" from "table_4" "t4" inner join "EmploymentTypes" "et" on "t4"."employmentTypeId" = "et"."id")`,
        `table_6 as (select "t5".*, public.check_sfia_compatibility("t5"."id", ${userId}) "isRecommended" from "table_5" "t5")`,
      ];

      const mainQuery: Record<string, string[]> = {
        select: [
          `select "id", "title", "description", "requirement", "location", "minSalary", "maxSalary", "employmentType", "status", "recruiterName", "recruiterEmail", "recruiterPhoneNumber", "recruiterCompany", "recruiterPosition", "createdAt", "updatedAt", "isSaved", "isApplied", "applicationStatus", "isRecommended" from "table_6"`,
          `select "id", "title", "description", "requirement", "location", "minSalary", "maxSalary", "employmentType", "status", "createdAt", "updatedAt", "isSaved" from "table_6"`,
          `select count("id") as total from "table_6"`,
        ],
        where: [
          `${Object.entries(filter)
            .map(([key, value]) => {
              if (value) {
                if (key === "saved") {
                  return `"isSaved" = ${value}`;
                } else if (key === "applied") {
                  return `"isApplied" = ${value}`;
                } else if (key === "recommended") {
                  return `"isRecommended" = ${value}`;
                } else if (key === "status") {
                  return `"status" = '${value}'`;
                }
              }
            })
            .join(" and ")}`,
          `"userId" = ${userId}`,
          `"title" ilike '%${search}%'`,
        ],
        orderBy: [`order by "title"`],
        pagination: [`offset ${skip} rows fetch next ${take} rows only`],
      };

      let selectQuery: string;

      let totalQuery: string;

      if (isFilterExist && isSearchExist) {
        selectQuery = Util.queryBuilder(
          withQuery,
          `${role === "Recruiter" ? mainQuery.select[1] : mainQuery.select[0]} where ${role === "Recruiter" ? `${mainQuery.where[1]} and ` : ``}${mainQuery.where[0]} and ${mainQuery.where[2]} ${mainQuery.orderBy[0]} ${
            mainQuery.pagination[0]
          }`
        );

        totalQuery = Util.queryBuilder(withQuery, `${mainQuery.select[2]} where ${role === "Recruiter" ? `${mainQuery.where[1]} and ` : ``}${mainQuery.where[0]} and ${mainQuery.where[2]}`);
      } else if (isFilterExist) {
        selectQuery = Util.queryBuilder(
          withQuery,
          `${role === "Recruiter" ? mainQuery.select[1] : mainQuery.select[0]} where ${role === "Recruiter" ? `${mainQuery.where[1]} and ` : ``}${mainQuery.where[0]} ${mainQuery.orderBy[0]} ${mainQuery.pagination[0]}`
        );

        totalQuery = Util.queryBuilder(withQuery, `${mainQuery.select[2]} where ${role === "Recruiter" ? `${mainQuery.where[1]} and ` : ``}${mainQuery.where[0]}`);
      } else if (isSearchExist) {
        selectQuery = Util.queryBuilder(
          withQuery,
          `${role === "Recruiter" ? mainQuery.select[1] : mainQuery.select[0]} where ${role === "Recruiter" ? `${mainQuery.where[1]} and ` : ``}${mainQuery.where[2]} ${mainQuery.orderBy[0]} ${mainQuery.pagination[0]}`
        );

        totalQuery = Util.queryBuilder(withQuery, `${mainQuery.select[2]} where ${role === "Recruiter" ? `${mainQuery.where[1]} and ` : ``}${mainQuery.where[2]}`);
      } else {
        selectQuery = Util.queryBuilder(withQuery, `${role === "Recruiter" ? mainQuery.select[1] : mainQuery.select[0]} ${role === "Recruiter" ? `where ${mainQuery.where[1]}` : ``} ${mainQuery.orderBy[0]} ${mainQuery.pagination[0]}`);

        totalQuery = Util.queryBuilder(withQuery, `${mainQuery.select[2]} ${role === "Recruiter" ? `where ${mainQuery.where[1]}` : ``}`);
      }

      const data = await this.db.$queryRaw<Job[]>(Prisma.raw(selectQuery));

      const total = await this.db.$queryRaw<{ total: number }[]>(Prisma.raw(totalQuery));

      return {
        data: data,
        total: Number(total[0].total),
      };
    } catch (e) {
      throw new ServerError(500, `Failed to find all - JobRepository - findAll(skip: number, take: number, userId: number, role: string, search: string | undefined, filter: FilterJob): ${e}`);
    }
  };

  public findById = async (id: number): Promise<Job | null> => {
    try {
      const dbResponse: Job | null = await this.db.jobs.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - JobRepository - findById(id: number): ${e}`);
    }
  };

  public delete = async (id: number): Promise<Job> => {
    try {
      const dbResponse: Job = await this.db.jobs.delete({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to delete - JobRepository - delete(id: number): ${e}`);
    }
  };

  public update = async (job: Job): Promise<Job> => {
    try {
      const dbResponse: Job = await this.db.jobs.update({
        where: {
          id: job.id,
        },
        data: job,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - JobRepository - update(job: Job): ${e}`);
    }
  };
}
