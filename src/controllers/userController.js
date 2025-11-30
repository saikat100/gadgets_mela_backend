import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Required fields missing.' });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered.' });

    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered.' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
};

// Admin-only: Promote a user to admin
export const promoteToAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const updated = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User promoted to admin', user: updated });
  } catch (err) {
    next(err);
  }
};

// Admin-only: Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
};