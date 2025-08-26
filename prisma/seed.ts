import Database from "../Config/Database";
import Db from "../Domain/Db";

const db: Db = Database.getDb();

async function main() {
  // await db.roles.createMany({
  //   data: [{ name: "Candidate" }, { name: "Recruiter" }],
  // });
  // await db.sfiaCategories.createMany({
  //   data: [{ name: "AIFL" }, { name: "DTAN" }, { name: "CLCO" }, { name: "SCTY" }, { name: "PRMG" }, { name: "ADAP" }, { name: "COMS" }, { name: "TEAM" }, { name: "WEBD" }, { name: "MOBD" }],
  // });
  // await db.sessionTypes.createMany({
  //   data: [{ name: "OTP_PENDING" }, { name: "USER_AUTH" }],
  // });
  // await db.employmentTypes.createMany({
  //   data: [{ name: "Full-time" }, { name: "Part-time" }, { name: "Contract" }, { name: "Internship" }],
  // });
  // await db.jobStatus.createMany({
  //   data: [{ name: "Open" }, { name: "Closed" }],
  // });
  // await db.jobs.createMany({
  //   data: [
  //     {
  //       title: "Frontend Developer",
  //       description: "We are looking for a skilled frontend developer to join our growing team and help build responsive web applications.",
  //       requirement: "Proficient in HTML, CSS, JavaScript, and experience with React or Vue.js. Familiar with RESTful APIs.",
  //       location: "Jakarta, Indonesia",
  //       minSalary: 5000000,
  //       maxSalary: 10000000,
  //       employmentTypeId: 1,
  //       statusId: 1,
  //       userId: 1,
  //     },
  //     {
  //       title: "Backend Engineer",
  //       description: "Join our backend team to design and develop robust APIs and microservices for our scalable platform.",
  //       requirement: "Strong knowledge of Node.js or Python. Experience with PostgreSQL and Docker is a plus.",
  //       location: "Bandung, Indonesia",
  //       minSalary: 7000000,
  //       maxSalary: 12000000,
  //       employmentTypeId: 2,
  //       statusId: 1,
  //       userId: 1,
  //     },
  //     {
  //       title: "DevOps Specialist",
  //       description: "We are seeking a DevOps specialist to manage CI/CD pipelines, infrastructure automation, and deployment processes.",
  //       requirement: "Experience with Jenkins, Git, Docker, Kubernetes, and cloud platforms like AWS or GCP.",
  //       location: "Remote",
  //       minSalary: 8000000,
  //       maxSalary: 15000000,
  //       employmentTypeId: 3,
  //       statusId: 2,
  //       userId: 1,
  //     },
  //     {
  //       title: "UI/UX Designer",
  //       description: "Looking for a creative UI/UX designer to enhance user experience and design intuitive interfaces.",
  //       requirement: "Proficient in Figma, Sketch, or Adobe XD. Strong portfolio showcasing design skills.",
  //       location: "Jakarta, Indonesia",
  //       minSalary: 6000000,
  //       maxSalary: 11000000,
  //       employmentTypeId: 1,
  //       statusId: 1,
  //       userId: 1,
  //     },
  //     {
  //       title: "Data Scientist",
  //       description: "Join our data team to analyze large datasets and build predictive models using machine learning techniques.",
  //       requirement: "Strong knowledge of Python, R, SQL, and experience with machine learning libraries like TensorFlow or PyTorch.",
  //       location: "Yogyakarta, Indonesia",
  //       minSalary: 9000000,
  //       maxSalary: 16000000,
  //       employmentTypeId: 2,
  //       statusId: 1,
  //       userId: 1,
  //     },
  //     {
  //       title: "Mobile App Developer",
  //       description: "We are looking for a mobile app developer to create engaging applications for iOS and Android platforms.",
  //       requirement: "Experience with React Native or Flutter. Familiarity with RESTful APIs and mobile app deployment processes.",
  //       location: "Bali, Indonesia",
  //       minSalary: 7000000,
  //       maxSalary: 13000000,
  //       employmentTypeId: 3,
  //       statusId: 2,
  //       userId: 1,
  //     },
  //   ],
  // });
  // await db.savedJobs.createMany({
  //   data: [
  //     { jobId: 1, userId: 2 },
  //     { jobId: 2, userId: 2 },
  //     { jobId: 3, userId: 2 },
  //     { jobId: 1, userId: 5 },
  //     { jobId: 2, userId: 5 },
  //     { jobId: 3, userId: 5 },
  //   ],
  // });
  // await db.jobApplicationStatus.createMany({
  //   data: [{ name: "Applied" }, { name: "In Review" }, { name: "Accepted" }, { name: "Rejected" }],
  // });
  // await db.jobApplications.createMany({
  //   data: [
  //     { jobId: 1, userId: 2, statusId: 1 },
  //     { jobId: 2, userId: 2, statusId: 2 },
  //     { jobId: 3, userId: 2, statusId: 3 },
  //     { jobId: 4, userId: 2, statusId: 4 },
  //     { jobId: 5, userId: 2, statusId: 1 },
  //     { jobId: 6, userId: 2, statusId: 2 },
  //     { jobId: 1, userId: 5, statusId: 1 },
  //     { jobId: 2, userId: 5, statusId: 2 },
  //     { jobId: 3, userId: 5, statusId: 3 },
  //     { jobId: 4, userId: 5, statusId: 4 },
  //     { jobId: 5, userId: 5, statusId: 1 },
  //     { jobId: 6, userId: 5, statusId: 2 },
  //   ],
  // });
  // await db.jobSfiaScores.createMany({
  //   data: [
  //     { jobId: 1, sfiaCategoryId: 1, score: 3 },
  //     { jobId: 1, sfiaCategoryId: 2, score: 4 },
  //     { jobId: 1, sfiaCategoryId: 3, score: 2 },
  //     { jobId: 1, sfiaCategoryId: 4, score: 4 },
  //     { jobId: 1, sfiaCategoryId: 5, score: 3 },
  //     { jobId: 1, sfiaCategoryId: 6, score: 2 },
  //     { jobId: 1, sfiaCategoryId: 7, score: 4 },
  //     { jobId: 1, sfiaCategoryId: 8, score: 3 },
  //     { jobId: 1, sfiaCategoryId: 9, score: 4 },
  //     { jobId: 1, sfiaCategoryId: 10, score: 3 },
  //     { jobId: 2, sfiaCategoryId: 1, score: 4 },
  //     { jobId: 2, sfiaCategoryId: 2, score: 3 },
  //     { jobId: 2, sfiaCategoryId: 3, score: 4 },
  //     { jobId: 2, sfiaCategoryId: 4, score: 3 },
  //     { jobId: 2, sfiaCategoryId: 5, score: 4 },
  //     { jobId: 2, sfiaCategoryId: 6, score: 3 },
  //     { jobId: 2, sfiaCategoryId: 7, score: 4 },
  //     { jobId: 2, sfiaCategoryId: 8, score: 3 },
  //     { jobId: 2, sfiaCategoryId: 9, score: 4 },
  //     { jobId: 2, sfiaCategoryId: 10, score: 3 },
  //     { jobId: 3, sfiaCategoryId: 1, score: 4 },
  //     { jobId: 3, sfiaCategoryId: 2, score: 4 },
  //     { jobId: 3, sfiaCategoryId: 3, score: 3 },
  //     { jobId: 3, sfiaCategoryId: 4, score: 4 },
  //     { jobId: 3, sfiaCategoryId: 5, score: 4 },
  //     { jobId: 3, sfiaCategoryId: 6, score: 3 },
  //     { jobId: 3, sfiaCategoryId: 7, score: 4 },
  //     { jobId: 3, sfiaCategoryId: 8, score: 3 },
  //     { jobId: 3, sfiaCategoryId: 9, score: 4 },
  //     { jobId: 3, sfiaCategoryId: 10, score: 3 },
  //     { jobId: 4, sfiaCategoryId: 1, score: 4 },
  //     { jobId: 4, sfiaCategoryId: 2, score: 4 },
  //     { jobId: 4, sfiaCategoryId: 3, score: 2 },
  //     { jobId: 4, sfiaCategoryId: 4, score: 4 },
  //     { jobId: 4, sfiaCategoryId: 5, score: 3 },
  //     { jobId: 4, sfiaCategoryId: 6, score: 2 },
  //     { jobId: 4, sfiaCategoryId: 7, score: 4 },
  //     { jobId: 4, sfiaCategoryId: 8, score: 3 },
  //     { jobId: 4, sfiaCategoryId: 9, score: 4 },
  //     { jobId: 4, sfiaCategoryId: 10, score: 3 },
  //     { jobId: 5, sfiaCategoryId: 1, score: 4 },
  //     { jobId: 5, sfiaCategoryId: 2, score: 3 },
  //     { jobId: 5, sfiaCategoryId: 3, score: 4 },
  //     { jobId: 5, sfiaCategoryId: 4, score: 3 },
  //     { jobId: 5, sfiaCategoryId: 5, score: 4 },
  //     { jobId: 5, sfiaCategoryId: 6, score: 3 },
  //     { jobId: 5, sfiaCategoryId: 7, score: 4 },
  //     { jobId: 5, sfiaCategoryId: 8, score: 3 },
  //     { jobId: 5, sfiaCategoryId: 9, score: 4 },
  //     { jobId: 5, sfiaCategoryId: 10, score: 3 },
  //     { jobId: 6, sfiaCategoryId: 1, score: 4 },
  //     { jobId: 6, sfiaCategoryId: 2, score: 4 },
  //     { jobId: 6, sfiaCategoryId: 3, score: 3 },
  //     { jobId: 6, sfiaCategoryId: 4, score: 4 },
  //     { jobId: 6, sfiaCategoryId: 5, score: 4 },
  //     { jobId: 6, sfiaCategoryId: 6, score: 3 },
  //     { jobId: 6, sfiaCategoryId: 7, score: 4 },
  //     { jobId: 6, sfiaCategoryId: 8, score: 3 },
  //     { jobId: 6, sfiaCategoryId: 9, score: 4 },
  //     { jobId: 6, sfiaCategoryId: 10, score: 3 },
  //   ],
  // });
  //   await db.$queryRaw`drop type if exists job_sfia_score;
  // create type job_sfia_score as (
  //   "job_id" int,
  //   "sfia_category_id" int,
  //   "score" double precision
  // );
  // drop type if exists user_sfia_score;
  // create type user_sfia_score as (
  //   "user_id" int,
  //   "sfia_category_id" int,
  //   "score" double precision
  // );
  // create or replace function is_job_recommended(jobId int, userId int)
  // returns boolean
  // as $$
  // declare
  // jobSfiaScores job_sfia_score[];
  // userSfiaScores user_sfia_score[];
  // isRecommended boolean := true;
  // jss job_sfia_score;
  // uss user_sfia_score;
  // begin
  // select array(select row("jobId", "sfiaCategoryId", "score")::job_sfia_score from "JobSfiaScores" where "jobId" = jobId) into jobSfiaScores;
  // select array(select row("userId", "sfiaCategoryId", "score")::user_sfia_score from "UserSfiaScores" where "userId" = userId) into userSfiaScores;
  // foreach jss in array jobSfiaScores loop
  // foreach uss in array userSfiaScores loop
  // if jss.sfia_category_id = uss.sfia_category_id then
  // if uss.score < jss.score then isRecommended := false;
  // end if;
  // end if;
  // end loop;
  // end loop;
  // return isRecommended;
  // end;
  // $$ language plpgsql;
  // `;
}

main();
