const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Simple MongoDB Connection Test
 * Run this to verify your database connection
 */

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 Connecting to:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('🏷️  Database name:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('📊 Ready state:', mongoose.connection.readyState);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Available collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Get collection counts
    console.log('\n📈 Collection statistics:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    
    console.log('\n🎉 Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('  1. Check your username and password in .env file');
      console.log('  2. Verify your MongoDB Atlas user has proper permissions');
      console.log('  3. Check if your IP address is whitelisted in Atlas');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('\n💡 Possible solutions:');
      console.log('  1. Check your internet connection');
      console.log('  2. Verify the cluster URL is correct');
      console.log('  3. Check if your network allows MongoDB connections');
    }
    
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testConnection();