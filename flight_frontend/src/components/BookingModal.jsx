import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Divider, Box,
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function BookingModal({ open, handleClose, flight, searchParams }) {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  // เตรียมข้อมูลผู้โดยสารเมื่อเปิด Modal
  useEffect(() => {
    if (open && searchParams) {
      const initialPassengers = Array.from({ length: searchParams.passengers }, () => ({
        firstName: '',
        lastName: '',
        phone: '',
        thaiId: '',
        weightDeparture: 0,  
        weightInbound: 0,    
        foodStatus: 'None',
        showAddons: false   
      }));
      setPassengers(initialPassengers);
    }
  }, [open, searchParams]);

  const handleChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  // 📍 ฟังก์ชันกดยืนยันเพื่อไปหน้าชำระเงิน (Design เดิม แต่เปลี่ยน Logic)
  const handleBookingConfirm = () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
      navigate('/login');
      return;
    }

    // ตรวจสอบความครบถ้วนของข้อมูลทุกคน
    for (let p of passengers) {
      if (!p.firstName || !p.lastName || !p.thaiId) {
        alert('กรุณากรอก ชื่อ นามสกุล และเลขบัตรประชาชนให้ครบทุกคน');
        return;
      }
      if (p.thaiId.length !== 13) {
        alert('เลขบัตรประชาชนต้องมี 13 หลัก');
        return;
      }
    }

    // 1. คำนวณราคาตั๋วพื้นฐาน
    const basePrice = flight.price || 1500; 
    const passengerCount = searchParams.passengers || 1;
    const classMultiplier = searchParams.flightClass === 2 ? 3 : 1;
    
    // 2. 📍 คำนวณราคาบริการเสริม (Add-ons) ของผู้โดยสาร "ทุกคน" รวมกัน
    let totalAddonsPrice = 0;
    
    passengers.forEach(p => {
      // บวกค่าน้ำหนักขาไป
      if (p.weightDeparture === 15) totalAddonsPrice += 500;
      else if (p.weightDeparture === 20) totalAddonsPrice += 800;
      else if (p.weightDeparture === 25) totalAddonsPrice += 1000;

      // บวกค่าน้ำหนักขากลับ
      if (p.weightInbound === 15) totalAddonsPrice += 500;
      else if (p.weightInbound === 20) totalAddonsPrice += 800;
      else if (p.weightInbound === 25) totalAddonsPrice += 1000;

      // บวกค่าอาหาร 
      if (p.foodStatus === 'Receive') totalAddonsPrice += 200; 
    });

    // 3. 📍 เอาราคาตั๋วตั้งต้น มารวมกับราคาบริการเสริม
    const finalTotalPrice = (basePrice * passengerCount * classMultiplier) + totalAddonsPrice;

    // แพ็กข้อมูลทั้งหมดส่งไปหน้า Payment
    const bookingData = {
      flight_id: flight.flight_id || flight.f_id,
      u_id: user.u_id,
      totalPrice: finalTotalPrice, // ตอนนี้ราคานี้รวม Add-ons แล้ว!
      allPassengers: passengers 
    };

    handleClose();
    navigate('/payment', {
      state: { bookingData, flight, searchParams }
    });
  };

  if (!flight) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
        กรอกข้อมูลผู้โดยสาร
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {/* กล่องสรุปเที่ยวบิน (Design เดิม) */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f7fa', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            เที่ยวบิน: {flight.airline?.name} ({flight.flight_number})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            เส้นทาง: {flight.origin?.name} ➔ {flight.destination?.name}
          </Typography>
        </Box>

        {/* วนลูปสร้างฟอร์มผู้โดยสาร (Design เดิมเป๊ะๆ) */}
        {passengers.map((passenger, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 1.5, fontWeight: 'bold' }}>
              ผู้โดยสารคนที่ {index + 1}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="ชื่อ" value={passenger.firstName} onChange={(e) => handleChange(index, 'firstName', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="นามสกุล" value={passenger.lastName} onChange={(e) => handleChange(index, 'lastName', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="เลขบัตรประชาชน 13 หลัก" inputProps={{ maxLength: 13 }} value={passenger.thaiId} onChange={(e) => handleChange(index, 'thaiId', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="เบอร์โทรศัพท์" value={passenger.phone} onChange={(e) => handleChange(index, 'phone', e.target.value)} />
              </Grid>

              {/* ปุ่มโชว์ Add-ons (Design เดิม) */}
              <Grid item xs={12}>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => handleChange(index, 'showAddons', !passenger.showAddons)}
                  sx={{ fontWeight: 'bold' }}
                >
                  {passenger.showAddons ? '➖ ซ่อนบริการเสริม' : '➕ เพิ่มบริการเสริม (กระเป๋าสัมภาระ, อาหาร)'}
                </Button>
              </Grid>

              {passenger.showAddons && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px dashed #ccc' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>กระเป๋า (ขาไป)</InputLabel>
                          <Select value={passenger.weightDeparture} label="กระเป๋า (ขาไป)" onChange={(e) => handleChange(index, 'weightDeparture', e.target.value)}>
                            <MenuItem value={0}>ไม่โหลด (ฟรี)</MenuItem>
                            <MenuItem value={15.00}>15 กก. (+฿500)</MenuItem>
                            <MenuItem value={20.00}>20 กก. (+฿800)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>กระเป๋า (ขากลับ)</InputLabel>
                          <Select value={passenger.weightInbound} label="กระเป๋า (ขากลับ)" onChange={(e) => handleChange(index, 'weightInbound', e.target.value)}>
                            <MenuItem value={0}>ไม่โหลด (ฟรี)</MenuItem>
                            <MenuItem value={15.00}>15 กก. (+฿500)</MenuItem>
                            <MenuItem value={20.00}>20 กก. (+฿800)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>อาหาร</InputLabel>
                          <Select value={passenger.foodStatus} label="อาหาร" onChange={(e) => handleChange(index, 'foodStatus', e.target.value)}>
                            <MenuItem value="None">ไม่รับอาหาร</MenuItem>
                            <MenuItem value="Receive">รับอาหาร</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
            {index < passengers.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 'bold' }}>ยกเลิก</Button>
        <Button
          onClick={handleBookingConfirm}
          variant="contained"
          color="primary"
          size="large"
          sx={{ fontWeight: 'bold' }}
        >
          ไปหน้าชำระเงิน
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookingModal;


// import React, { useState, useEffect } from 'react';
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Button, TextField, Grid, Typography, Divider, Box,
//   FormControl, InputLabel, Select, MenuItem 
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// function BookingModal({ open, handleClose, flight, searchParams }) {
//   const navigate = useNavigate();
//   const [passengers, setPassengers] = useState([]);
//   const user = JSON.parse(localStorage.getItem('user'));

//   useEffect(() => {
//     if (open && searchParams) {
//       const initialPassengers = Array.from({ length: searchParams.passengers }, () => ({
//         firstName: '',
//         lastName: '',
//         phone: '',
//         thaiId: '',
//         weightDeparture: 0,  
//         weightInbound: 0,    
//         foodStatus: 'None',
//         showAddons: false   
//       }));
//       setPassengers(initialPassengers);
//     }
//   }, [open, searchParams]);

//   const handleChange = (index, field, value) => {
//     const newPassengers = [...passengers];
//     newPassengers[index][field] = value;
//     setPassengers(newPassengers);
//   };

//   const handleBookingConfirm = () => {
//     if (!user) {
//       alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
//       navigate('/login');
//       return;
//     }

//     // ตรวจสอบข้อมูลทุกคน
//     for (let p of passengers) {
//       if (!p.firstName || !p.lastName || !p.thaiId) {
//         alert('กรุณากรอก ชื่อ นามสกุล และเลขบัตรประชาชนให้ครบทุกคน');
//         return;
//       }
//       if (p.thaiId.length !== 13) {
//         alert('เลขบัตรประชาชนต้องมี 13 หลัก');
//         return;
//       }
//     }

//     // คำนวณราคาสุทธิ
//     const basePrice = flight.price || 1500; 
//     const passengerCount = passengers.length;
//     const classMultiplier = searchParams.flightClass === 2 ? 3 : 1;
    
//     // คำนวณราคาส่วนเสริม (ถ้ามี)
//     let addonsPrice = 0;
//     passengers.forEach(p => {
//         if(p.weightDeparture === 15) addonsPrice += 500;
//         if(p.weightDeparture === 20) addonsPrice += 800;
//         if(p.weightDeparture === 25) addonsPrice += 1000;
//         // ... ขากลับ ...
//     });

//     const finalTotalPrice = (basePrice * passengerCount * classMultiplier) + addonsPrice;

//     const bookingData = {
//       allPassengers: passengers,
//       flight_id: flight.flight_id,
//       u_id: user.u_id,
//       totalPrice: finalTotalPrice,
//       allPassengers: passengers // 📍 ส่งข้อมูลผู้โดยสารทุกคนไปที่หน้า Payment
//     };

//     handleClose();

//     navigate('/payment', {
//       state: { bookingData, flight, searchParams }
//     });
//   };

//   if (!flight) return null;

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
//         กรอกข้อมูลผู้โดยสาร
//       </DialogTitle>
      
//       <DialogContent sx={{ mt: 2 }}>
//         <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f7fa', borderRadius: 2 }}>
//           <Typography variant="subtitle1" fontWeight="bold">
//             เที่ยวบิน: {flight.airline?.name} ({flight.flight_number})
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             เส้นทาง: {flight.origin?.name} ➔ {flight.destination?.name}
//           </Typography>
//         </Box>

//         {passengers.map((passenger, index) => (
//           <Box key={index} sx={{ mb: 3 }}>
//             <Typography variant="h6" color="primary" sx={{ mb: 1.5, fontWeight: 'bold' }}>
//               ผู้โดยสารคนที่ {index + 1}
//             </Typography>
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={6}>
//                 <TextField fullWidth label="ชื่อ" value={passenger.firstName} onChange={(e) => handleChange(index, 'firstName', e.target.value)} />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField fullWidth label="นามสกุล" value={passenger.lastName} onChange={(e) => handleChange(index, 'lastName', e.target.value)} />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField fullWidth label="เลขบัตรประชาชน 13 หลัก" inputProps={{ maxLength: 13 }} value={passenger.thaiId} onChange={(e) => handleChange(index, 'thaiId', e.target.value)} />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField fullWidth label="เบอร์โทรศัพท์" value={passenger.phone} onChange={(e) => handleChange(index, 'phone', e.target.value)} />
//               </Grid>

//               <Grid item xs={12}>
//                 <Button variant="text" size="small" onClick={() => handleChange(index, 'showAddons', !passenger.showAddons)} sx={{ fontWeight: 'bold' }}>
//                   {passenger.showAddons ? '➖ ซ่อนบริการเสริม' : '➕ เพิ่มบริการเสริม'}
//                 </Button>
//               </Grid>

//               {passenger.showAddons && (
//                 <Grid item xs={12}>
//                   <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px dashed #ccc' }}>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} sm={4}>
//                         <FormControl fullWidth size="small">
//                           <InputLabel>กระเป๋า (ขาไป)</InputLabel>
//                           <Select value={passenger.weightDeparture} label="กระเป๋า (ขาไป)" onChange={(e) => handleChange(index, 'weightDeparture', e.target.value)}>
//                             <MenuItem value={0}>ไม่โหลด (ฟรี)</MenuItem>
//                             <MenuItem value={15.00}>15 กก.</MenuItem>
//                             <MenuItem value={20.00}>20 กก.</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>
//                       {/* ... เพิ่มส่วนขาไป/ขากลับ/อาหาร ตามเดิม ... */}
//                       <Grid item xs={12} sm={4}>
//                         <FormControl fullWidth size="small">
//                             <InputLabel>อาหาร</InputLabel>
//                             <Select value={passenger.foodStatus} label="อาหาร" onChange={(e) => handleChange(index, 'foodStatus', e.target.value)}>
//                                 <MenuItem value="None">ไม่รับอาหาร</MenuItem>
//                                 <MenuItem value="Receive">รับอาหาร</MenuItem>
//                             </Select>
//                         </FormControl>
//                       </Grid>
//                     </Grid>
//                   </Box>
//                 </Grid>
//               )}
//             </Grid>
//             {index < passengers.length - 1 && <Divider sx={{ mt: 3 }} />}
//           </Box>
//         ))}
//       </DialogContent>

//       <DialogActions sx={{ p: 3, pt: 0 }}>
//         <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 'bold' }}>ยกเลิก</Button>
//         <Button onClick={handleBookingConfirm} variant="contained" color="primary" size="large" sx={{ fontWeight: 'bold' }}>
//           ไปหน้าชำระเงิน
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// export default BookingModal;




// import React, { useState, useEffect } from 'react';
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Button, TextField, Grid, Typography, Divider, Box,
//   FormControl, InputLabel, Select, MenuItem 
// } from '@mui/material';
// import axios from 'axios';

// import { useNavigate } from 'react-router-dom';

// function BookingModal({ open, handleClose, flight, searchParams }) {
//   // state สำหรับเก็บข้อมูลผู้โดยสารเป็น Array (รองรับหลายคน)
//   const navigate = useNavigate();
//   const [passengers, setPassengers] = useState([]);


//   // ดึงข้อมูล User เพื่อเอา u_id ไปใช้จอง
//   const user = JSON.parse(localStorage.getItem('user'));

//   // 📍 State สำหรับเก็บค่าบริการเสริม (Add-ons)
//   // const [weightDeparture, setWeightDeparture] = useState(0);
//   // const [weightInbound, setWeightInbound] = useState(0);
//   // const [foodStatus, setFoodStatus] = useState('None');

//   // ฟังก์ชันนี้จะทำงานทุกครั้งที่หน้าต่างนี้ถูกเปิดขึ้นมา
//   useEffect(() => {
//     if (open && searchParams) {
//       // สร้างช่องกรอกข้อมูลว่างๆ เตรียมไว้ตามจำนวนคนที่เลือก
//       const initialPassengers = Array.from({ length: searchParams.passengers }, () => ({
//         firstName: '',
//         lastName: '',
//         phone: '',
//         thaiId: '',
//         weightDeparture: 0,  
//         weightInbound: 0,    
//         foodStatus: 'None',
//         showAddons: false   
//       }));
//       setPassengers(initialPassengers);
//     }
//   }, [open, searchParams]);

//   const handleChange = (index, field, value) => {
//     const newPassengers = [...passengers];
//     newPassengers[index][field] = value;
//     setPassengers(newPassengers);
//   };

//   // ฟังก์ชันกดยืนยันการจอง
//     const handleBookingConfirm = () => {
//     if (!user) {
//       alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
//       navigate('/login');
//       return;
//     }

//     for (let p of passengers) {
//       if (!p.firstName || !p.lastName || !p.thaiId) {
//         alert('กรุณากรอก ชื่อ นามสกุล และเลขบัตรประชาชนให้ครบทุกคน');
//         return;
//       }
//       if (p.thaiId.length !== 13) {
//         alert('เลขบัตรประชาชนต้องมี 13 หลัก');
//         return;
//       }
//     }

//     if (!flight) {
//       alert('ไม่พบข้อมูลเที่ยวบิน');
//       return;
//     }

//     // 📍 คำนวณราคาสุทธิ เพื่อส่งไปโชว์หน้า Payment
//     const basePrice = flight.price || 1500; 
//     const passengerCount = searchParams.passengers || 1;
//     const classMultiplier = searchParams.flightClass === 2 ? 3 : 1;
//     const finalTotalPrice = basePrice * passengerCount * classMultiplier;

//     const bookingData = {
//       flight_id: flight.flight_id || flight.f_id,
//       passengerName: `${passengers[0].firstName} ${passengers[0].lastName}`,
//       passengerPhone: passengers[0].phone,
//       passengerIdNumber: passengers[0].thaiId,
//       u_id: user.u_id,
//       weight_Departure: passengers[0].weightDeparture,
//       weight_Inbound: passengers[0].weightInbound,
//       food_status: passengers[0].foodStatus,
//       totalPrice: finalTotalPrice, // 📍 เปลี่ยนชื่อตัวแปรให้ตรงกับที่หน้า Payment ใช้
//       allPassengers: passengers // แนบข้อมูลทุกคนไปเผื่อไว้
//     };

//     handleClose();

//     // 📍 จุดสำคัญ: หอบ flight และ searchParams ไปด้วย เพื่อป้องกันหน้าจอดำ!
//     navigate('/payment', {
//       state: { bookingData, flight, searchParams }
//     });
//   };

//   // ฟังก์ชันอัปเดตข้อมูลเมื่อลูกค้าพิมพ์ข้อความ
//   const handleSubmit = async () => {
//     // 1. ตรวจสอบว่ากรอกข้อมูลครบไหม
//     for (let p of passengers) {
//       if (!p.firstName || !p.lastName || !p.thaiId) {
//         alert('กรุณากรอก ชื่อ, นามสกุล และ เลขบัตรประชาชน ให้ครบทุกคนครับ');
//         return;
//       }
//     }

//     try {
//       // 2. วนลูปส่งข้อมูลไปให้ Backend บันทึกลง Database
//       for (let p of passengers) {
//         const payload = {
//           flight_id: flight.flight_id,
//           passengerName: `${p.firstName} ${p.lastName}`,
//           passengerPhone: p.phone,
//           passengerIdNumber: p.thaiId,
//           u_id: user.u_id,
//           // 📍 ดึงค่าบริการเสริมของแต่ละคนมาใส่
//           weight_Departure: p.weightDeparture,
//           weight_Inbound: p.weightInbound,
//           food_status: p.foodStatus
//         };
        
//         await axios.post('http://localhost:5001/api/book', payload);
//       }

//       alert('🎉 จองเที่ยวบินสำเร็จเรียบร้อยแล้ว!');
//       handleClose(); // ปิดหน้าต่าง Modal
//     } catch (error) {
//       console.error(error);
//       alert('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
//     }
//   };

//   if (!flight) return null;

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
//         กรอกข้อมูลผู้โดยสาร
//       </DialogTitle>
      
//       <DialogContent sx={{ mt: 2 }}>
//         {/* กล่องสรุปเที่ยวบินด้านบน */}
//         <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f7fa', borderRadius: 2 }}>
//           <Typography variant="subtitle1" fontWeight="bold">
//             เที่ยวบิน: {flight.airline?.name} ({flight.flight_number})
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             เส้นทาง: {flight.origin?.name} ➔ {flight.destination?.name}
//           </Typography>
//         </Box>

//         {/* วนลูปสร้างฟอร์มตามจำนวนผู้โดยสาร */}
//         {passengers.map((passenger, index) => (
//           <Box key={index} sx={{ mb: 3 }}>
//             <Typography variant="h6" color="primary" sx={{ mb: 1.5, fontWeight: 'bold' }}>
//               ผู้โดยสารคนที่ {index + 1}
//             </Typography>
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth label="ชื่อ (ภาษาอังกฤษ หรือ ไทย)"
//                   value={passenger.firstName}
//                   onChange={(e) => handleChange(index, 'firstName', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth label="นามสกุล"
//                   value={passenger.lastName}
//                   onChange={(e) => handleChange(index, 'lastName', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth label="เลขบัตรประชาชน 13 หลัก"
//                   inputProps={{ maxLength: 13 }}
//                   value={passenger.thaiId}
//                   onChange={(e) => handleChange(index, 'thaiId', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth label="เบอร์โทรศัพท์"
//                   value={passenger.phone}
//                   onChange={(e) => handleChange(index, 'phone', e.target.value)}
//                 />
//               </Grid>

//               {/* 📍 เริ่มปุ่มกดซ่อน/โชว์ บริการเสริม */}
//               <Grid item xs={12}>
//                 <Button 
//                   variant="text" 
//                   size="small" 
//                   onClick={() => handleChange(index, 'showAddons', !passenger.showAddons)}
//                   sx={{ fontWeight: 'bold' }}
//                 >
//                   {passenger.showAddons ? '➖ ซ่อนบริการเสริม' : '➕ เพิ่มบริการเสริม (กระเป๋าสัมภาระ, อาหาร)'}
//                 </Button>
//               </Grid>

//               {/* 📍 กล่องนี้จะโชว์ก็ต่อเมื่อ passenger.showAddons เป็น true */}
//               {passenger.showAddons && (
//                 <Grid item xs={12}>
//                   <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px dashed #ccc' }}>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} sm={4}>
//                         <FormControl fullWidth size="small">
//                           <InputLabel>กระเป๋า (ขาไป)</InputLabel>
//                           <Select
//                             value={passenger.weightDeparture}
//                             label="กระเป๋า (ขาไป)"
//                             onChange={(e) => handleChange(index, 'weightDeparture', e.target.value)}
//                           >
//                             <MenuItem value={0}>ไม่โหลด (ฟรี)</MenuItem>
//                             <MenuItem value={15.00}>15 กก. (+฿500)</MenuItem>
//                             <MenuItem value={20.00}>20 กก. (+฿800)</MenuItem>
//                             <MenuItem value={25.00}>25 กก. (+฿1000)</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>

//                       <Grid item xs={12} sm={4}>
//                         <FormControl fullWidth size="small">
//                           <InputLabel>กระเป๋า (ขากลับ)</InputLabel>
//                           <Select
//                             value={passenger.weightInbound}
//                             label="กระเป๋า (ขากลับ)"
//                             onChange={(e) => handleChange(index, 'weightInbound', e.target.value)}
//                           >
//                             <MenuItem value={0}>ไม่โหลด (ฟรี)</MenuItem>
//                             <MenuItem value={15.00}>15 กก. (+฿500)</MenuItem>
//                             <MenuItem value={20.00}>20 กก. (+฿800)</MenuItem>
//                             <MenuItem value={25.00}>25 กก. (+฿1000)</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>

//                       <Grid item xs={12} sm={4}>
//                         <FormControl fullWidth size="small">
//                           <InputLabel>อาหารบนเครื่อง</InputLabel>
//                           <Select
//                             value={passenger.foodStatus}
//                             label="อาหารบนเครื่อง"
//                             onChange={(e) => handleChange(index, 'foodStatus', e.target.value)}
//                           >
//                             {/* 📍 แก้ตัวเลือกอาหารให้เหลือแค่ 2 อัน (รับ / ไม่รับ) */}
//                             <MenuItem value="None">ไม่รับอาหาร</MenuItem>
//                             <MenuItem value="Receive">รับอาหาร</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>
//                     </Grid>
//                   </Box>
//                 </Grid>
//               )}
//               {/* 📍 จบส่วนบริการเสริม */}

//             </Grid>
//             {/* เส้นคั่นระหว่างคน */}
//             {index < passengers.length - 1 && <Divider sx={{ mt: 3 }} />}
//           </Box>
//         ))}

//       </DialogContent>

//         <DialogActions sx={{ p: 3, pt: 0 }}>
//         <Button onClick={handleClose} color="inherit">
//           ยกเลิก
//         </Button>
//         <Button
//           onClick={handleBookingConfirm}
//           variant="contained"
//           color="primary"
//           size="large"
//         >
//           ไปหน้าชำระเงิน
//         </Button>
//       </DialogActions>

//       <DialogActions sx={{ p: 3, pt: 0 }}>
//         <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 'bold' }}>ยกเลิก</Button>
//         <Button onClick={handleSubmit} variant="contained" color="primary" size="large" sx={{ fontWeight: 'bold' }}>
//           ยืนยันการจองตั๋ว
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// export default BookingModal;