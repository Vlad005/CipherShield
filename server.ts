require("dotenv").config();
const { Business } = require("./utils/db");
import express, { Request, Response, Application } from "express";
import { Error, connect } from "mongoose";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";

const app: Application = express();
const port: number = 3001;

app.use(express.json());

app.post("/send_otp", async (req: Request, res: Response) => {
  if (req.body.email === undefined) {
    res.status(400).json({ message: "Email required." });
    return;
  }
  var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let otp = otpGenerator.generate(6, {});

  const mailOpts = {
    from: process.env.EMAIL_USER,
    to: req.body.email,
    subject: "Login OTP",
    text: `Here goes your OTP: ${otp}`,
  };
  const mailRes = await transporter.sendMail(mailOpts);
  console.log("Email sent:");
  console.log(mailRes);
  res.status(200).json({ otp: otp });
});

app.post("/comp_business_pswd", async (req: Request, res: Response) => {
  // find a business with a business name
  const bus = await Business.findOne({ name: req.body.name });
  console.log(bus);
  if (bus === null) {
    res
      .status(404)
      .json({ message: `Business with name ${req.body.name} not found.` });
    return;
  }
  // compare hashed and plain passwords
  if (req.body.passwd === undefined) {
    res.status(400).json({ message: "Password not specified." });
    return;
  }
  const match = await bcrypt.compare(req.body.passwd, bus.passwd);
  res.status(200).json({ match: match });
});

app.post("/business", async (req: Request, res: Response) => {
  // hash a new password
  let hashedPswd: string | null = null;
  if (req.body.passwd != undefined) {
    const hashedPswd = await bcrypt.hash(req.body.passwd, 10);
    console.log(hashedPswd);
  }
  // create a doc
  const business = new Business({
    name: req.body.name,
    email: req.body.email,
    passwd: hashedPswd,
  });
  console.log(business);
  // save the doc
  business
    .save()
    .then((x: Object) => {
      res.status(200).json(x);
    })
    .catch((e: Error) => {
      console.log(e);
      res.status(400).json({ message: e.message });
    });
});

app.listen(port, async () => {
  console.log(`express server listening on port ${port}...`);
  const db = await  connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.96aenru.mongodb.net/?retryWrites=true&w=majority`
  );
});
