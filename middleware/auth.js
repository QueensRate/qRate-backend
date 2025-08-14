import jwt from "jsonwebtoken";
import UsersDAO from "../dao/UsersDAO.js";
import { Filter } from 'bad-words';

const filter = new Filter();
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecretForDev';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UsersDAO.findUserByEmail(decoded.email);
    if (!user || user.error) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
    if (!user.verified) {
      return res.status(403).json({ error: "Forbidden: Email not verified. Please verify your email to submit reviews." });
    }
    req.user = user; // Attach user to request for further use
    next();
  } catch (e) {
    console.error(`Auth middleware error: ${e}`);
    return res.status(401).json({ error: "Unauthorized: Invalid token." });
  }
};

// Combined middleware that checks both authentication and profanity
export const authWithProfanityFilter = async (req, res, next) => {
  // First, check authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UsersDAO.findUserByEmail(decoded.email);
    if (!user || user.error) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
    if (!user.verified) {
      return res.status(403).json({ error: "Forbidden: Email not verified. Please verify your email to submit reviews." });
    }
    req.user = user; // Attach user to request for further use

    // Then, check for profanity in content fields
    const { comment, review, content, text } = req.body;
    
    // Array of fields to check for profanity
    const fieldsToCheck = [
      { field: 'comment', value: comment },
      { field: 'review', value: review },
      { field: 'content', value: content },
      { field: 'text', value: text }
    ].filter(item => item.value && typeof item.value === 'string');

    // Check each field for profanity
    for (const { field, value } of fieldsToCheck) {
      if (filter.isProfane(value)) {
        return res.status(403).json({ 
          error: `Forbidden: Your ${field} contains inappropriate language. Please revise your content and try again.`,
          field: field
        });
      }
    }

    // If both auth and profanity checks pass, continue
    next();
  } catch (e) {
    console.error(`Auth middleware error: ${e}`);
    return res.status(401).json({ error: "Unauthorized: Invalid token." });
  }
};