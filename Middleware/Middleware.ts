import { Request, Response, NextFunction } from "express";

export default interface Middleware {
  index(req: Request, res: Response, next: NextFunction): void;
}
