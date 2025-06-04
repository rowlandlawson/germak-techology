import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  password: String,
  displayName: String,
  // You can add more admin-specific fields here, like roles, permissions etc.
});

adminSchema.plugin(passportLocalMongoose);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
