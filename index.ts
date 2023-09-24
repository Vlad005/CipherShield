require("dotenv").config();

const { Business } = require("./utils/db");
const fs = require("fs");
const https = require("https");
const path = require("path");

import express, { Request, Response, Application } from "express";
import { Error, connect } from "mongoose";
import bcrypt from "bcrypt";
import "./utils/jwt";

import {
  generate_keys,
  encrypt_data,
  decrypt_data,
} from "./server/helpers/encrypt_helpers";
import { createToken } from "./utils/jwt";
import { IBusiness } from "./utils/db";
import { decodeToken } from "./utils/jwt";

const app: Application = express();
const port: number = 8000;

app.use(express.json());
app.use(express.static("public"));

app.get("/get_keys", (req: Request, res: Response) => {
  if ((req.query?.company_id)) {
    const id = decodeToken(req.query?.company_id.toString());

    //const id = '001';
    const private_key = generate_keys(id.id.toString());
    res.send(`Private key: ${private_key}`);
  }
});

app.get("/encrypt_data", (req: Request, res: Response) => {
  if ((req.query?.data, req.query?.company_id)) {
    // Getting public key from db should be here
    //const public_key: string = `-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAxbJL9x7YunLsRKU2+ISQdP6s5s9KeiyG7ZiZwJadgJkj/RucgsBPH4kZhqG7hipfuI/eORjSJbzlWku6QfxRVLJI20OhMoS9BlTTKK1la5fxfi0an9L7dkwJpYVr5YIhlW9q8NGjaxNkvs5w2N9IEUcY5g6qWrqTFJKd30Kq9IpehMZW6crrkUywlr9F1fRtjF1bIhxyP/IU2/H3gBw1meOrzLnHV0HCdYqqVjYh9XN5DhGB/mJgnwyXEjLuQipvd8VvGLZV7BISWYGN+T1lErKcYb7IEjPo4GC1TVA5wUhhusWmwmK0SC8/vGzJdxoh19hLT2nmT2fIdlQssGp+bQIDAQAB\n-----END RSA PUBLIC KEY-----`;
    const id = req.query?.company_id.toString();
    const pubkey = Business.findById(id).pubKey;

    const data = req.query?.data || "";
    let encrypted_data: string = '';
    if(pubkey)
      encrypted_data = encrypt_data(data.toString(), pubkey);
    else
      res.send('no such company with entered id')
    res.send(
      `Encrypted string for company ${req.query?.company_id}: ${encrypted_data}`
    );
  } else {
    res
      .status(401)
      .send(
        "Invalid query. Request should contain `data` that needs to be encrypted and `company_id`"
      );
  }
});

app.post("/decrypt_data", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  if ((req.body?.encrypted_data, req.body?.private_key)) {
    const encrypted_data = req.body?.encrypted_data || "";
    const private_key = req.body?.private_key || "";

    const data: string = decrypt_data(
      encrypted_data.toString(),
      private_key.toString()
    );
    res.send(`Original string was: ${data}`);
  } else {
    res
      .status(401)
      .send(
        "Invalid query. Request should contain `encrypted_data` that needs to be decrypted and `private_key`"
      );
  }
});


app.post("/comp_business_pswd", async (req: Request, res: Response) => {
  // find a business with a business email
  const bus = await Business.findOne({ email: req.body.email });
  console.log(bus);
  if (bus === null) {
    res
      .status(404)
      .json({ message: `Business with email ${req.body.email} not found.` });
    return;
  }
  // compare hashed and plain passwords
  if (req.body.passwd === undefined) {
    res.status(400).json({ message: "Password not specified." });
    return;
  }
  const match = await bcrypt.compare(req.body.passwd, bus.passwd);
  if (match) {
    const jwt = createToken(bus._id);
    res.status(200).json({ token: jwt });
  } else res.status(401).json({ message: "Invalid Password" });
});

app.post("/business", async (req: Request, res: Response) => {
  // hash a new password
  let hashedPswd: string | null = null;
  if (req.body.passwd != undefined) {
    hashedPswd = await bcrypt.hash(req.body.passwd, 10);
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
    .then((x: any) => {
      res.status(200).json({user: x, jwt: createToken(x._id)});
    })
    .catch((e: Error) => {
      console.log(e);
      res.status(400).json({ message: e.message });
    });
});

/*************   Front-End   ***************/

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public/html/index.html"));
});

app.get('/login', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

app.get('/signup', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public/html/Signup.html'));
});

app.get('/otp', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public/html/OTP.html'));
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
    const db = await connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.96aenru.mongodb.net/?retryWrites=true&w=majority`
    );
  });
