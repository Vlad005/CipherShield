require("dotenv").config();

const { Business } = require("./utils/db");
const fs = require("fs");
const https = require("https");
const path = require('path')

import express, { Request, Response , Application } from 'express';
import nodemailer from "nodemailer";
import { Error, connect } from "mongoose";
import bcrypt from "bcrypt";

import { generate_keys, encrypt_data, decrypt_data } from './server/helpers/encrypt_helpers';

const app: Application = express();
const port: number = 8000;

app.use(express.json())
app.use(express.static('public'))

app.get('/get_keys', (req: Request, res: Response) => {
  const private_key = generate_keys(1);
  res.send(`Private key: ${private_key}`);
});

app.get('/encrypt_data', (req: Request, res: Response) => {
  if(req.query?.data, req.query?.company_id){
      // Getting public key from db should be here
    const public_key: string = `-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAxbJL9x7YunLsRKU2+ISQdP6s5s9KeiyG7ZiZwJadgJkj/RucgsBPH4kZhqG7hipfuI/eORjSJbzlWku6QfxRVLJI20OhMoS9BlTTKK1la5fxfi0an9L7dkwJpYVr5YIhlW9q8NGjaxNkvs5w2N9IEUcY5g6qWrqTFJKd30Kq9IpehMZW6crrkUywlr9F1fRtjF1bIhxyP/IU2/H3gBw1meOrzLnHV0HCdYqqVjYh9XN5DhGB/mJgnwyXEjLuQipvd8VvGLZV7BISWYGN+T1lErKcYb7IEjPo4GC1TVA5wUhhusWmwmK0SC8/vGzJdxoh19hLT2nmT2fIdlQssGp+bQIDAQAB\n-----END RSA PUBLIC KEY-----`;

    const data = req.query?.data || '';
    const encrypted_data: string = encrypt_data(data.toString(), public_key);
    res.send(`Encrypted string for company ${req.query?.company_id}: ${encrypted_data}`);
  }
  else{
    res.status(401).send('Invalid query. Request should contain `data` that needs to be encrypted and `company_id`');
  }
});

app.post('/decrypt_data', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  if(req.body?.encrypted_data, req.body?.private_key){
    const encrypted_data = req.body?.encrypted_data || '';
    const private_key = req.body?.private_key || '';

    const data: string = decrypt_data(encrypted_data.toString(), private_key.toString());
    res.send(`Original string was: ${data}`);
  }
  else{
    res.status(401).send('Invalid query. Request should contain `encrypted_data` that needs to be decrypted and `private_key`');
  }
});

app.post("/send_otp", async (req: Request, res: Response) => {
  var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOpts = {
    from: process.env.EMAIL_USER,
    to: "capssyt@gmail.com",
    subject: "OTP",
    text: "here goes your OTP",
  };
  const mailRes = await transporter.sendMail(mailOpts);
  console.log("Email sent:");
  console.log(mailRes);
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


/*************   Front-End   ***************/

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

https
  .createServer(
    {
      key: fs.readFileSync("SSL/server.key"),
      cert: fs.readFileSync("SSL/server.cert"),
    },
    app
  )
  .listen(3000, async () => {
    console.log("Server running on https://localhost:3000/");
    // const db = await connect(
    //   `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.96aenru.mongodb.net/?retryWrites=true&w=majority`
    // );
  });