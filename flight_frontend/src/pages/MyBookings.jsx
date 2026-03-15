import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Chip, CircularProgress, Divider, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlightIcon from '@mui/icons-material/Flight';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const airlineLogos = {
  'AirAsia': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/AirAsia_New_Logo.svg',
  'Thai Airways': 'https://vectorseek.com/wp-content/uploads/2023/09/Thai-Airways-International-Icon-Logo-Vector.svg-.png',
  'Nok Air': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Nokair_logo.jpg',
  'Thai Lion Air': 'https://upload.wikimedia.org/wikipedia/en/b/b5/Thai_Lion_Air_logo.svg',
  'Bangkok Airways': 'https://www.ktc.co.th/pub/media/online-travel-booking/partner-bangkok-airways.webp',
  'Thai Lion Air': 'https://www.gother.com/_next/image?url=https%3A%2F%2Fd3p9pa0orw8xnp.cloudfront.net%2Fimages%2Fairlines%2Flogo%2Fsl_logo296x188.png&w=640&q=100'
};

const defaultLogo = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';


function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // ถ้ายังไม่ล็อกอิน ให้เด้งกลับไปหน้า Login
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyBookings = async () => {
    try {
      // ส่ง u_id ไปถามหลังบ้านว่าคนนี้จองตั๋วอะไรไว้บ้าง
      const response = await axios.get('http://localhost:5001/api/my-bookings', {
        params: { u_id: user.u_id }
      });
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📍 ฟังก์ชันกดยกเลิกเที่ยวบิน
  const handleCancelBooking = async (seat_id) => {
    // 1. ถามเพื่อความชัวร์ก่อน (กันลูกค้าเผลอกดโดน)
    const isConfirm = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการ "ยกเลิก" เที่ยวบินนี้?\n(หากยกเลิกแล้วจะไม่สามารถกู้คืนได้)');
    
    if (!isConfirm) return;

    try {
      // 2. ส่งรหัสไปให้หลังบ้านอัปเดตสถานะ
      const response = await axios.post('http://localhost:5001/api/cancel-booking', { seat_id });
      
      if (response.data.success) {
        alert('ยกเลิกผู้โดยสารสำเร็จ');
        // 3. รีเฟรชข้อมูลในหน้าเว็บใหม่ เพื่อให้ป้ายสถานะเปลี่ยนเป็นสีแดง
        fetchMyBookings(); 
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert('เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#1976d2', color: 'white', py: 4, px: 2, display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="text" sx={{ color: 'white' }} startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
            กลับหน้าหลัก
          </Button>
          <Typography variant="h4" fontWeight="bold">🎫 ประวัติการจองตั๋วของฉัน</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress />
          </Box>
        ) : bookings.length === 0 ? (
          <Paper sx={{ textAlign: 'center', p: 5, borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">คุณยังไม่มีประวัติการจองเที่ยวบินครับ</Typography>
            <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/')}>ค้นหาเที่ยวบินเลย</Button>
          </Paper>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.res_id} sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
              <Box sx={{ backgroundColor: '#f8f9fa', px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">รหัสการจอง: <b>#{booking.res_id}</b></Typography>
                <Typography variant="body2" color="text.secondary">วันที่ทำรายการ: {booking.booking_date}</Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* โลโก้สายการบิน */}
                  <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                    <Box component="img" src={airlineLogos[booking.airline_name] || defaultLogo} alt={booking.airline_name}
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
                      sx={{ height: 50, objectFit: 'contain', mb: 1 }}
                    />
                    <Typography variant="body2" fontWeight="bold" color="primary">{booking.airline_name}</Typography>
                    <Typography variant="caption" color="text.secondary">เที่ยวบิน {booking.flight_number}</Typography>
                  </Grid>

                  {/* เวลาและเส้นทาง */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">{booking.departure_time}</Typography>
                        <Typography variant="body1">{booking.origin_code}</Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1, px: 2 }}>
                        <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>📅 {booking.travel_date}</Typography>
                        <Divider sx={{ my: 0.5 }}><FlightIcon sx={{ transform: 'rotate(90deg)', color: '#ccc' }} /></Divider>
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">{booking.arrival_time}</Typography>
                        <Typography variant="body1">{booking.destination_code}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* สถานะและที่นั่ง */}
                  <Grid item xs={12} sm={3} sx={{ textAlign: 'right', borderLeft: { sm: '1px solid #eee' }, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    
                    <Chip 
                      label={booking.detail_status === 'Confirmed' ? 'ยืนยันแล้ว' : booking.detail_status === 'Cancelled' ? 'ยกเลิกแล้ว' : booking.detail_status} 
                      color={booking.detail_status === 'Confirmed' ? 'success' : booking.detail_status === 'Cancelled' ? 'error' : 'warning'} 
                      sx={{ mb: 1, fontWeight: 'bold' }} 
                    />
                    <Typography variant="body2">ผู้โดยสาร: <b>{booking.pass_fname}</b></Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>ที่นั่ง: <b>{booking.seat_num || '-'}</b></Typography>

                    <Box sx={{ mt: 1, mb: 2, p: 1, backgroundColor: '#f0f4f8', borderRadius: 1, textAlign: 'left', width: '100%' }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        👜 กระเป๋า: <b>{booking.weight_Departure > 0 ? booking.weight_Departure : 0} / {booking.weight_Inbound > 0 ? booking.weight_Inbound : 0} กก.</b>
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        🍱 อาหาร: <b>{booking.food_status === 'Receive' ? 'รับอาหาร' : 'ไม่รับอาหาร'}</b>
                      </Typography>
                    </Box>
                    
                    {/* 📍 นำปุ่มพิมพ์ตั๋วกลับมาแล้ว! จัดให้อยู่ใน Box เดียวกับปุ่มยกเลิก */}
                    {booking.detail_status === 'Confirmed' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                        
                        {/* ปุ่มพิมพ์ตั๋วสีน้ำเงิน */}
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          fullWidth
                          onClick={() => handleCancelBooking(booking.res_id)}
                        >
                          🎟️ พิมพ์ตั๋ว
                        </Button>

                        {/* ปุ่มยกเลิกสีแดง */}
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          fullWidth
                          onClick={() => handleCancelBooking(booking.seat_id)}
                        >
                          ยกเลิกเที่ยวบิน
                        </Button>
                        
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </Container>
    </Box>
  );
}

export default MyBookings;