import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminFlightManage from './pages/AdminFlightManage';
import PaymentPage from './pages/PaymentPage';
import AdminBookings from './pages/AdminBookings';
import TicketPage from './pages/TicketPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        
        <Route path="/my-bookings" element={<MyBookings />} />

        <Route path="/payment" element={<PaymentPage />} />

        <Route path="/ticket" element={<TicketPage />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/add-flight" element={<AdminFlightManage />} />

        <Route path="/admin/bookings" element={<AdminBookings />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;



























// import React, { useState, useEffect } from 'react';
// import { 
//   Container, Typography, Box, Card, CardContent, Grid, Button, Divider, CircularProgress
// } from '@mui/material';
// import FlightIcon from '@mui/icons-material/Flight';
// import axios from 'axios';
// import SearchWidget from './components/SearchWidget';
// import BookingModal from './components/BookingModal';

// function App() {
//   const [flights, setFlights] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // สถานะเก็บเงื่อนไขการค้นหา (ค่าเริ่มต้น)
//   const [searchParams, setSearchParams] = useState({
//     passengers: 1,
//     flightClass: 1 // 1 = Economy, 2 = Business
//   });

//   // ฟังก์ชันดึงข้อมูลเที่ยวบินจาก API (Node.js)
//   const fetchFlights = async () => {
//     setLoading(true);
//     try {
//       // ยิง API ไปที่หลังบ้านพอร์ต 5001 ของเรา
//       const response = await axios.get('http://localhost:5001/api/flights');
//       if (response.data.success) {
//         setFlights(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching flights:", error);
//       alert("ไม่สามารถดึงข้อมูลเที่ยวบินได้ กรุณาตรวจสอบว่าเปิด Server Node.js หรือยัง");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ดึงข้อมูลครั้งแรกเมื่อเปิดเว็บ
//   useEffect(() => {
//     fetchFlights();
//   }, []);

//   // เมื่อผู้ใช้กดปุ่ม "ค้นหา" ใน SearchWidget
//   const handleSearch = (data) => {
//     console.log("ข้อมูลการค้นหา:", data);
//     setSearchParams(data);
//     // ในอนาคตเราสามารถเอา data.origin, data.destination ไป Filter เที่ยวบินได้
//     // แต่ตอนนี้ MVP เราดึงมาโชว์ทั้งหมดก่อน แล้วเปลี่ยนราคาตาม Class และจำนวนคนครับ
//   };

//   // ฟังก์ชันคำนวณราคา (ราคาฐาน x จำนวนคน x ตัวคูณชั้นโดยสาร)
//   const calculatePrice = (basePrice) => {
//     const classMultiplier = searchParams.flightClass === 2 ? 3 : 1; // Business แพงกว่า 3 เท่า (จำลอง)
//     return basePrice * searchParams.passengers * classMultiplier;
//   };

//   // ควบคุมการเปิด/ปิด ฟอร์ม
//   const [selectedFlight, setSelectedFlight] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ฟังก์ชันเปิด Modal พร้อมส่งข้อมูลเที่ยวบินที่เลือกไปให้
//   const handleOpenModal = (flight) => {
//     setSelectedFlight(flight);
//     setIsModalOpen(true);
//   };

//   return (
//     <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 10 }}>
//       {/* ส่วนหัวเว็บ (Header) */}
//       <Box sx={{ backgroundColor: '#1976d2', color: 'white', py: 6, textAlign: 'center' }}>
//         <Typography variant="h3" fontWeight="bold" gutterBottom>
//           อุ่นใจทุกการเดินทางกับ FlightBooking
//         </Typography>
//         <Typography variant="h6">
//           ค้นหาเที่ยวบินราคาประหยัด จองง่าย จ่ายสะดวก
//         </Typography>
//       </Box>

//       <Container maxWidth="lg" sx={{ mt: -5 }}>
//         {/* กล่องค้นหาเที่ยวบิน */}
//         <SearchWidget onSearch={handleSearch} />

//         {/* ผลลัพธ์การค้นหา */}
//         <Box sx={{ mt: 5 }}>
//           <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
//             เที่ยวบินที่พร้อมให้บริการ
//           </Typography>

//           {loading ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
//               <CircularProgress />
//             </Box>
//           ) : flights.length === 0 ? (
//             <Typography align="center" color="text.secondary">ไม่พบเที่ยวบิน</Typography>
//           ) : (
//             // วนลูปสร้างการ์ดเที่ยวบิน
//             flights.map((flight) => (
//               <Card key={flight.flight_id} sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
//                 <CardContent>
//                   <Grid container spacing={2} alignItems="center">
                    
//                     {/* ข้อมูลสายการบิน */}
//                     <Grid item xs={12} md={3}>
//                       <Typography variant="h6" fontWeight="bold" color="primary">
//                         {flight.airline?.name}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         เที่ยวบิน {flight.flight_number}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         {flight.airplane?.model}
//                       </Typography>
//                     </Grid>

//                     {/* เวลาและสนามบิน */}
//                     <Grid item xs={12} md={5}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Box sx={{ textAlign: 'center' }}>
//                           <Typography variant="h5" fontWeight="bold">{flight.departure_time_formatted}</Typography>
//                           <Typography variant="body1">{flight.origin?.code}</Typography>
//                         </Box>
                        
//                         <Box sx={{ textAlign: 'center', flexGrow: 1, px: 2 }}>
//                           <Typography variant="caption" color="text.secondary">บินตรง</Typography>
//                           <Divider sx={{ my: 1 }}>
//                             <FlightIcon sx={{ transform: 'rotate(90deg)', color: '#ccc' }} />
//                           </Divider>
//                         </Box>

//                         <Box sx={{ textAlign: 'center' }}>
//                           <Typography variant="h5" fontWeight="bold">{flight.arrival_time_formatted}</Typography>
//                           <Typography variant="body1">{flight.destination?.code}</Typography>
//                         </Box>
//                       </Box>
//                     </Grid>

//                     {/* ราคาและปุ่มจอง */}
//                     <Grid item xs={12} md={4} sx={{ textAlign: 'right', borderLeft: { md: '1px solid #eee' } }}>
//                       <Typography variant="caption" color="text.secondary">
//                         ราคาสำหรับ {searchParams.passengers} ท่าน ({searchParams.flightClass === 1 ? 'Economy' : 'Business'})
//                       </Typography>
//                       <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff6f00', my: 1 }}>
//                         ฿{calculatePrice(flight.price).toLocaleString('th-TH')}
//                       </Typography>
//                       <Button 
//                         variant="contained" 
//                         color="primary" 
//                         size="large"
//                         sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
//                         onClick={() => handleOpenModal(flight)}
//                       >
//                         จองเที่ยวบินนี้
//                       </Button>
//                     </Grid>

//                   </Grid>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </Box>

//         {/* วาง BookingModal */}
//         <BookingModal 
//           open={isModalOpen} 
//           handleClose={() => setIsModalOpen(false)} 
//           flight={selectedFlight}
//           searchParams={searchParams}
//         />
//       </Container>
//     </Box>
//   );
// }

// export default App;