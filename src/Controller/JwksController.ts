import fs from "fs/promises";
import jose from "jose";
import { Request, Response } from "express";
import ServerError from "../Error/ServerError";
import Logger from "../Config/Logger";
import Util from "../Util/Util";
import HttpResponse from "../Model/HttpResponse";

export default class JwksController {
  public index = async (req: Request, res: Response): Promise<void> => {
    try {
      await Util.isFileExist(`Key/jwks.json`);

      const jwksJson: string = await fs.readFile(`${__dirname}/../Key/jwks.json`, "utf-8");

      const jwks: Jwks = JSON.parse(jwksJson);

      res.status(200).json(new HttpResponse().setData(jwks)).end();
    } catch (e) {
      if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to send - JwksController - index(req: Request, res: Response) - ${req.body}: ${e}`);

        res.status(500).send().end();
      }
    }
  };
}

interface Jwks {
  keys: jose.JWK[];
}
