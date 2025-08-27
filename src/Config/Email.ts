import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ServerError from "../Error/ServerError";

export default class Email {
  private static transporter: nodemailer.Transporter;

  public static getTransporter = (): nodemailer.Transporter => {
    if (!Email.transporter) {
      dotenv.config();

      Email.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.EMAIL}`,
          pass: `${process.env.EMAIL_APP_PASSWORD}`,
        },
      });
    }

    Email.transporter.verify((err, success) => {
      if (err) {
        throw new ServerError(500, `Failed to create email transport: ${err}`);
      }
    });

    return Email.transporter;
  };

  public static send = async (message: nodemailer.SendMailOptions) => {
    const transporter: nodemailer.Transporter = Email.getTransporter();

    try {
      await transporter.sendMail(message);
    } catch (e) {
      throw new ServerError(500, `Failed to send otp ${message.to ? `to ${message.to.toString()} ${message.cc ? `and cc to ${message.cc.toString()}` : ``}` : ``}: ${e}`);
    }
  };
}
