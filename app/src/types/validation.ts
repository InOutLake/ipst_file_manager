import Joi from "joi";
import { NewUser } from "./types";

const passwordSchema = Joi.string()
  .pattern(
    new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
  )
  .required();

const validatePassword = (password: string): void => {
  const { error } = passwordSchema.validate(password);
  if (error) {
    throw new Error("Password validation failed");
  }
};

const userSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string()
    .min(2)
    .max(255)
    .required(),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(255)
    .required(),
  password: Joi.string().required()
});

const validateUser = (user: NewUser): void => {
  const { error } = userSchema.validate(user);
  if (error) {
    throw new Error("User validation failed");
  }
};

const fileSchema = Joi.object({
  id: Joi.number(),
  userId: Joi.number().required,
  parentId: Joi.number().required,
  name: Joi.string().required()
});

export { userSchema, validateUser, validatePassword, passwordSchema };
