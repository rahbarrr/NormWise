/**
 * User Repository
 * Database access layer for users table
 */
import prisma from "../config/db.js";

export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

export const createUserRecord = async (data) => {
  return await prisma.user.create({
    data,
  });
};
