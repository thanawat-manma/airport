import React from 'react';
import { Container, Paper, Typography, Box, Grid, Button, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';
import HomeIcon from '@mui/icons-material/Home';

function TicketPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // รับข้อมูลการจองที่ส่งมาจากหน้า MyBookings
  const ticketData = location.state?.ticket;

  if (!ticketData) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5">ไม่พบข้อมูลตั๋วโดยสาร</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/')}>กลับหน้าหลัก</Button>
      </Box>
    );
  }

  // ฟังก์ชันสั่งปริ้นท์ / เซฟเป็น PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md">
        
        {/* ========================================== */}
        {/* ส่วนแสดงตั๋ว (Boarding Pass) */}
        {/* ========================================== */}
        <Paper 
          elevation={4} 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            borderRadius: 3, 
            overflow: 'hidden',
            backgroundColor: '#fff',
            // ซ่อนเงาและปรับสีตอนสั่งปริ้นท์
            '@media print': {
              boxShadow: 'none',
              border: '1px solid #ccc',
            }
          }}
        >
          {/* ฝั่งซ้าย (รายละเอียดหลัก) */}
          <Box sx={{ flex: 2, p: 4, borderRight: { md: '2px dashed #ccc' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {ticketData.airline_name}
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight="bold">
                BOARDING PASS
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">NAME OF PASSENGER / ชื่อผู้โดยสาร</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {ticketData.pass_fname} {ticketData.pass_lname}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">FROM / ต้นทาง</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">{ticketData.origin_code}</Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlightTakeoffIcon sx={{ fontSize: 40, color: '#ccc' }} />
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">TO / ปลายทาง</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">{ticketData.destination_code}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">FLIGHT / เที่ยวบิน</Typography>
                <Typography variant="body1" fontWeight="bold">{ticketData.flight_number}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">DATE / วันที่</Typography>
                <Typography variant="body1" fontWeight="bold">{ticketData.travel_date}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">TIME / เวลาออก</Typography>
                <Typography variant="body1" fontWeight="bold">{ticketData.departure_time}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* ฝั่งขวา (หางตั๋ว) */}
          <Box sx={{ flex: 1, p: 4, backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>BOOKING REF / หมายเลขการจอง</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              {ticketData.res_id.toString().padStart(6, '0')}
            </Typography>

            <Box sx={{ textAlign: 'center', mb: 3, p: 2, border: '2px solid #1976d2', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">SEAT / ที่นั่ง</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">{ticketData.seat_num}</Typography>
            </Box>

            <QrCode2Icon sx={{ fontSize: 80, color: '#333' }} />
          </Box>
        </Paper>

        {/* ========================================== */}
        {/* ส่วนปุ่มกด (จะถูกซ่อนไว้ตอนกดสั่งพิมพ์) */}
        {/* ========================================== */}
        <Box 
          sx={{ 
            mt: 4, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            // 📍 คลาสนี้สำคัญมาก! มันจะซ่อนปุ่มพวกนี้ไม่ให้ไปโผล่ในกระดาษ PDF
            '@media print': { display: 'none' } 
          }}
        >
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ px: 4, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
          >
            บันทึกเป็น PDF / พิมพ์ตั๋ว
          </Button>

          <Button 
            variant="outlined" 
            color="inherit" 
            size="large" 
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ px: 4, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
          >
            กลับหน้าหลัก
          </Button>
        </Box>

      </Container>
    </Box>
  );
}

export default TicketPage;