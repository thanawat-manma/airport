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
