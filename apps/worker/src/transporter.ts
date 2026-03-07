import nodemailer from "nodemailer";
import { EMAIL_AUTH, EMAIL_PASSWORD } from "./config";

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_AUTH,
    pass: EMAIL_PASSWORD,
  },
});

export default transporter;
