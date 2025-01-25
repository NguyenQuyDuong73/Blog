const mongoose = require('mongoose');

const connectDB = async () => {
 
        
        const conn = await mongoose.connect(`mongodb://localhost:27017/db_blog`)
        // console.log(`MongoDB state: ${conn.connection.readyState}`)
        return conn
    

  }

  module.exports = connectDB;
