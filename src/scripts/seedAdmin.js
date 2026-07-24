require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = await ask('Admin email: ');
  const user = await User.findOne({ universityEmail: email.toLowerCase().trim() });

  if (!user) {
    console.log('No user found with that email, register the account normally first, then run this script');
    process.exit(1);
  }

  user.role = 'admin';
  user.verificationStatus = 'verified';
  await user.save();

  console.log(`${email} is now an admin`);
  process.exit(0);
};

run();