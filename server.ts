require("dotenv").config();
const { Business } = require("./utils/db");
import { error } from "console";
import express, { Request, Response, Application } from "express";
import { Error, connect } from "mongoose";

const app: Application = express();
const port: number = 3001;

app.use(express.json());

app.post("/business", async (req: Request, res: Response) => {
  const business = new Business({
    name: req.body.name,
    email: req.body.email,
    passwd: req.body.passwd,
  });
  console.log(business);
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
  const db = await connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.96aenru.mongodb.net/?retryWrites=true&w=majority`
  );
});
