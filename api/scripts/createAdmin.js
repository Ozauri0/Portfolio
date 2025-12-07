const mongoose = require('mongoose');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const connectDB = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('\n=== Crear Usuario Administrador ===\n');
    
    const email = await question('Email del administrador: ');
    const password = await question('Contraseña: ');
    const fullName = await question('Nombre completo (opcional): ');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('\n❌ Ya existe un usuario con ese email.');
      process.exit(1);
    }
    
    // Create admin user
    const adminUser = await User.create({
      email,
      password,
      fullName: fullName || null,
      role: 'admin'
    });
    
    console.log('\n✅ Usuario administrador creado exitosamente!');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👤 Nombre: ${adminUser.fullName || 'No especificado'}`);
    console.log(`🔑 Rol: ${adminUser.role}`);
    console.log(`🆔 ID: ${adminUser._id}\n`);
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error creando usuario administrador:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdminUser();
