require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/users');

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required');
  }

  await mongoose.connect(MONGO_URI);

  const existingUser = await User.findOne({ email: ADMIN_EMAIL });
  if (existingUser) {
    existingUser.name = ADMIN_NAME;
    existingUser.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    existingUser.role = 'admin';
    await existingUser.save();
    console.log(`Updated admin account: ${ADMIN_EMAIL}`);
    return;
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: await bcrypt.hash(ADMIN_PASSWORD, 10),
    role: 'admin'
  });

  console.log(`Created admin account: ${ADMIN_EMAIL}`);
}

createAdmin()
  .catch(function(err) {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async function() {
    await mongoose.disconnect();
  });
