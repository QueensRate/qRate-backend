import express from 'express';
const router = express.Router();
const users = [{ email: 'test@queensu.ca', password: 'password123' }];
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  if (!email.endsWith('@queensu.ca')) return res.status(400).json({ error: 'Please use a valid @queensu.ca email address.' });
  const user = users.find(u => u.email === email && u.password === password);
  return user ? res.status(200).json({ message: 'Login successful', user: { email: user.email } }) : res.status(401).json({ error: 'Invalid email or password.' });
});
export default router;