import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Link, Grid } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // true = หน้าล็อกอิน, false = หน้าสมัครสมาชิก
  const [formData, setFormData] = useState({ u_email: '', u_password: '', u_name: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // ยิง API เข้าสู่ระบบ
        const res = await axios.post('http://localhost:5001/api/login', {
          u_email: formData.u_email,
          u_password: formData.u_password
        });
        if (res.data.success) {
          // เก็บข้อมูล User ไว้ในเบราว์เซอร์ แล้วเด้งไปหน้าแรก
          localStorage.setItem('user', JSON.stringify(res.data.user));
          navigate('/'); 
        }
      } else {
        // ยิง API สมัครสมาชิก
        const res = await axios.post('http://localhost:5001/api/register', formData);
        if (res.data.success) {
          alert('🎉 สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
          setIsLogin(true); // สลับกลับมาหน้าล็อกอิน
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e3f2fd' }}>
      <Paper elevation={6} sx={{ p: 5, borderRadius: 3, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <FlightTakeoffIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          FlightBooking
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          {isLogin ? 'เข้าสู่ระบบเพื่อจัดการเที่ยวบินของคุณ' : 'สร้างบัญชีใหม่เพื่อเริ่มจองเที่ยวบิน'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <TextField fullWidth label="ชื่อ-นามสกุล" name="u_name" value={formData.u_name} onChange={handleChange} sx={{ mb: 2 }} required />
          )}
          <TextField fullWidth type="email" label="อีเมล" name="u_email" value={formData.u_email} onChange={handleChange} sx={{ mb: 2 }} required />
          <TextField fullWidth type="password" label="รหัสผ่าน" name="u_password" value={formData.u_password} onChange={handleChange} sx={{ mb: 3 }} required />
          
          <Button fullWidth type="submit" variant="contained" size="large" sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}>
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </Button>
        </form>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2">
            {isLogin ? 'ยังไม่มีบัญชีใช่ไหม? ' : 'มีบัญชีอยู่แล้วใช่ไหม? '}
            <Link component="button" variant="body2" fontWeight="bold" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'สมัครสมาชิกที่นี่' : 'เข้าสู่ระบบที่นี่'}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default AuthPage;