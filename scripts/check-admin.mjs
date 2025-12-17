#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking for admin user...\n')

  try {
    // Check if admin exists
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@azteka.com' }
    })

    if (admin) {
      console.log('✅ Admin user exists!')
      console.log('   Email:', admin.email)
      console.log('   Name:', admin.name)
      console.log('   Role:', admin.role)
      console.log('\n📝 Login credentials:')
      console.log('   Email: admin@azteka.com')
      console.log('   Password: password123')
    } else {
      console.log('❌ Admin user not found. Creating...')

      const hashedPassword = await bcrypt.hash('password123', 10)

      admin = await prisma.user.create({
        data: {
          email: 'admin@azteka.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'admin'
        }
      })

      console.log('✅ Admin user created!')
      console.log('   Email:', admin.email)
      console.log('   Name:', admin.name)
      console.log('   Role:', admin.role)
      console.log('\n📝 Login credentials:')
      console.log('   Email: admin@azteka.com')
      console.log('   Password: password123')
    }

    // Test password
    console.log('\n🔐 Testing password...')
    const isValid = await bcrypt.compare('password123', admin.password)
    console.log('   Password test:', isValid ? '✅ Valid' : '❌ Invalid')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
