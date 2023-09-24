require("dotenv").config();

import { Schema, model, connect } from "mongoose";

interface IBusiness {
  name: string;
  email: string;
  passwd: string;
}

const BusinessSchema = new Schema<IBusiness>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwd: { type: String, required: true },
});

const Business = model<IBusiness>("Business", BusinessSchema);

const test = async () => {
  await connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.96aenru.mongodb.net/?retryWrites=true&w=majority`
  );
  const business = new Business({
    name: "MyBusiness",
    email: "letsgo@gmail.com",
    passwd: "12345",
  });
  await business.save();
  console.log(`saved`);
};

test().catch((err) => console.log(err));
