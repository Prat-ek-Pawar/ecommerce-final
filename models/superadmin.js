const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")
const superAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Important for security
    },
    role: {
      type: String,
      default: "superadmin",
    },
  },
  { timestamps: true }
);
superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("superAdminSchema", superAdminSchema);
