import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminBookings();
  }, [navigate]);

  const fetchAdminBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleDelete = async (res_id) => {
    const isConfirm = window.confirm(`ระวัง! คุณกำลังจะ "ลบถาวร" รหัสการจอง #${res_id}\nดำเนินการต่อหรือไม่?`);
    if (!isConfirm) return;

    try {
      const response = await axios.delete(`http://localhost:5001/api/admin/bookings/${res_id}`);
      if (response.data.success) {
        alert('ลบข้อมูลออกจากระบบเรียบร้อย');
        fetchAdminBookings(); 
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#111827', color: 'white', py: 3, px: 2 }}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="text" sx={{ color: '#9ca3af', '&:hover': { color: 'white' } }} startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')}>
            กลับหน้า Dashboard
          </Button>
          <Typography variant="h5" fontWeight="bold">📋 รายการจองตั๋วทั้งหมด (All Bookings)</Typography>
        </Container>
      </Box>

      {/* ตารางการจอง */}
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
              <TableRow>
                <TableCell><b>รหัสจอง</b></TableCell>
                <TableCell><b>วันที่ทำรายการ</b></TableCell>
                <TableCell><b>ข้อมูลผู้โดยสาร</b></TableCell>
                <TableCell><b>เส้นทางบิน</b></TableCell>
                <TableCell><b>วันเดินทาง</b></TableCell>
                <TableCell><b>สถานะ</b></TableCell>
                <TableCell align="center"><b>จัดการ (Admin)</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((row) => (
                <TableRow key={row.res_id} hover>
                  <TableCell>#{row.res_id}</TableCell>
                  <TableCell>{row.booking_date}</TableCell>
                  <TableCell>
                    {row.pass_fname} {row.pass_lname}<br/>
                    <Typography variant="caption" color="text.secondary">{row.u_email}</Typography>
                  </TableCell>
                  <TableCell>
                    {row.airline_name} ({row.flight_number})<br/>
                    <b>{row.origin_code} ➔ {row.destination_code}</b>
                  </TableCell>
                  <TableCell>{row.travel_date}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small"
                      label={row.res_status === 'Confirmed' ? 'ยืนยัน' : row.res_status === 'Cancelled' ? 'ลูกค้ายกเลิก' : row.res_status} 
                      color={row.res_status === 'Confirmed' ? 'success' : row.res_status === 'Cancelled' ? 'error' : 'default'} 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(row.res_id)}>
                      ลบถาวร
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>ไม่มีข้อมูลการจองในระบบ</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}

export default AdminBookings;