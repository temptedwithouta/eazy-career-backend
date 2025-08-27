import Express from "express";
import UserController from "../Controller/UserController";
import OtpController from "../Controller/OtpController";
import OtpTokenAuthMiddleware from "../Middleware/OtpTokenAuthMiddleware";
import JwksController from "../Controller/JwksController";
import JobController from "../Controller/JobController";
import AuthTokenAuthMiddleware from "../Middleware/AuthTokenAuthMiddleware";
import JobApplicationController from "../Controller/JobApplicationController";
import SavedJobController from "../Controller/SavedJobController";
import RateLimitMiddleware from "../Infrastructure/Middleware/RateLimitMiddleware";

export default class Route {
  private router: Express.Router;

  public constructor() {
    this.router = Express.Router();
  }

  public addAuthRoute = (): Route => {
    const authRouter = Express.Router();

    const userController: UserController = new UserController();

    const otpController: OtpController = new OtpController();

    const otpTokenAuthMiddleware: OtpTokenAuthMiddleware = new OtpTokenAuthMiddleware();

    const jwksController: JwksController = new JwksController();

    authRouter.post("/register", userController.register);

    authRouter.post("/login", userController.login);

    authRouter.post("/send-otp", otpTokenAuthMiddleware.index, otpController.send);

    authRouter.post("/verify-otp", otpTokenAuthMiddleware.index, otpController.verify);

    authRouter.get("/jwks", jwksController.index);

    this.router.use("/auth", RateLimitMiddleware.authRateLimiter(), authRouter);

    return this;
  };

  public addJobRoute = (): Route => {
    const jobRouter = Express.Router();

    const jobController: JobController = new JobController();

    const jobApplicationController: JobApplicationController = new JobApplicationController();

    const savedJobController: SavedJobController = new SavedJobController();

    const authTokenAuthMiddelware: AuthTokenAuthMiddleware = new AuthTokenAuthMiddleware();

    jobRouter.get("/", authTokenAuthMiddelware.index, jobController.findAll);

    jobRouter.post("/", authTokenAuthMiddelware.index, jobController.create);

    jobRouter.delete("/", authTokenAuthMiddelware.index, jobController.delete);

    jobRouter.put("/", authTokenAuthMiddelware.index, jobController.update);

    jobRouter.post("/save", authTokenAuthMiddelware.index, jobController.save);

    jobRouter.post("/unsave", authTokenAuthMiddelware.index, jobController.unsave);

    jobRouter.post("/:id/save", authTokenAuthMiddelware.index, savedJobController.save);

    jobRouter.delete("/:id/unsave", authTokenAuthMiddelware.index, savedJobController.unsave);

    jobRouter.get("/:id", authTokenAuthMiddelware.index, jobController.findById);

    jobRouter.post("/:id/apply", authTokenAuthMiddelware.index, jobApplicationController.apply);

    this.router.use("/job", RateLimitMiddleware.jobRateLimiter(), jobRouter);

    return this;
  };

  public addUserRoute = (): Route => {
    const userRouter = Express.Router();

    const userController: UserController = new UserController();

    const authTokenAuthMiddelware: AuthTokenAuthMiddleware = new AuthTokenAuthMiddleware();

    userRouter.get("/", authTokenAuthMiddelware.index, userController.findById);

    userRouter.put("/", authTokenAuthMiddelware.index, userController.update);

    userRouter.patch("/password", authTokenAuthMiddelware.index, userController.updatePassword);

    userRouter.patch("/email", authTokenAuthMiddelware.index, userController.updateEmail);

    userRouter.get("/sfiaScore", authTokenAuthMiddelware.index, userController.findSfiaScore);

    userRouter.post("/sfiaScore", authTokenAuthMiddelware.index, userController.updateSfiaScore);

    this.router.use("/user", RateLimitMiddleware.userRateLimiter(), userRouter);

    return this;
  };

  public addJobApplicationRoute = (): Route => {
    const jobApplicationRouter = Express.Router();

    const jobApplicationController: JobApplicationController = new JobApplicationController();

    const authTokenAuthMiddelware: AuthTokenAuthMiddleware = new AuthTokenAuthMiddleware();

    jobApplicationRouter.get("/", authTokenAuthMiddelware.index, jobApplicationController.findAllApplicant);

    jobApplicationRouter.put("/", authTokenAuthMiddelware.index, jobApplicationController.update);

    this.router.use("/job-application", RateLimitMiddleware.jobApplicationRateLimiter(), jobApplicationRouter);

    return this;
  };

  public getRouter() {
    return this.router;
  }
}
