const express = require('express');
const cors = require('cors');
const pool = require('./connectdb'); 

const app = express();

app.use(cors()); 
app.use(express.json());
// ==========================================
// 1. API: ดึงข้อมูลเที่ยวบิน (อัปเดตอิงตาม Schema ล่าสุด 100%)
// ==========================================
app.get('/api/flights', async (req, res) => {
    try {
        const { origin, destination, travelDate } = req.query;

        // ใช้ชื่อคอลัมน์ตาม DB เป๊ะๆ: a.airline_name, ap.ap_model, orig.airport_code ฯลฯ
        let sql = `
            SELECT 
                f.f_id AS flight_id, 
                CONCAT('FL00', f.f_id) AS flight_number, 
                1500 AS price, 
                a.airline_name AS airline_name, 
                ap.ap_model AS airplane_model,
                orig.airport_code AS origin_code, 
                orig.airport_name AS origin_name,
                dest.airport_code AS destination_code, 
                dest.airport_name AS destination_name,
                DATE_FORMAT(f.departure_time, '%H:%i') AS departure_time_formatted,
                DATE_FORMAT(f.arrive_time, '%H:%i') AS arrival_time_formatted,
                DATE_FORMAT(f.f_date, '%d/%m/%Y') AS flight_date_formatted
            FROM Flight f
            JOIN Airplane ap ON f.ap_id = ap.ap_id
            JOIN Airline a ON ap.airline_id = a.airline_id
            JOIN Airport orig ON f.origin_airport_id = orig.airport_id
            JOIN Airport dest ON f.destination_airport_id = dest.airport_id
            WHERE 1=1 
        `;

        const params = [];

        // กรองด้วยรหัสสนามบิน (เช่น HDY, BKK)
        if (origin) {
            sql += ` AND orig.airport_code = ?`;
            params.push(origin);
        }
        
        if (destination) {
            sql += ` AND dest.airport_code = ?`;
            params.push(destination);
        }
        
        // กรองด้วยวันที่ (คอลัมน์ f_date)
        if (travelDate) {
            sql += ` AND f.f_date = ?`; 
            params.push(travelDate);
        }

        sql += ` ORDER BY f.departure_time ASC`;

        const [flights] = await pool.query(sql, params);

        // จัดฟอร์แมตข้อมูลส่งกลับไปให้หน้าบ้าน (React)
        const formattedFlights = flights.map(flight => ({
            flight_id: flight.flight_id,
            flight_number: flight.flight_number,
            travel_date: flight.flight_date_formatted,
            departure_time_formatted: flight.departure_time_formatted,
            arrival_time_formatted: flight.arrival_time_formatted,
            price: flight.price,
            airline: { name: flight.airline_name }, // หน้าบ้านจะเอาชื่อไปแมปกับโลโก้
            airplane: { model: flight.airplane_model },
            origin: { code: flight.origin_code, name: flight.origin_name },
            destination: { code: flight.destination_code, name: flight.destination_name }
        }));

        res.json({ success: true, data: formattedFlights });
    } catch (error) {
        console.error("Error fetching flights:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

// ==========================================
// 2. API: จองเที่ยวบิน (POST /api/book) - อัปเดตเช็คและอัปเดตข้อมูล Passenger
// ==========================================
// app.post('/api/book', async (req, res) => {
//     // const data = req.body;

//     // if (!data || !data.flight_id || !data.passengerName) {
//     //     return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
//     // }
//     // 📍 รับข้อมูลแบบ "ก้อนเดียว" ที่มีผู้โดยสารทุกคนรวมมาแล้ว (allPassengers)
//     const { flight_id, u_id, payment_type, payment_date, payment_time, allPassengers } = req.body;

//     if (!flight_id || !allPassengers || allPassengers.length === 0) {
//         return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
//     }

//     const connection = await pool.getConnection();

//     try {
//         await connection.beginTransaction(); 

//         const u_id = data.u_id;

//         // 📍 รับค่าตัวแปรบริการเสริมเพิ่มเข้ามาตรงนี้ครับ
//         const weight_Departure = data.weight_Departure || 0; // น้ำหนักขาไป
//         const weight_Inbound = data.weight_Inbound || 0;     // น้ำหนักขากลับ
//         const food_status = data.food_status || 'None';      // อาหาร

//         const nameParts = data.passengerName.trim().split(' ');
//         const pass_fname = nameParts[0];
//         const pass_lname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';
//         const pass_tel = data.passengerPhone || '';
//         const pass_thaiid = data.passengerIdNumber || ''; 

//         // 1. จัดการเรื่องเวลาประเทศไทย (Asia/Bangkok)
//          const now = new Date();
//          const options = { 
//             timeZone: 'Asia/Bangkok', 
//             year: 'numeric', month: '2-digit', day: '2-digit', 
//             hour: '2-digit', minute: '2-digit', second: '2-digit', 
//             hour12: false 
//         };
//         const formatter = new Intl.DateTimeFormat('en-GB', options);
//         const parts = formatter.format(now).split(', ');
        
//         const [day, month, year] = parts[0].split('/');
//         const currentTime = parts[1];
//         const currentDate = `${year}-${month}-${day}`;
//         const currentDateTime = `${currentDate} ${currentTime}`;

//         // 📍 2. ลอจิกใหม่: ค้นหาจาก ชื่อ, นามสกุล และ บัตรประชาชน เป็นหลัก (ไม่สน u_id คนจอง)
//         let pass_id;
//         const [existingPass] = await connection.query(
//             `SELECT pass_id, pass_tel FROM Passenger 
//              WHERE pass_fname = ? AND pass_lname = ? AND Pass_Thaiid = ? 
//              LIMIT 1`,
//             [pass_fname, pass_lname, pass_thaiid] 
//         );

//         if (existingPass.length > 0) {
//             // ✅ เจอประวัติผู้โดยสารคนนี้ในระบบ! (ข้ามการเช็ค User ID)
//             pass_id = existingPass[0].pass_id;

//             // เช็คว่าเบอร์โทรศัพท์ตรงกับที่มีในระบบหรือไม่
//             if (existingPass[0].pass_tel !== pass_tel) {
//                 // 🔄 เบอร์ไม่ตรง: อัปเดตเบอร์โทรใหม่ให้เลย
//                 await connection.query(
//                     `UPDATE Passenger SET pass_tel = ? WHERE pass_id = ?`,
//                     [pass_tel, pass_id]
//                 );
//             }
//         } else {
//             // ❌ ไม่เคยมีชื่อและบัตร ปชช. นี้ในระบบเลย ให้สร้างใหม่ (พร้อมเก็บ u_id ของคนที่สร้างประวัตินี้ไว้)
//             const [passResult] = await connection.query(
//                 `INSERT INTO Passenger (pass_fname, pass_lname, pass_tel, Pass_Thaiid, u_id) VALUES (?, ?, ?, ?, ?)`,
//                 [pass_fname, pass_lname, pass_tel, pass_thaiid, u_id]
//             );
//             pass_id = passResult.insertId;
//         }

//         // 3. ลงตาราง Payment
//                // 📍 2. จัดการตาราง Payment (รับค่ามาจาก PaymentPage.jsx)
//         const payment_type = data.payment_type; // ไม่มีการล็อกค่าแล้ว
//         const payment_status = data.payment_status || 'Completed'; 
//         const payment_date = data.payment_date; 
//         const payment_time = data.payment_time; 

//         const [payResult] = await connection.query(
//             `INSERT INTO Payment (payment_type, payment_status, payment_date, payment_time) VALUES (?, ?, ?, ?)`,
//             [payment_type, payment_status, payment_date, payment_time]
//         );
//         const payment_id = payResult.insertId;

//         // 📍 3. จัดการตาราง Reservation
//         const [resResult] = await connection.query(
//             `INSERT INTO Reservation (res_date, res_status, pass_id, payment_id, u_id, f_id) VALUES (?, ?, ?, ?, ?, ?)`,
//             [currentDateTime, 'Confirmed', pass_id, payment_id, u_id, data.flight_id]
//         );
//         const res_id = resResult.insertId;

//         // 5. ลงตาราง Reservation_detail
//         const class_id = 1; 
//         const seat_num = "A" + Math.floor(Math.random() * 30 + 1); 
//         const seq_id = 1; 
        
//         await connection.query(
//             `INSERT INTO Reservation_detail 
//             (res_id, seat_num, pass_id, seq_id, class_id, weight_Departure, weight_Inbound, food_status) 
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//             [res_id, seat_num, pass_id, seq_id, class_id, weight_Departure, weight_Inbound, food_status]
//         );

//         await connection.commit();
//         res.json({ success: true, message: 'จองเที่ยวบินสำเร็จเรียบร้อยแล้ว!', reservation_id: res_id });

//     } catch (error) {
//         await connection.rollback();
//         console.error("Booking Error:", error);
//         res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการจอง: ' + error.message });
//     } finally {
//         connection.release(); 
//     }
// });

// ==========================================
// 2. API: จองเที่ยวบิน (POST /api/book) - 1 Booking หลายผู้โดยสาร
// ==========================================
app.post('/api/book', async (req, res) => {
    // 📍 รับข้อมูลแบบ "ก้อนเดียว" ที่มีผู้โดยสารทุกคนรวมมาแล้ว (allPassengers)
    const { flight_id, u_id, payment_type, payment_date, payment_time, allPassengers } = req.body;

    if (!flight_id || !allPassengers || allPassengers.length === 0) {
        return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction(); 

        // จัดการเวลา
        const now = new Date();
        const options = { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const parts = new Intl.DateTimeFormat('en-GB', options).format(now).split(', ');
        const [day, month, year] = parts[0].split('/');
        const currentDateTime = `${year}-${month}-${day} ${parts[1]}`;

        // 📍 1. สร้าง Payment แค่ 1 ครั้งต่อการจอง
        const [payResult] = await connection.query(
            `INSERT INTO Payment (payment_type, payment_status, payment_date, payment_time) VALUES (?, 'Completed', ?, ?)`,
            [payment_type, payment_date, payment_time]
        );
        const payment_id = payResult.insertId;

        // 📍 2. สร้าง Reservation แค่ 1 ครั้ง (ไม่มี pass_id แล้ว)
        const [resResult] = await connection.query(
            `INSERT INTO Reservation (res_date, res_status, payment_id, u_id, f_id) VALUES (?, 'Confirmed', ?, ?, ?)`,
            [currentDateTime, payment_id, u_id, flight_id]
        );
        const res_id = resResult.insertId; // ได้รหัสการจองหลักมาแล้ว

        // 📍 3. วนลูปจัดการประวัติผู้โดยสาร และ Add-ons ทีละคน
        for (let i = 0; i < allPassengers.length; i++) {
            const p = allPassengers[i];
            const pass_fname = p.firstName.trim();
            const pass_lname = p.lastName.trim() || '-';
            const pass_tel = p.phone || '';
            const pass_thaiid = p.thaiId || ''; 

            let pass_id;
            
            // ค้นหาว่ามีประวัติคนนี้ในระบบไหม
            const [existingPass] = await connection.query(
                `SELECT pass_id, pass_tel FROM Passenger WHERE pass_fname = ? AND pass_lname = ? AND Pass_Thaiid = ? LIMIT 1`,
                [pass_fname, pass_lname, pass_thaiid] 
            );

            if (existingPass.length > 0) {
                pass_id = existingPass[0].pass_id;
                if (existingPass[0].pass_tel !== pass_tel) {
                    await connection.query(`UPDATE Passenger SET pass_tel = ? WHERE pass_id = ?`, [pass_tel, pass_id]);
                }
            } else {
                const [passResult] = await connection.query(
                    `INSERT INTO Passenger (pass_fname, pass_lname, pass_tel, Pass_Thaiid, u_id) VALUES (?, ?, ?, ?, ?)`,
                    [pass_fname, pass_lname, pass_tel, pass_thaiid, u_id]
                );
                pass_id = passResult.insertId;
            }

            // นำ pass_id ไปผูกกับรหัสการจองหลัก (res_id) ในตาราง Reservation_detail
            const class_id = 1; 
            const seat_num = "A" + Math.floor(Math.random() * 30 + 1); 
            const seq_id = i + 1; // ลำดับที่ผู้โดยสารคนที่ 1, 2, 3...
            
            await connection.query(
                `INSERT INTO Reservation_detail 
                (res_id, seat_num, pass_id, seq_id, class_id, weight_Departure, weight_Inbound, food_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [res_id, seat_num, pass_id, seq_id, class_id, p.weightDeparture || 0, p.weightInbound || 0, p.foodStatus || 'None']
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'จองเที่ยวบินสำเร็จเรียบร้อยแล้ว!', reservation_id: res_id });

    } catch (error) {
        await connection.rollback();
        console.error("Booking Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการจอง: ' + error.message });
    } finally {
        connection.release(); 
    }
});

// ==========================================
// 3. API: สมัครสมาชิก (Register)
// ==========================================
app.post('/api/register', async (req, res) => {
    const { u_email, u_password, u_name } = req.body;

    // เช็คว่าส่งข้อมูลมาครบไหม
    if (!u_email || !u_password || !u_name) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        //  เช็คก่อนว่า "ชื่อผู้ใช้งาน" (u_name) นี้มีคนใช้หรือยัง
        const [nameCheck] = await pool.query('SELECT u_id FROM User WHERE u_name = ?', [u_name]);
        if (nameCheck.length > 0) {
            return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว กรุณาใช้ชื่ออื่น' });
        }
        // เช็คว่า "อีเมล" (u_email) มีคนใช้หรือยัง
        const [existingUser] = await pool.query('SELECT * FROM User WHERE u_email = ?', [u_email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น' });
        }

        // ถ้าผ่านทั้งคู่ เพิ่มข้อมูลลงตาราง User (กำหนด role อัตโนมัติเป็น 'user')
        const [result] = await pool.query(
            'INSERT INTO User (u_email, u_password, u_name, role) VALUES (?, ?, ?, ?)',
            [u_email, u_password, u_name, 'user']
        );

        res.json({ success: true, message: 'สมัครสมาชิกสำเร็จ!', u_id: result.insertId });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด: ' + error.message });
    }
});

// ==========================================
// 4. API: เข้าสู่ระบบ (Login)
// ==========================================
app.post('/api/login', async (req, res) => {
    const { u_email, u_password } = req.body;

    if (!u_email || !u_password) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    try {
        // ค้นหาอีเมลและรหัสผ่านใน Database 
        // (หมายเหตุ: ในโปรเจกต์จริงรหัสผ่านควรเข้ารหัส (Hash) แต่เพื่อความเข้าใจง่ายของ Prototype เราจะใช้เทียบข้อความตรงๆ ไปก่อนครับ)
        const [users] = await pool.query(
            'SELECT u_id, u_email, u_name, role FROM User WHERE u_email = ? AND u_password = ?',
            [u_email, u_password]
        );

        // ถ้าหาไม่เจอ แปลว่ารหัสผิด หรือ อีเมลผิด
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        // ถ้าเข้าสู่ระบบสำเร็จ ส่งข้อมูล User กลับไปให้หน้าบ้าน (แต่ไม่ส่งรหัสผ่านกลับไป)
        res.json({ 
            success: true, 
            message: 'เข้าสู่ระบบสำเร็จ!', 
            user: users[0] 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด: ' + error.message });
    }
});

// ==========================================
// 5. API: ดึงรายชื่อสนามบินทั้งหมด (ใช้สำหรับทำ Dropdown)
// ==========================================
app.get('/api/airports', async (req, res) => {
    try {
        // ดึงข้อมูลรหัสและชื่อสนามบินจาก Database เรียงตามตัวอักษร A-Z
        const [airports] = await pool.query(
            'SELECT airport_code AS code, airport_name AS name FROM Airport ORDER BY airport_code ASC'
        );
        
        res.json({ success: true, data: airports });
    } catch (error) {
        console.error("Error fetching airports:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสนามบิน' });
    }
});

// ==========================================
// 6. API: ดึงประวัติการจองตั๋วของ User (My Bookings)
// ==========================================
// app.get('/api/my-bookings', async (req, res) => {
//     try {
//         // รับค่า u_id ของคนที่ล็อกอินอยู่
//         const { u_id } = req.query;

//         if (!u_id) {
//             return res.status(400).json({ success: false, message: 'ไม่พบรหัสผู้ใช้งาน' });
//         }

//         // ดึงข้อมูลการจอง โดย JOIN ตารางที่เกี่ยวข้องทั้งหมด
//         // ดึงข้อมูลการจอง โดย JOIN ตารางที่เกี่ยวข้องทั้งหมด
//         const sql = `
//             SELECT 
//                 r.res_id, 
//                 r.res_status, 
//                 DATE_FORMAT(r.res_date, '%d/%m/%Y %H:%i') AS booking_date,
//                 f.f_id AS flight_id, 
//                 CONCAT('FL00', f.f_id) AS flight_number,
//                 DATE_FORMAT(f.f_date, '%d/%m/%Y') AS travel_date,
//                 DATE_FORMAT(f.departure_time, '%H:%i') AS departure_time,
//                 DATE_FORMAT(f.arrive_time, '%H:%i') AS arrival_time,
//                 a.airline_name,
//                 orig.airport_code AS origin_code,
//                 dest.airport_code AS destination_code,
//                 rd.seat_num,
//                 rd.weight_Departure,   
//                 rd.weight_Inbound,     
//                 rd.food_status,        
//                 pass.pass_fname,
//                 pass.pass_lname
//             FROM Reservation r
//             JOIN Reservation_detail rd ON r.res_id = rd.res_id
//             JOIN Flight f ON r.f_id = f.f_id
//             JOIN Airline a ON f.air_id = a.airline_id
//             JOIN Airport orig ON f.origin_airport_id = orig.airport_id
//             JOIN Airport dest ON f.destination_airport_id = dest.airport_id
//             JOIN Passenger pass ON r.pass_id = pass.pass_id
//             WHERE r.u_id = ?  
//             ORDER BY r.res_date DESC
//         `;

//         const [bookings] = await pool.query(sql, [u_id]);

//         res.json({ success: true, data: bookings });
//     } catch (error) {
//         console.error("Error fetching bookings:", error);
//         res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงประวัติการจอง' });
//     }
// });

// ==========================================
// 6. API: ดึงประวัติการจองตั๋วของ User (My Bookings)
// ==========================================
app.get('/api/my-bookings', async (req, res) => {
    try {
        const { u_id } = req.query;
        if (!u_id) return res.status(400).json({ success: false, message: 'ไม่พบรหัสผู้ใช้งาน' });

        const sql = `
            SELECT 
                r.res_id, r.res_status, DATE_FORMAT(r.res_date, '%d/%m/%Y %H:%i') AS booking_date,
                f.f_id AS flight_id, CONCAT('FL00', f.f_id) AS flight_number,
                DATE_FORMAT(f.f_date, '%d/%m/%Y') AS travel_date,
                DATE_FORMAT(f.departure_time, '%H:%i') AS departure_time,
                DATE_FORMAT(f.arrive_time, '%H:%i') AS arrival_time,
                a.airline_name,
                orig.airport_code AS origin_code, dest.airport_code AS destination_code,
                rd.seat_num, rd.weight_Departure, rd.weight_Inbound, rd.food_status,        
                pass.pass_fname, pass.pass_lname
            FROM Reservation r
            JOIN Reservation_detail rd ON r.res_id = rd.res_id
            JOIN Passenger pass ON rd.pass_id = pass.pass_id
            JOIN Flight f ON r.f_id = f.f_id
            JOIN Airplane ap ON f.ap_id = ap.ap_id
            JOIN Airline a ON ap.airline_id = a.airline_id
            JOIN Airport orig ON f.origin_airport_id = orig.airport_id
            JOIN Airport dest ON f.destination_airport_id = dest.airport_id
            WHERE r.u_id = ?  
            ORDER BY r.res_date DESC
        `;
        const [bookings] = await pool.query(sql, [u_id]);
        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงประวัติการจอง' });
    }
});

// ==========================================
// 7. API: ยกเลิกการจองตั๋ว (User Cancel Booking)
// ==========================================
app.post('/api/cancel-booking', async (req, res) => {
    const { res_id } = req.body;

    if (!res_id) {
        return res.status(400).json({ success: false, message: 'ไม่พบรหัสการจอง' });
    }

    try {
        // อัปเดตสถานะในตาราง Reservation ให้เป็น 'Cancelled'
        const [result] = await pool.query(
            `UPDATE Reservation SET res_status = 'Cancelled' WHERE res_id = ?`,
            [res_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการจองนี้' });
        }

        res.json({ success: true, message: 'ยกเลิกเที่ยวบินสำเร็จแล้ว' });
    } catch (error) {
        console.error("Cancel Booking Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการยกเลิกเที่ยวบิน' });
    }
});

// ==========================================
// 8. API สำหรับ Admin: ดึงประวัติการจอง "ทั้งหมด" ทุกคน
// ==========================================
// app.get('/api/admin/bookings', async (req, res) => {
//     try {
//         const sql = `
//             SELECT 
//                 r.res_id, 
//                 r.res_status, 
//                 DATE_FORMAT(r.res_date, '%d/%m/%Y %H:%i') AS booking_date,
//                 f.f_id AS flight_id, 
//                 CONCAT('FL00', f.f_id) AS flight_number,
//                 DATE_FORMAT(f.f_date, '%d/%m/%Y') AS travel_date,
//                 a.airline_name,
//                 orig.airport_code AS origin_code,
//                 dest.airport_code AS destination_code,
//                 pass.pass_fname,
//                 pass.pass_lname,
//                 u.u_email
//             FROM Reservation r
//             JOIN Flight f ON r.f_id = f.f_id
//             JOIN Airline a ON f.air_id = a.airline_id
//             JOIN Airport orig ON f.origin_airport_id = orig.airport_id
//             JOIN Airport dest ON f.destination_airport_id = dest.airport_id
//             JOIN Passenger pass ON r.pass_id = pass.pass_id
//             JOIN User u ON pass.u_id = u.u_id
//             ORDER BY r.res_id DESC
//         `;
//         const [bookings] = await pool.query(sql);
//         res.json({ success: true, data: bookings });
//     } catch (error) {
//         console.error("Admin Fetch Bookings Error:", error);
//         res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
//     }
// });

// ==========================================
// 8. API สำหรับ Admin: ดึงประวัติการจอง "ทั้งหมด" ทุกคน
// ==========================================
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.res_id, r.res_status, DATE_FORMAT(r.res_date, '%d/%m/%Y %H:%i') AS booking_date,
                f.f_id AS flight_id, CONCAT('FL00', f.f_id) AS flight_number,
                DATE_FORMAT(f.f_date, '%d/%m/%Y') AS travel_date,
                a.airline_name,
                orig.airport_code AS origin_code, dest.airport_code AS destination_code,
                pass.pass_fname, pass.pass_lname, u.u_email
            FROM Reservation r
            JOIN Reservation_detail rd ON r.res_id = rd.res_id
            JOIN Passenger pass ON rd.pass_id = pass.pass_id
            JOIN Flight f ON r.f_id = f.f_id
            JOIN Airplane ap ON f.ap_id = ap.ap_id
            JOIN Airline a ON ap.airline_id = a.airline_id
            JOIN Airport orig ON f.origin_airport_id = orig.airport_id
            JOIN Airport dest ON f.destination_airport_id = dest.airport_id
            JOIN User u ON r.u_id = u.u_id
            ORDER BY r.res_id DESC
        `;
        const [bookings] = await pool.query(sql);
        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error("Admin Fetch Bookings Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

// ==========================================
// 9. API สำหรับ Admin: ลบการจองถาวร (Hard Delete)
// ==========================================
app.delete('/api/admin/bookings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 📍 1. ค้นหา payment_id ของการจองนี้เก็บไว้ก่อน (ก่อนที่สะพานจะโดนทำลาย)
        const [booking] = await pool.query(`SELECT payment_id FROM Reservation WHERE res_id = ?`, [id]);
        
        if (booking.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการจองนี้' });
        }

        const payment_id = booking[0].payment_id;

        // 📍 2. ทำลายสะพาน (ลบ Reservation)
        await pool.query(`DELETE FROM Reservation WHERE res_id = ?`, [id]);
        
        // 📍 3. ตามไปเก็บกวาดข้อมูลกำพร้า (ลบ Payment)
        if (payment_id) {
            await pool.query(`DELETE FROM Payment WHERE payment_id = ?`, [payment_id]);
        }

        res.json({ success: true, message: 'ลบข้อมูลการจองและประวัติการชำระเงินเรียบร้อย' });
    } catch (error) {
        console.error("Admin Delete Booking Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
});


// ==========================================
// 10. API สำหรับ Admin: ดึงข้อมูล Master Data ไปทำตัวเลือก (Dropdown)
// ==========================================
app.get('/api/admin/flight-master-data', async (req, res) => {
    try {
        // ดึงข้อมูลสนามบินทั้งหมด เพื่อให้แอดมินเลือกเป็น ต้นทาง-ปลายทาง
        const [airports] = await pool.query('SELECT airport_id, airport_code, airport_name FROM Airport');
        
        // ดึงข้อมูลสายการบิน
        const [airlines] = await pool.query('SELECT airline_id, airline_name FROM Airline');
        
        // ดึงข้อมูลเครื่องบิน
        const [airplanes] = await pool.query('SELECT ap_id, ap_model, num_of_seat, airline_id FROM Airplane');

        // ส่งข้อมูลทั้ง 3 ก้อนกลับไปให้หน้าเว็บในครั้งเดียว (ประหยัดเวลาโหลด)
        res.json({ success: true, airports, airlines, airplanes });
    } catch (error) {
        console.error("Fetch Master Data Error:", error);
        res.status(500).json({ success: false, message: 'ไม่สามารถดึงข้อมูลตัวเลือกได้' });
    }
});

// ==========================================
// 11. API สำหรับ Admin: เพิ่มเที่ยวบินใหม่ (Insert Flight)
// ==========================================
// app.post('/api/admin/flights', async (req, res) => {
//     // รับข้อมูล 9 อย่างที่แอดมินกรอกมาจากหน้าเว็บ
//     const { 
//         f_date, departure_time, arrive_time, boarding_time, gate_id, 
//         origin_airport_id, destination_airport_id, air_id, ap_id 
//     } = req.body;

//     try {
//         // เช็คก่อนว่าแอดมินเลือกสนามบินต้นทาง กับ ปลายทาง ซ้ำกันหรือไม่ (กันแอดมินกรอกผิด)
//         if (origin_airport_id === destination_airport_id) {
//             return res.status(400).json({ success: false, message: 'สนามบินต้นทางและปลายทางต้องไม่ซ้ำกัน!' });
//         }

//         // สั่ง INSERT ข้อมูลลงตาราง Flight
//         const sql = `
//             INSERT INTO Flight 
//             (f_date, departure_time, arrive_time, boarding_time, gate_id, origin_airport_id, destination_airport_id, air_id, ap_id) 
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
        
//         await pool.query(sql, [
//             f_date, departure_time, arrive_time, boarding_time, gate_id, 
//             origin_airport_id, destination_airport_id, air_id, ap_id
//         ]);

//         // ตอบกลับไปบอกหน้าเว็บว่าบันทึกสำเร็จ
//         res.json({ success: true, message: 'เพิ่มเที่ยวบินใหม่เข้าสู่ระบบเรียบร้อยแล้ว!' });
//     } catch (error) {
//         console.error("Add Flight Error:", error);
//         res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มเที่ยวบิน' });
//     }
// });

app.post('/api/admin/flights', async (req, res) => {
    // 📍 เอา air_id ออก
    const { f_date, departure_time, arrive_time, boarding_time, gate_id, origin_airport_id, destination_airport_id, ap_id } = req.body;

    try {
        if (origin_airport_id === destination_airport_id) {
            return res.status(400).json({ success: false, message: 'สนามบินต้นทางและปลายทางต้องไม่ซ้ำกัน!' });
        }
        const sql = `
            INSERT INTO Flight 
            (f_date, departure_time, arrive_time, boarding_time, gate_id, origin_airport_id, destination_airport_id, ap_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.query(sql, [f_date, departure_time, arrive_time, boarding_time, gate_id, origin_airport_id, destination_airport_id, ap_id]);
        res.json({ success: true, message: 'เพิ่มเที่ยวบินใหม่เข้าสู่ระบบเรียบร้อยแล้ว!' });
    } catch (error) {
        console.error("Add Flight Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มเที่ยวบิน' });
    }
});

// ==========================================
// 12. API สำหรับ Admin: ดึงรายการเที่ยวบินทั้งหมดมาโชว์ในตาราง
// ==========================================
// app.get('/api/admin/flights', async (req, res) => {
//     try {
//         const sql = `
//             SELECT f.*, 
//                    orig.airport_code AS origin_code, 
//                    dest.airport_code AS dest_code, 
//                    a.airline_name 
//             FROM Flight f
//             JOIN Airport orig ON f.origin_airport_id = orig.airport_id
//             JOIN Airport dest ON f.destination_airport_id = dest.airport_id
//             JOIN Airline a ON f.air_id = a.airline_id
//             ORDER BY f.f_date DESC, f.departure_time ASC
//         `;
//         const [flights] = await pool.query(sql);
//         res.json({ success: true, flights });
//     } catch (error) {
//         console.error("Fetch Flights Error:", error);
//         res.status(500).json({ success: false, message: 'ไม่สามารถดึงข้อมูลเที่ยวบินได้' });
//     }
// });
app.get('/api/admin/flights', async (req, res) => {
    try {
        const sql = `
            SELECT f.*, 
                   orig.airport_code AS origin_code, 
                   dest.airport_code AS dest_code, 
                   a.airline_name 
            FROM Flight f
            JOIN Airport orig ON f.origin_airport_id = orig.airport_id
            JOIN Airport dest ON f.destination_airport_id = dest.airport_id
            JOIN Airplane ap ON f.ap_id = ap.ap_id
            JOIN Airline a ON ap.airline_id = a.airline_id
            ORDER BY f.f_date DESC, f.departure_time ASC
        `;
        const [flights] = await pool.query(sql);
        res.json({ success: true, flights });
    } catch (error) {
        console.error("Fetch Flights Error:", error);
        res.status(500).json({ success: false, message: 'ไม่สามารถดึงข้อมูลเที่ยวบินได้' });
    }
});
// ==========================================
// 13. API สำหรับ Admin: แก้ไข/อัปเดตเที่ยวบิน (Update)
// ==========================================
// app.put('/api/admin/flights/:id', async (req, res) => {
//     const { 
//         f_date, departure_time, arrive_time, boarding_time, gate_id, 
//         origin_airport_id, destination_airport_id, air_id, ap_id 
//     } = req.body;
//     const { id } = req.params;

//     try {
//         const sql = `
//             UPDATE Flight SET 
//                 f_date=?, departure_time=?, arrive_time=?, boarding_time=?, gate_id=?, 
//                 origin_airport_id=?, destination_airport_id=?, air_id=?, ap_id=?
//             WHERE f_id=?
//         `;
//         await pool.query(sql, [
//             f_date, departure_time, arrive_time, boarding_time, gate_id, 
//             origin_airport_id, destination_airport_id, air_id, ap_id, id
//         ]);
//         res.json({ success: true, message: 'อัปเดตข้อมูลเที่ยวบินสำเร็จ!' });
//     } catch (error) {
//         console.error("Update Flight Error:", error);
//         res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดต' });
//     }
// });
app.put('/api/admin/flights/:id', async (req, res) => {
    // 📍 เอา air_id ออก
    const { f_date, departure_time, arrive_time, boarding_time, gate_id, origin_airport_id, destination_airport_id, ap_id } = req.body;
    const { id } = req.params;

    try {
        const sql = `
            UPDATE Flight SET 
                f_date=?, departure_time=?, arrive_time=?, boarding_time=?, gate_id=?, 
                origin_airport_id=?, destination_airport_id=?, ap_id=?
            WHERE f_id=?
        `;
        await pool.query(sql, [f_date, departure_time, arrive_time, boarding_time, gate_id, origin_airport_id, destination_airport_id, ap_id, id]);
        res.json({ success: true, message: 'อัปเดตข้อมูลเที่ยวบินสำเร็จ!' });
    } catch (error) {
        console.error("Update Flight Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดต' });
    }
});

// ==========================================
// 14. API สำหรับ Admin: ลบเที่ยวบิน (Delete)
// ==========================================
app.delete('/api/admin/flights/:id', async (req, res) => {
    try {
        // ลบเที่ยวบิน (ข้อมูลการจองที่ผูกกับเที่ยวบินนี้จะถูกลบอัตโนมัติ เพราะเราทำ ON DELETE CASCADE ไว้)
        await pool.query('DELETE FROM Flight WHERE f_id=?', [req.params.id]);
        res.json({ success: true, message: 'ลบเที่ยวบินเรียบร้อยแล้ว!' });
    } catch (error) {
        console.error("Delete Flight Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบ' });
    }
});

// ==========================================
// 15. API สำหรับ Admin: ดึงข้อมูลสถิติ (Dashboard Analytics) - อัปเดตแก้บั๊ก
// ==========================================
// app.get('/api/admin/dashboard-stats', async (req, res) => {
//     try {
//         // 1. สถิติยอดจองรายวัน (แก้ SQL ให้ GROUP BY และ ORDER BY ทำงานได้ 100%)
//         const [dailyBookings] = await pool.query(`
//             SELECT DATE_FORMAT(res_date, '%d/%m/%Y') as date, COUNT(*) as count 
//             FROM Reservation 
//             GROUP BY DATE_FORMAT(res_date, '%d/%m/%Y'), DATE(res_date)
//             ORDER BY DATE(res_date) ASC 
//             LIMIT 7
//         `);

//         // 2. สถิติสายการบินยอดฮิต
//         const [airlineStats] = await pool.query(`
//             SELECT a.airline_name as name, COUNT(r.res_id) as value
//             FROM Reservation r
//             JOIN Flight f ON r.f_id = f.f_id
//             JOIN Airline a ON f.air_id = a.airline_id
//             GROUP BY a.airline_name
//         `);

//         // 3. ภาพรวมตัวเลข 
//         const [totalUsers] = await pool.query("SELECT COUNT(*) as count FROM User WHERE role = 'user'");
//         const [totalFlights] = await pool.query("SELECT COUNT(*) as count FROM Flight");
//         const [totalReservations] = await pool.query("SELECT COUNT(*) as count FROM Reservation");

//         // 📍 ทริคสำคัญ: ต้องบังคับแปลงค่า COUNT ให้เป็นตัวเลข (Number) เสมอ กราฟถึงจะขึ้น!
//         res.json({
//             success: true,
//             dailyBookings: dailyBookings.map(item => ({ 
//                 date: item.date, 
//                 count: Number(item.count) 
//             })),
//             airlineStats: airlineStats.map(item => ({ 
//                 name: item.name, 
//                 value: Number(item.value) 
//             })),
//             summary: {
//                 users: Number(totalUsers[0].count),
//                 flights: Number(totalFlights[0].count),
//                 reservations: Number(totalReservations[0].count)
//             }
//         });
//     } catch (error) {
//         console.error("Dashboard Stats Error:", error);
//         res.status(500).json({ success: false, message: 'ไม่สามารถดึงข้อมูลสถิติได้' });
//     }
// });
// ==========================================
// 15. API สำหรับ Admin: ดึงข้อมูลสถิติ (Dashboard Analytics)
// ==========================================
app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
        const [dailyBookings] = await pool.query(`
            SELECT DATE_FORMAT(res_date, '%d/%m/%Y') as date, COUNT(*) as count 
            FROM Reservation 
            GROUP BY DATE_FORMAT(res_date, '%d/%m/%Y'), DATE(res_date)
            ORDER BY DATE(res_date) ASC LIMIT 7
        `);

        // 📍 วิ่งผ่าน Airplane เพื่อไปเอาชื่อ Airline
        const [airlineStats] = await pool.query(`
            SELECT a.airline_name as name, COUNT(r.res_id) as value
            FROM Reservation r
            JOIN Flight f ON r.f_id = f.f_id
            JOIN Airplane ap ON f.ap_id = ap.ap_id
            JOIN Airline a ON ap.airline_id = a.airline_id
            GROUP BY a.airline_name
        `);

        const [totalUsers] = await pool.query("SELECT COUNT(*) as count FROM User WHERE role = 'user'");
        const [totalFlights] = await pool.query("SELECT COUNT(*) as count FROM Flight");
        const [totalReservations] = await pool.query("SELECT COUNT(*) as count FROM Reservation");

        res.json({
            success: true,
            dailyBookings: dailyBookings.map(item => ({ date: item.date, count: Number(item.count) })),
            airlineStats: airlineStats.map(item => ({ name: item.name, value: Number(item.value) })),
            summary: {
                users: Number(totalUsers[0].count),
                flights: Number(totalFlights[0].count),
                reservations: Number(totalReservations[0].count)
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: 'ไม่สามารถดึงข้อมูลสถิติได้' });
    }
});





const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server API ready at http://localhost:${PORT}`);
});