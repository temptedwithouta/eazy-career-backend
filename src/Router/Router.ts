import Express from "express";
import { Request, Response, NextFunction, Errback } from "express";
import cors from "cors";
import dotenv from "dotenv";
import Route from "./Route";

export default class Router {
  private static route: Route;

  private constructor() {}

  public static run = () => {
    const app: Express.Application = Express();

    dotenv.config();

    app.listen(process.env.PORT ?? 3000);

    app.get("/", (req, res) => {
      res.status(200).send("Hello World");
    });

    app.use(cors());

    app.use(Express.json());

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (!req.originalUrl.startsWith(`${process.env.BASE_URL}`)) {
        res.status(404).send().end();
      }

      next();
    });

    app.set("trust proxy", 1);

    if (!Router.route) {
      Router.route = new Route();
    }

    Router.route.addAuthRoute().addJobRoute().addUserRoute().addJobApplicationRoute();

    app.use(`${process.env.BASE_URL}`, Router.route.getRouter());
  };
}

export enum RouteMethod {
  GET = "get",
  POST = "post",
}
