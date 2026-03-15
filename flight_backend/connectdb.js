const mysql = require('mysql2/promise'); // ใช้แบบ promise เพื่อให้รองรับ async/await

// ตั้งค่าเชื่อมต่อไปยัง MySQL ใน Docker
const pool = mysql.createPool({
    host: '127.0.0.1', // ใช้ 127.0.0.1 ชัวร์กว่า localhost 
    user: 'root',
    password: '1234',
    database: 'flight_booking_db', // ชื่อ Database ที่คุณสร้างไว้
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ทดสอบว่าต่อ Database ติดไหม
pool.getConnection()
    .then(conn => {
        console.log('✅ Connected to MySQL Database successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL Connection Failed:', err.message);
    });

module.exports = pool;