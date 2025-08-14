import mongodb from "mongodb";
import bcrypt from "bcrypt";

const ObjectId = mongodb.ObjectId;
let users;

export default class UsersDAO {
  static async injectDB(conn) {
    if (users) {
      return;
    }
    try {
      users = await conn.db("qrate").collection("users");
    } catch (e) {
      console.error(`Unable to establish collection handles in UsersDAO: ${e}`);
    }
  }

  static async findUserByEmail(email) {
    try {
      return await users.findOne({ email: email });
    } catch (e) {
      console.error(`Unable to find user by email: ${e}`);
      return { error: e };
    }
  }

  static async addUser(email, password, verificationToken, verificationTokenExpires) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userDoc = {
        email: email,
        password: hashedPassword,
        verified: false,
        verificationToken,
        verificationTokenExpires,
      };
      return await users.insertOne(userDoc);
    } catch (e) {
      console.error(`Unable to add user: ${e}`);
      return { error: e };
    }
  }

  static async verifyUser(token) {
    try {
      const user = await users.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      });
      if (!user) {
        return { error: 'Invalid or expired token' };
      }
      await users.updateOne(
        { _id: user._id },
        { $set: { verified: true }, $unset: { verificationToken: "", verificationTokenExpires: "" } }
      );
      return { success: true, user };
    } catch (e) {
      console.error(`Unable to verify user: ${e}`);
      return { error: e };
    }
  }
}