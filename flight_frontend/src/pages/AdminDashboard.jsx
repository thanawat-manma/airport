import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Grid, Card, CardContent, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlightIcon from '@mui/icons-material/Flight';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    summary: { users: 0, flights: 0, reservations: 0 },
    dailyBookings: [],
    airlineStats: []
  });

  // โทนสีพาสเทลสำหรับกราฟโดนัท
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser || loggedInUser.role !== 'admin') {
      navigate('/');
    } else {
      setUser(loggedInUser);
      fetchDashboardStats();
    }
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/dashboard-stats');
      if (response.data.success) {
        setStats({
          summary: response.data.summary,
          dailyBookings: response.data.dailyBookings,
          airlineStats: response.data.airlineStats
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pb: 10 }}>
      
      {/* ================= Header ================= */}
      <Box sx={{ backgroundColor: '#0f172a', color: 'white', py: 2.5, px: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" sx={{ color: '#cbd5e1', borderColor: '#334155', '&:hover': { color: 'white', borderColor: 'white' } }} startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
              กลับหน้าหลัก
            </Button>
            <Typography variant="h5" fontWeight="800">
              <DashboardIcon sx={{ verticalAlign: 'middle', mr: 1, mb: 0.5, color: '#38bdf8' }} />
              ADMIN PANEL
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#cbd5e1' }}>
            ยินดีต้อนรับ, <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{user?.u_name}</span> 👋
          </Typography>
        </Container>
      </Box>

      {/* ================= เนื้อหาหลัก (บีบเข้าตรงกลางด้วย maxWidth="lg") ================= */}
      <Container maxWidth="lg" sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* เมนูทางลัด 2 ปุ่ม (บีบระยะห่างให้ดูชิดกันและอยู่ตรงกลาง) */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 8, maxWidth: '900px' }}>
          {[
            { label: 'จัดการเที่ยวบิน', sub: 'เพิ่ม, แก้ไขเวลา และลบเที่ยวบิน', icon: <FlightIcon />, bg: '#d1fae5', color: '#10b981', path: '/admin/add-flight' },
            { label: 'รายการจองตั๋ว', sub: 'ตรวจสอบประวัติการจองของลูกค้า', icon: <ReceiptLongIcon />, bg: '#dbeafe', color: '#3b82f6', path: '/admin/bookings' }
          ].map((item, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, textAlign: 'center', borderRadius: 4, cursor: 'pointer', border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease', 
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.1)', borderColor: item.color } 
                }} 
                onClick={() => navigate(item.path)}
              >
                <Box sx={{ backgroundColor: item.bg, width: 70, height: 70, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 2 }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: 35, color: item.color } })}
                </Box>
                <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>{item.label}</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>{item.sub}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mb: 6, width: '100%', borderColor: '#e2e8f0' }} />

        {/* ================= 3 การ์ดตัวเลข (แถวเดียว และจัดกลาง) ================= */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Typography variant="h5" fontWeight="800" sx={{ mb: 3, color: '#0f172a', textAlign: 'center' }}>
            📊 ภาพรวมธุรกิจ
          </Typography>
          <Grid container spacing={3} sx={{ width: '100%' }} alignItems="stretch" justifyContent="center">
  {[
    { label: 'ลูกค้าระบบ  ', val: stats.summary.users, color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: <PeopleIcon /> },
    { label: 'เที่ยวบิน    ', val: stats.summary.flights, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: <FlightTakeoffIcon /> },
    { label: 'ยอดจองสะสม', val: stats.summary.reservations, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: <ReceiptLongIcon /> }
  ].map((card, i) => (
    <Grid item xs={12} sm={4} key={i} sx={{ display: 'flex' }}>
      <Card
        sx={{
          flex: 1,
          width: '200px',
          borderRadius: 4,
          background: card.color,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 160,
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ opacity: 0.8 }}>{card.label}</Typography>
          <Typography variant="h3" fontWeight="900" sx={{ mt: 1 }}>{card.val}</Typography>
        </CardContent>
        <Box sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 100, opacity: 0.2 }}>
          {React.cloneElement(card.icon, { sx: { fontSize: 100 } })}
        </Box>
      </Card>
    </Grid>
  ))}
</Grid>
        </Box>

        {/* ================= กราฟที่สมดุล (จัดวางแบบ 50/50 ให้ดูแน่นพอดี) ================= */}
        <Grid container spacing={3} sx={{ width: '100%' }} alignItems="stretch" justifyContent="center">
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: 420 }} >
              <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3 }}>📈 ยอดจอง 7 วันล่าสุด</Typography>
              <ResponsiveContainer width="200" height="90%">
                <BarChart data={stats.dailyBookings}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: 420 }}>
              <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3 }}>🍩 สัดส่วนสายการบิน</Typography>
              <ResponsiveContainer width="200" height="90%">
                <PieChart>
                  <Pie data={stats.airlineStats} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {stats.airlineStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
}

export default AdminDashboard;