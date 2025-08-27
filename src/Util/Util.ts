import z from "zod";
import fs from "fs/promises";
import ServerError from "../Error/ServerError";
import { PrismaClient } from "@prisma/client";

export default class Util {
  public static createBodyErrors = (zodError?: z.ZodError): Record<string, string[]> => {
    const bodyErrors: Record<string, string[]> = {};

    if (!zodError) {
      return bodyErrors;
    }

    for (const issue of zodError.issues) {
      if (!issue.path.length) {
        if (!bodyErrors["body"]) {
          bodyErrors["body"] = [];
        }

        bodyErrors["body"].push(issue.message);
      } else {
        const path: string = issue.path.join(".");

        if (!bodyErrors[path]) {
          bodyErrors[`body.${path}`] = [];
        }

        bodyErrors[`body.${path}`].push(issue.message);
      }
    }

    return bodyErrors;
  };

  public static createHeadersErrors = (zodError?: z.ZodError): Record<string, string[]> => {
    const headersErrors: Record<string, string[]> = {};

    if (!zodError) {
      return headersErrors;
    }

    for (const issue of zodError.issues) {
      if (!issue.path.length) {
        if (!headersErrors["headers.authorization"]) {
          headersErrors["headers.authorization"] = [];
        }

        headersErrors["headers.authorization"].push(issue.message);
      } else {
        const path: string = issue.path.join(".");

        if (!headersErrors[`headers.authorization.${path}`]) {
          headersErrors[`headers.authorization.${path}`] = [];
        }

        headersErrors[`headers.authorization.${path}`].push(issue.message);
      }
    }

    return headersErrors;
  };

  public static createQueryParamsErrors = (zodError?: z.ZodError): Record<string, string[]> => {
    const queryParamsErrors: Record<string, string[]> = {};

    if (!zodError) {
      return queryParamsErrors;
    }

    for (const issue of zodError.issues) {
      if (!issue.path.length) {
        if (!queryParamsErrors["queryParams"]) {
          queryParamsErrors["queryParams"] = [];
        }

        queryParamsErrors["queryParams"].push(issue.message);
      } else {
        const path: string = issue.path.join(".");

        if (!queryParamsErrors[`queryParams.${path}`]) {
          queryParamsErrors[`queryParams.${path}`] = [];
        }

        queryParamsErrors[`queryParams.${path}`].push(issue.message);
      }
    }

    return queryParamsErrors;
  };

  public static createRoutePathErrors = (zodError?: z.ZodError): Record<string, string[]> => {
    const routePathErrors: Record<string, string[]> = {};

    if (!zodError) {
      return routePathErrors;
    }

    for (const issue of zodError.issues) {
      if (!issue.path.length) {
        if (!routePathErrors["routePath"]) {
          routePathErrors["routePath"] = [];
        }

        routePathErrors["routePath"].push(issue.message);
      } else {
        const path: string = issue.path.join(".");

        if (!routePathErrors[`routePath.${path}`]) {
          routePathErrors[`routePath.${path}`] = [];
        }

        routePathErrors[`routePath.${path}`].push(issue.message);
      }
    }

    return routePathErrors;
  };

  public static generateOtp = (length: number): string => {
    const numbers: string = "0123456789";

    const otp: string[] = [];

    for (let i = 0; i < length; i++) {
      otp[i] = numbers[Math.floor(Math.random() * numbers.length)];
    }

    return otp.join("");
  };

  public static formatHtml = (
    html: string,
    data: {
      [key: string]: string;
    }
  ): string => {
    let formattedHtml = html;

    Object.entries(data).map(([key, value]) => {
      if (formattedHtml.includes(`:${key}`)) {
        formattedHtml = formattedHtml.replaceAll(`:${key}`, value);
      }
    });

    return formattedHtml;
  };

  public static isFileExist = async (path: string): Promise<void> => {
    try {
      await fs.access(`${__dirname}/../${path}`);
    } catch (e) {
      throw new ServerError(500, `Failed to access file - ${path}: ${e}`);
    }
  };

  public static queryBuilder = (withQuery: string[], mainQuery: string) => {
    const query: string = `with ${withQuery.toString()} ${mainQuery}`;

    return query;
  };

  public static isPrismaClient = (obj: any): obj is PrismaClient => {
    return obj instanceof PrismaClient;
  };

  public static isObjectEmpty = (obj: object): boolean => {
    return Object.keys(obj).length > 0 ? false : true;
  };

  public static deleteObjectProperty = (obj: { [key: string]: any }, property: string): Object => {
    if (obj.hasOwnProperty(property)) {
      delete obj[property];
    }

    return obj;
  };

  public static isObjectPropertyValid = (obj: { [key: string]: any }, deleteInvalidProperty: boolean): boolean => {
    let isValid = false;

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        isValid = true;
      } else {
        if (deleteInvalidProperty) {
          delete obj[key];
        }
      }
    }

    return isValid;
  };
}
