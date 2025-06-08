// models/User.js
import bcrypt from "bcrypt";
import { model, models, Schema } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    validate: (pass) => {
      if (!pass || pass.length < 5) {
        throw new Error("La contraseña debe tener al menos 5 caracteres.");
      }
    },
  },
  // <-- Nuevo campo:
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient",
  },
}, { timestamps: true });

// Encriptar la contraseña
UserSchema.post("validate", function (user) {
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);
});

export const User = models.User || model("User", UserSchema);
