import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Grid, TextField, Button, Divider, Card, CardContent, MenuItem } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentIcon from '@mui/icons-material/Payment';
import FlightIcon from '@mui/icons-material/Flight'; 
import axios from 'axios';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const bookingData = location.state?.bookingData;
  const flight = location.state?.flight; 
  const searchParams = location.state?.searchParams;

  // 📍 State เก็บค่าวิธีชำระเงิน
  const [paymentType, setPaymentType] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentTime, setPaymentTime] = useState('');

  useEffect(() => {
    if (!bookingData || !flight) {
      alert('ไม่พบข้อมูลเที่ยวบิน กรุณาทำรายการใหม่อีกครั้ง');
      navigate('/');
      return;
    }

    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
    
    setPaymentDate(localISOTime.split('T')[0]);
    setPaymentTime(localISOTime.split('T')[1]);
  }, [bookingData, flight, navigate]);

  const handleConfirmPayment = async () => {
    if (!paymentType || !paymentDate || !paymentTime) {
      alert('กรุณาเลือกวิธีชำระเงิน และกรอกวัน-เวลาให้ครบถ้วน');
      return;
    }

    try {
      // 📍 แพ็กข้อมูลทั้งหมด (รวมผู้โดยสารทุกคน) ส่งไปก้อนเดียว!
      const payload = {
          flight_id: bookingData.flight_id,
          u_id: bookingData.u_id,
          payment_type: paymentType,
          payment_date: paymentDate,
          payment_time: paymentTime,
          allPassengers: bookingData.allPassengers // 📍 ส่ง Array ของทุกคนไปเลย
      };
      
      // ยิง API ครั้งเดียวจบ!
      await axios.post('http://localhost:5001/api/book', payload);

      alert('🎉 จองเที่ยวบินสำเร็จเรียบร้อย!');
      navigate('/my-bookings'); 
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการจอง');
    }
  };

  if (!bookingData || !flight) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa' }}>
      <Typography variant="h6" gutterBottom>⚠️ ไม่พบข้อมูลการจอง (Session Expired)</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>กลับไปหน้าหลักเพื่อจองใหม่</Button>
    </Box>
  );
}

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 10, pt: 5 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          
          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#1976d2' }}>
                <PaymentIcon sx={{ fontSize: 36, mr: 2 }} />
                <Typography variant="h5" fontWeight="bold">รายละเอียดการชำระเงิน</Typography>
              </Box>
              <Divider sx={{ mb: 4 }} />

              <Grid container spacing={3}>
                
                {/* 📍 Dropdown เลือกวิธีชำระเงิน */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="วิธีชำระเงิน"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    SelectProps={{
                      displayEmpty: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="" disabled>
                      <em style={{ color: '#999' }}>เลือกวิธีชำระเงิน</em>
                    </MenuItem>
                    
                    {/* 📍 ใส่ value เป็นภาษาไทยตรงนี้เลย พอเลือกปุ๊บมันจะส่งคำนี้ไปเข้า Database */}
                    <MenuItem value="Credit card">💳 Credit card</MenuItem>
                    <MenuItem value="PromptPay">📱 PromptPay</MenuItem>

                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="วันที่ชำระเงิน"
                    InputLabelProps={{ shrink: true }}
                    value={paymentDate}
                    InputProps={{
                      readOnly: true, // ป้องกันการพิมพ์หรือเลือกวันที่
                    }}
                    sx={{ backgroundColor: '#f0f0f0' }} // เพิ่มสีพื้นหลังเล็กน้อยเพื่อให้รู้ว่าแก้ไขไม่ได้
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="เวลาที่ชำระเงิน"
                    InputLabelProps={{ shrink: true }}
                    value={paymentTime}
                    InputProps={{
                      readOnly: true, // ป้องกันการแก้ไขเวลา
                    }}
                    sx={{ backgroundColor: '#f0f0f0' }} // เพิ่มสีพื้นหลังเล็กน้อยเพื่อให้รู้ว่าแก้ไขไม่ได้
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>สรุปเที่ยวบิน</Typography>
              <Card sx={{ backgroundColor: '#f9fafb', border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">{flight.origin?.name || flight.origin?.code}</Typography>
                      <Typography variant="body2" color="text.secondary">{flight.travel_date}</Typography>
                      <Typography variant="body2" fontWeight="bold">{flight.departure_time_formatted}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', px: 2 }}>
                      <Typography variant="caption" color="text.secondary">บินตรง</Typography>
                      <Divider sx={{ my: 0.5 }}><FlightIcon sx={{ transform: 'rotate(90deg)', color: '#ccc', fontSize: 16 }} /></Divider>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="bold">{flight.destination?.name || flight.destination?.code}</Typography>
                      <Typography variant="body2" color="text.secondary">{flight.travel_date}</Typography>
                      <Typography variant="body2" fontWeight="bold">{flight.arrival_time_formatted}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                    <Typography variant="body2" fontWeight="bold" color="error" sx={{ mr: 1 }}>
                      {flight.airline?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • {searchParams?.flightClass === 1 ? 'ชั้นประหยัด' : 'ชั้นธุรกิจ'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>สรุปราคา</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1">ราคาที่ชำระ</Typography>
                <Typography variant="h5" fontWeight="bold" color="#ff6f00">
                  THB {bookingData?.totalPrice ? bookingData.totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00'}
                </Typography>
              </Box>
            </Paper>

            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              onClick={handleConfirmPayment}
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', mb: 2, borderRadius: 2 }}
            >
              ยืนยันการชำระเงิน
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              fullWidth 
              size="large"
              onClick={() => navigate('/')}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: 2 }}
            >
              ยกเลิกและกลับไปหน้าหลัก
            </Button>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}

export default PaymentPage;