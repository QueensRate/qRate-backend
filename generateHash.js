import bcrypt from 'bcrypt';

// The password to hash (use the same one you'll test with, e.g., "password123")
const plainPassword = "password123";

// Generate a salt and hash the password
bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error("Error generating hash:", err);
  } else {
    console.log("Hashed password:", hash);
  }
});