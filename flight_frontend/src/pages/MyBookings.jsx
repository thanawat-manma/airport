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
  const handleCancelBooking = async (res_id) => {
    // 1. ถามเพื่อความชัวร์ก่อน (กันลูกค้าเผลอกดโดน)
    const isConfirm = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการ "ยกเลิก" เที่ยวบินนี้?\n(หากยกเลิกแล้วจะไม่สามารถกู้คืนได้)');

    if (!isConfirm) return;

    try {
      // 2. ส่งรหัสไปให้หลังบ้านอัปเดตสถานะ
      const response = await axios.post('http://localhost:5001/api/cancel-booking', { res_id });

      if (response.data.success) {
        alert('ยกเลิกเที่ยวบินสำเร็จ');
        // 3. รีเฟรชข้อมูลในหน้าเว็บใหม่ เพื่อให้ป้ายสถานะเปลี่ยนเป็นสีแดง
        fetchMyBookings();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert('เกิดข้อผิดพลาดในการยกเลิกเที่ยวบิน');
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

      {/* 📍 ปรับ container เป็น lg ให้กว้างเท่าหน้าแรก */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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
              {/* แถบหัวการ์ด (รหัสการจอง) */}
              <Box sx={{ backgroundColor: '#f8f9fa', px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">รหัสการจอง: <b>#{booking.res_id}</b></Typography>
                <Typography variant="body2" color="text.secondary">วันที่ทำรายการ: {booking.booking_date}</Typography>
              </Box>

              {/* 📍 เพิ่ม p: 3 ให้ขอบในกว้างขึ้น */}
              <CardContent sx={{ p: 3 }}>
                {/* 📍 ปรับ spacing และ justifyContent */}
                <Grid container spacing={3} alignItems="center" justifyContent="space-between">

                  {/* ส่วนที่ 1: โลโก้สายการบิน (md={3}) - ปรับให้จัดเรียงแนวนอนสวยๆ */}
                  <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src={airlineLogos[booking.airline_name] || defaultLogo}
                      alt={booking.airline_name}
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'contain',
                        backgroundColor: '#fff',
                        borderRadius: 1,
                        p: 0.5
                      }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary" sx={{ lineHeight: 1 }}>
                        {booking.airline_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        เที่ยวบิน {booking.flight_number}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* ส่วนที่ 2: เวลาและเส้นทาง (md={5}) */}
                  <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                        <Typography variant="h5" fontWeight="bold">{booking.departure_time}</Typography>
                        <Typography variant="body1" color="text.secondary">{booking.origin_code}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flexGrow: 1, px: 3 }}>
                        <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>📅 {booking.travel_date}</Typography>
                        <Divider sx={{ my: 1 }}><FlightIcon sx={{ transform: 'rotate(90deg)', color: '#ccc' }} /></Divider>
                      </Box>
                      <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                        <Typography variant="h5" fontWeight="bold">{booking.arrival_time}</Typography>
                        <Typography variant="body1" color="text.secondary">{booking.destination_code}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* ส่วนที่ 3: สถานะและที่นั่ง (md={4}) - 📍 ใช้ Flexbox จัดการความกว้างและจัดชิดขวา */}
                  <Grid item xs={12} md={4}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: { xs: 'flex-start', md: 'flex-end' },
                      borderLeft: { md: '1px solid #eee' },
                      pl: { md: 4 },
                      textAlign: { xs: 'left', md: 'right' }
                    }}
                  >
                    {/* สถานะการจอง */}
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, width: '100%', mb: 1 }}>
                      <Chip
                        label={booking.res_status === 'Confirmed' ? 'ยืนยันแล้ว' : booking.res_status === 'Cancelled' ? 'ยกเลิกแล้ว' : booking.res_status}
                        color={booking.res_status === 'Confirmed' ? 'success' : booking.res_status === 'Cancelled' ? 'error' : 'warning'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    {/* ข้อมูลผู้โดยสาร */}
                    <Typography variant="body2">ผู้โดยสาร: <b>{booking.pass_fname}</b></Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>ที่นั่ง: <b>{booking.seat_num || '-'}</b></Typography>

                    {/* กล่องบริการเสริม (Add-ons) ให้กว้างเต็มพื้นที่ของคอลัมน์นี้ */}
                    <Box sx={{ mt: 1, mb: 2, p: 1.5, backgroundColor: '#f0f4f8', borderRadius: 1, textAlign: 'left', width: '100%' }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        👜 กระเป๋า (ไป-กลับ): <b>{booking.weight_Departure > 0 ? booking.weight_Departure : 0} / {booking.weight_Inbound > 0 ? booking.weight_Inbound : 0} กก.</b>
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        🍱 อาหารบนเครื่อง: <b>{booking.food_status === 'Receive' ? 'รับอาหาร' : 'ไม่รับอาหาร'}</b>
                      </Typography>
                    </Box>

                    {/* กลุ่มปุ่มกด (จัดเรียงเป็นแนวดิ่ง ให้ความกว้างเท่ากัน) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>

                      {/* 📍 ครอบปุ่มทั้งสองไว้ด้วยเงื่อนไข: จะโชว์ปุ่มก็ต่อเมื่อสถานะเป็น Confirmed เท่านั้น */}
                      {booking.res_status === 'Confirmed' && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            fullWidth
                            sx={{ borderRadius: 2 }}
                            onClick={() => navigate('/ticket', { state: { ticket: booking } })}
                          >
                            🎟️ พิมพ์ตั๋ว
                          </Button>

                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            fullWidth
                            sx={{ borderRadius: 2 }}
                            onClick={() => handleCancelBooking(booking.res_id)}
                          >
                            ยกเลิกเที่ยวบิน
                          </Button>
                        </>
                      )}

                    </Box>
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