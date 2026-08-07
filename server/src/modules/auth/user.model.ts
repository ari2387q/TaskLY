import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"
//User document interface
export interface IUser extends Document {
  id: any;
  email: string;
  password: string;
  streak: number;
  lastStudyDate?: Date;
  role: "user" | "admin";
  isVerified:boolean;
  verificationTokenHash?: string;
  verificationTokenExpiry?: Date;
  authProvider: "local" | "google";
  googleId?:string;
  createdAt: Date;
  updatedAt: Date;
  generateVerificationToken():string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}


//User schema

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password:{
      type: String,
      required: function (this: IUser) {
      return this.authProvider === "local";
      },
    minlength: 6,
    select: false,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastStudyDate: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",

    },
    isVerified:{
    type:Boolean,
    default:false},
    verificationTokenHash:{
    type:String,
    select: false,},
    verificationTokenExpiry:{
      type: Date},
    authProvider:{
      type:String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
    },
  },
  { timestamps: true }
);

//Hash password before saving
 
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Compare entered password with stored hash
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.generateVerificationToken = function (): string {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  this.verificationTokenHash = hashedToken;
  this.verificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  return rawToken;
};

const User = model<IUser>("User", userSchema);
export default User;
