require("dotenv").config();

import { Schema, model, connect } from "mongoose";

const validateEmail = (email: string): boolean => {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

interface IBusiness {
  name: string;
  email: string;
  passwd: string;
}

const BusinessSchema = new Schema<IBusiness>({
  name: { type: String, required: true, unique: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, "Email address is required"],
    validate: [validateEmail, "Please fill a valid email address"],
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please fill a valid email address",
    // ],
  },
  passwd: { type: String, required: true },
});

const Business = model<IBusiness>("Business", BusinessSchema);

const test = async () => {
  await connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.96aenru.mongodb.net/?retryWrites=true&w=majority`
  );
  const business = new Business({
    name: "MyBusiness",
    email: "letsgo2@gmail.com",
    passwd: "12345",
  });
  await business.save();
  console.log(`saved`);
};

test().catch((err) => console.log(err.message));
