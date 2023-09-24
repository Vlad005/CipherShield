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
  },
  passwd: { type: String, required: true },
});

export const Business = model<IBusiness>("Business", BusinessSchema);


