import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Divider, CircularProgress } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchWidget from '../components/SearchWidget';
import BookingModal from '../components/BookingModal';

// สร้างตัวแปรเก็บลิงก์รูปโลโก้สายการบิน
// สร้างตัวแปรเก็บลิงก์รูปโลโก้สายการบิน (อัปเดตลิงก์ Thai Airways ใหม่)
const airlineLogos = {
  'AirAsia': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/AirAsia_New_Logo.svg',
  'Thai Airways': 'https://vectorseek.com/wp-content/uploads/2023/09/Thai-Airways-International-Icon-Logo-Vector.svg-.png',
  'Nok Air': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Nokair_logo.jpg',
  'Thai Lion Air': 'https://upload.wikimedia.org/wikipedia/en/b/b5/Thai_Lion_Air_logo.svg',
  'Bangkok Airways': 'https://www.ktc.co.th/pub/media/online-travel-booking/partner-bangkok-airways.webp',
  'Thai Lion Air': 'https://www.gother.com/_next/image?url=https%3A%2F%2Fd3p9pa0orw8xnp.cloudfront.net%2Fimages%2Fairlines%2Flogo%2Fsl_logo296x188.png&w=640&q=100'
};

const defaultLogo = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); 

  const [flights, setFlights] = useState([]);
  // จุดแก้ที่ 1: ให้ loading เป็น true ตั้งแต่แรก
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ passengers: 1, flightClass: 1 });
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // จุดแก้ที่ 2: ปรับ useEffect ให้ทำงานแค่ "รอบเดียว" ลดอาการจอกระพริบ
  useEffect(() => {
    const checkUser = localStorage.getItem('user');
    if (!checkUser) {
      navigate('/login');
    } else {
      fetchFlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


    // แก้ฟังก์ชัน fetchFlights ให้รับ parameter เพื่อเอาไปค้นหา
  const fetchFlights = async (searchFilter = {}) => {
    setLoading(true);
    try {
      // 📍 สร้างกล่องเก็บเงื่อนไข และดักว่า "ถ้ามีข้อมูล ค่อยส่งไปนะ" ป้องกันการส่งค่า undefined
      const queryParams = {};
      if (searchFilter.origin) queryParams.origin = searchFilter.origin;
      if (searchFilter.destination) queryParams.destination = searchFilter.destination;
      if (searchFilter.travelDate) queryParams.travelDate = searchFilter.travelDate;

      // ส่งไปให้ API หลังบ้าน
      const response = await axios.get('http://localhost:5001/api/flights', {
        params: queryParams
      });

      if (response.data.success) {
        setFlights(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching flights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  //const handleSearch = (data) => setSearchParams(data);

  // แก้ไข handleSearch ให้วิ่งไปดึงข้อมูลใหม่จากหลังบ้านทันที!
  const handleSearch = (data) => {
    setSearchParams(data); // เก็บจำนวนคนและคลาสไว้คำนวณราคาเหมือนเดิม
    fetchFlights(data);    // สั่งให้โหลดข้อมูลเที่ยวบินใหม่ตามเงื่อนไข
  };
  const calculatePrice = (basePrice) => basePrice * searchParams.passengers * (searchParams.flightClass === 2 ? 3 : 1);
  
  const handleOpenModal = (flight) => { 
    setSelectedFlight(flight); 
    setIsModalOpen(true); 
  };

  if (!user) return null; 

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#1976d2', color: 'white', py: 6, textAlign: 'center', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 20, right: { xs: 10, md: 30 }, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ display: { xs: 'none', md: 'block' } }}>
            👤 สวัสดี, {user.u_name}
          </Typography>

          {/* 📍 เพิ่มปุ่มเข้าหลังบ้านตรงนี้ (มันจะโชว์ถ้า role = 'admin' เท่านั้น) */}
          {user?.role === 'admin' && (
            <Button variant="contained" color="error" size="small" onClick={() => navigate('/admin')}>
              🛡️ หลังบ้าน Admin
            </Button>
          )}

          {/* 📍 เพิ่มปุ่มประวัติการจอง */}
          <Button variant="contained" color="secondary" size="small" onClick={() => navigate('/my-bookings')}>
            ประวัติการจอง
          </Button>
          <Button variant="outlined" color="inherit" size="small" endIcon={<LogoutIcon />} onClick={handleLogout}>
            ออกจากระบบ
          </Button>
        </Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>อุ่นใจทุกการเดินทางกับ FlightBooking</Typography>
        <Typography variant="h6">ค้นหาเที่ยวบินราคาประหยัด จองง่าย จ่ายสะดวก</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -5 }}>
        <SearchWidget onSearch={handleSearch} />

        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>เที่ยวบินที่พร้อมให้บริการ</Typography>
          
          {/* จุดแก้ที่ 3: โชว์เงื่อนไขการโหลดให้เนียนขึ้น */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : flights.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ my: 5 }}>ไม่พบเที่ยวบิน</Typography>
          ) : (
             flights.map((flight) => (
              <Card key={flight.flight_id} sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="center" justifyContent="space-between">
                    
                    {/* ส่วนที่ 1: ข้อมูลสายการบิน (md={3}) */}
                    <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={airlineLogos[flight.airline?.name] || defaultLogo}
                        alt={flight.airline?.name}
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = defaultLogo;
                        }}
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
                          {flight.airline?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#1976d2', fontWeight: 'bold' }}>
                          📅 {flight.travel_date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          เที่ยวบิน {flight.flight_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {flight.airplane?.model}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* ส่วนที่ 2: เวลาและเส้นทางบิน (md={5}) */}
                    <Grid item xs={12} md={5}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                          <Typography variant="h5" fontWeight="bold">{flight.departure_time_formatted}</Typography>
                          <Typography variant="body1" color="text.secondary">{flight.origin?.code}</Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: 'center', flexGrow: 1, px: 3 }}>
                          <Typography variant="caption" color="text.secondary">บินตรง</Typography>
                          <Divider sx={{ my: 1 }}>
                            <FlightIcon sx={{ transform: 'rotate(90deg)', color: '#ccc' }} />
                          </Divider>
                        </Box>
                        
                        <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                          <Typography variant="h5" fontWeight="bold">{flight.arrival_time_formatted}</Typography>
                          <Typography variant="body1" color="text.secondary">{flight.destination?.code}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* ส่วนที่ 3: ราคาและปุ่มจอง (md={4}) */}
                    <Grid item xs={12} md={4} 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: { xs: 'flex-start', md: 'flex-end' }, 
                        justifyContent: 'center', 
                        borderLeft: { md: '1px solid #eee' }, 
                        pl: { md: 4 }, 
                        textAlign: { xs: 'left', md: 'right' }
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ราคาสำหรับ {searchParams.passengers} ท่าน ({searchParams.flightClass === 1 ? 'Economy' : 'Business'})
                      </Typography>
                      
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff6f00', my: 1 }}>
                        ฿{calculatePrice(flight.price).toLocaleString('th-TH')}
                      </Typography>
                      
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="large" 
                        sx={{ 
                          borderRadius: 2, 
                          px: 4, 
                          fontWeight: 'bold',
                          width: { xs: '100%', md: 'auto' } 
                        }} 
                        onClick={() => handleOpenModal(flight)}
                      >
                        จองเที่ยวบินนี้
                      </Button>
                    </Grid>

                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
        <BookingModal open={isModalOpen} handleClose={() => setIsModalOpen(false)} flight={selectedFlight} searchParams={searchParams} />
      </Container>
    </Box>
  );
}

export default HomePage;