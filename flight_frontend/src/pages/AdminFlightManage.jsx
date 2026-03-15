import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Grid, MenuItem, FormControl, InputLabel, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminFlightManage() {
  const navigate = useNavigate();
  const [masterData, setMasterData] = useState({ airports: [], airlines: [], airplanes: [] });
  const [flightList, setFlightList] = useState([]); 
  const [editMode, setEditMode] = useState(false); 
  const [editId, setEditId] = useState(null); 
  
  // State ของฟอร์ม (ไม่มีราคา ตามที่คุณคีนบอกให้ข้ามครับ)
  const [flightData, setFlightData] = useState({
    f_date: '', departure_time: '', arrive_time: '', boarding_time: '', 
    gate_id: '', origin_airport_id: '', destination_airport_id: '', air_id: '', ap_id: ''
  });

  useEffect(() => {
    fetchMasterData();
    fetchFlights(); 
  }, []);

  const fetchMasterData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/flight-master-data');
      if (response.data.success) {
        setMasterData({ airports: response.data.airports, airlines: response.data.airlines, airplanes: response.data.airplanes });
      }
    } catch (error) { console.error("Error fetching master data", error); }
  };

  const fetchFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/flights');
      if (response.data.success) {
        // 📍 เพิ่มคำสั่ง .sort() เพื่อเรียง f_id จากมากไปน้อย (ล่าสุดขึ้นก่อน)
        const sortedFlights = response.data.flights.sort((a, b) => b.f_id - a.f_id);
        setFlightList(sortedFlights);
      }
    } catch (error) { console.error("Error fetching flights", error); }
  };

  const handleChange = (e) => {
    setFlightData({ ...flightData, [e.target.name]: e.target.value });
  };

  // 📝 เมื่อกดปุ่ม "แก้ไข" ในตาราง
  const handleEditClick = (flight) => {
    const formattedDate = new Date(flight.f_date).toISOString().split('T')[0];
    
    setFlightData({
      f_date: formattedDate,
      departure_time: flight.departure_time,
      arrive_time: flight.arrive_time,
      boarding_time: flight.boarding_time,
      gate_id: flight.gate_id,
      origin_airport_id: flight.origin_airport_id,
      destination_airport_id: flight.destination_airport_id,
      air_id: flight.air_id,
      ap_id: flight.ap_id
    });
    setEditMode(true);
    setEditId(flight.f_id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // 🗑️ เมื่อกดปุ่ม "ลบ"
  const handleDeleteClick = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเที่ยวบินนี้? (ข้อมูลการจองของลูกค้าในเที่ยวบินนี้จะถูกลบด้วย)')) {
      try {
        const response = await axios.delete(`http://localhost:5001/api/admin/flights/${id}`);
        if (response.data.success) {
          alert('ลบเรียบร้อย');
          fetchFlights(); 
        }
      } catch (error) { alert('เกิดข้อผิดพลาดในการลบ'); }
    }
  };

  // 💾 เมื่อกดยืนยันบันทึก
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editMode) {
        response = await axios.put(`http://localhost:5001/api/admin/flights/${editId}`, flightData);
      } else {
        response = await axios.post('http://localhost:5001/api/admin/flights', flightData);
      }
      
      if (response.data.success) {
        alert(response.data.message);
        setFlightData({ f_date: '', departure_time: '', arrive_time: '', boarding_time: '', gate_id: '', origin_airport_id: '', destination_airport_id: '', air_id: '', ap_id: '' });
        setEditMode(false);
        setEditId(null);
        fetchFlights(); 
      }
    } catch (error) { alert(error.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

   // ยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setFlightData({ f_date: '', departure_time: '', arrive_time: '', boarding_time: '', gate_id: '', origin_airport_id: '', destination_airport_id: '', air_id: '', ap_id: '' });
    setEditMode(false);
    setEditId(null);
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ backgroundColor: '#111827', color: 'white', py: 3, px: 2 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="text" sx={{ color: 'white' }} startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')}>กลับหน้า Dashboard</Button>
          <Typography variant="h5" fontWeight="bold">✈️ ระบบจัดการเที่ยวบิน (Manage Flights)</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* ================= กล่องฟอร์ม (เพิ่ม/แก้ไข) ================= */}
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, mb: 5 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              
              <Typography variant="h5" fontWeight="bold" sx={{ color: editMode ? '#f57c00' : '#1976d2' }}>
                {editMode ? '✏️ แก้ไขข้อมูลเที่ยวบิน' : '🛫 เพิ่มเที่ยวบินใหม่'}
              </Typography>

              {/* ส่วนที่ 1: ข้อมูลเวลา */}
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={4} sx={{ pt: { md: 2 } }}><Typography variant="h6" color="text.secondary" fontWeight="bold">1. ข้อมูลเวลา (Schedule)</Typography></Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField fullWidth size="small" required type="date" label="วันที่เดินทาง" name="f_date" value={flightData.f_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                    <TextField fullWidth size="small" required label="ประตูทางออก (Gate)" name="gate_id" value={flightData.gate_id} onChange={handleChange} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField fullWidth size="small" required type="time" label="เวลาออกเดินทาง" name="departure_time" value={flightData.departure_time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                    <TextField fullWidth size="small" required type="time" label="เวลาถึงที่หมาย" name="arrive_time" value={flightData.arrive_time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                    <TextField fullWidth size="small" required type="time" label="เรียกขึ้นเครื่อง" name="boarding_time" value={flightData.boarding_time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                  </Box>
                </Grid>
              </Grid>

              {/* ================= ส่วนที่ 2: เส้นทางและอากาศยาน ================= */}
              <Grid container spacing={2} alignItems="flex-start" sx={{ mt: 1 }}>
                
                <Grid item xs={12} md={4} sx={{ pt: { md: 2 } }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    2. เส้นทาง (Route & Aircraft)
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    
                    {/* 📍 ต้นทาง */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>ต้นทาง (Origin)</InputLabel>
                        <Select 
                          name="origin_airport_id" 
                          value={flightData.origin_airport_id} 
                          label="ต้นทาง (Origin)" 
                          onChange={(e) => {
                            handleChange(e);
                            // ใช้ == เผื่อกรณี type ไม่ตรงกัน และเคลียร์ปลายทางถ้าบังเอิญตรงกัน
                            if (e.target.value == flightData.destination_airport_id) {
                              setFlightData(prev => ({ ...prev, destination_airport_id: '' }));
                            }
                          }}
                        >
                          {masterData.airports.map(airport => (
                            <MenuItem key={airport.airport_id} value={airport.airport_id}>
                              {airport.airport_code} - {airport.airport_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* 📍 ปลายทาง (กรองเอาต้นทางออก) */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>ปลายทาง (Destination)</InputLabel>
                        <Select 
                          name="destination_airport_id" 
                          value={flightData.destination_airport_id} 
                          label="ปลายทาง (Destination)" 
                          onChange={handleChange}
                          disabled={!flightData.origin_airport_id} // ล็อกไว้ถ้ายังไม่เลือกต้นทาง
                        >
                          {masterData.airports
                            // 📍 ใช้ != เพื่อกรองสนามบินต้นทางทิ้งไปเลย ป้องกันเลือกซ้ำ
                            .filter(airport => airport.airport_id != flightData.origin_airport_id) 
                            .map(airport => (
                              <MenuItem key={airport.airport_id} value={airport.airport_id}>
                                {airport.airport_code} - {airport.airport_name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                                        {/* 📍 สายการบิน */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>สายการบิน (Airline)</InputLabel>
                        <Select 
                          name="air_id" 
                          value={flightData.air_id} 
                          label="สายการบิน (Airline)" 
                          onChange={(e) => {
                            handleChange(e);
                            // รีเซ็ตช่องเครื่องบินทุกครั้งที่มีการเปลี่ยนสายการบิน
                            setFlightData(prev => ({ ...prev, ap_id: '' }));
                          }}
                        >
                          {masterData.airlines.map(airline => (
                            <MenuItem key={airline.airline_id} value={airline.airline_id}>
                              {airline.airline_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* 📍 เครื่องบิน (กรองตามสายการบินที่เลือก) */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>เครื่องบิน (Aircraft)</InputLabel>
                        <Select 
                          name="ap_id" 
                          value={flightData.ap_id} 
                          label="เครื่องบิน (Aircraft)" 
                          onChange={handleChange}
                          disabled={!flightData.air_id} // ล็อกไว้ถ้ายังไม่เลือกสายการบิน
                        >
                          {masterData.airplanes
                            // 📍 ใช้ == เพื่อให้ทำงานได้ทั้งตัวเลข (Number) และตัวหนังสือ (String)
                            .filter(plane => plane.airline_id == flightData.air_id) 
                            .map(plane => (
                              <MenuItem key={plane.ap_id} value={plane.ap_id}>
                                {plane.ap_model}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>

                  </Grid>
                </Grid>

              </Grid>
              {/* ================= จบส่วนที่ 2 ================= */}

              {/* ปุ่มบันทึก และ ยกเลิก */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" color={editMode ? "warning" : "success"} size="large" startIcon={<SaveIcon />} sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}>
                  {editMode ? 'อัปเดตข้อมูลเที่ยวบิน' : 'บันทึกเที่ยวบินใหม่'}
                </Button>
                {editMode && (
                  <Button variant="outlined" color="error" size="large" onClick={handleCancelEdit}>ยกเลิกการแก้ไข</Button>
                )}
              </Box>

            </Box>
          </form>
        </Paper>

        {/* ================= ตารางแสดงรายการเที่ยวบินทั้งหมด ================= */}
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>📋 รายการเที่ยวบินในระบบ ({flightList.length} เที่ยวบิน)</Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#111827' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>รหัส</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่เดินทาง</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เส้นทาง</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>สายการบิน</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เวลาออก - ถึง</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flightList.map((flight) => (
                <TableRow key={flight.f_id} hover>
                  <TableCell>FL{String(flight.f_id).padStart(3, '0')}</TableCell>
                  <TableCell>{new Date(flight.f_date).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell fontWeight="bold">{flight.origin_code} ✈️ {flight.dest_code}</TableCell>
                  <TableCell>{flight.airline_name}</TableCell>
                  <TableCell>{flight.departure_time} - {flight.arrive_time}</TableCell>
                  <TableCell align="center">
                    <IconButton color="warning" onClick={() => handleEditClick(flight)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(flight.f_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {flightList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>ไม่มีข้อมูลเที่ยวบินในระบบ</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Container>
    </Box>
  );
}

export default AdminFlightManage;





// import React, { useState, useEffect } from 'react';
// import { Container, Typography, Box, TextField, Button, Paper, Grid, MenuItem, FormControl, InputLabel, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Divider } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import SaveIcon from '@mui/icons-material/Save';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function AdminFlightManage() {
//   const navigate = useNavigate();
//   const [masterData, setMasterData] = useState({ airports: [], airlines: [], airplanes: [] });
//   const [flightList, setFlightList] = useState([]); // เก็บรายการเที่ยวบินทั้งหมด
//   const [editMode, setEditMode] = useState(false); // เช็คว่ากำลัง "เพิ่ม" หรือ "แก้ไข"
//   const [editId, setEditId] = useState(null); // เก็บ ID ของเที่ยวบินที่กำลังแก้
  
//   // State ของฟอร์ม
//   const [flightData, setFlightData] = useState({
//     f_date: '', departure_time: '', arrive_time: '', boarding_time: '', 
//     gate_id: '', origin_airport_id: '', destination_airport_id: '', air_id: '', ap_id: ''
//   });

//   useEffect(() => {
//     fetchMasterData();
//     fetchFlights(); // โหลดข้อมูลตารางเที่ยวบินตอนเปิดหน้า
//   }, []);

//   const fetchMasterData = async () => {
//     try {
//       const response = await axios.get('http://localhost:5001/api/admin/flight-master-data');
//       if (response.data.success) {
//         setMasterData({ airports: response.data.airports, airlines: response.data.airlines, airplanes: response.data.airplanes });
//       }
//     } catch (error) { console.error("Error fetching master data", error); }
//   };

//   const fetchFlights = async () => {
//     try {
//       const response = await axios.get('http://localhost:5001/api/admin/flights');
//       if (response.data.success) setFlightList(response.data.flights);
//     } catch (error) { console.error("Error fetching flights", error); }
//   };

//   const handleChange = (e) => {
//     setFlightData({ ...flightData, [e.target.name]: e.target.value });
//   };

//   // 📝 เมื่อกดปุ่ม "แก้ไข" ในตาราง ให้ดึงข้อมูลขึ้นมาใส่ฟอร์ม
//   const handleEditClick = (flight) => {
//     // ตัดเอาเฉพาะส่วนวันที่ YYYY-MM-DD
//     const formattedDate = new Date(flight.f_date).toISOString().split('T')[0];
    
//     setFlightData({
//       f_date: formattedDate,
//       departure_time: flight.departure_time,
//       arrive_time: flight.arrive_time,
//       boarding_time: flight.boarding_time,
//       gate_id: flight.gate_id,
//       origin_airport_id: flight.origin_airport_id,
//       destination_airport_id: flight.destination_airport_id,
//       air_id: flight.air_id,
//       ap_id: flight.ap_id
//     });
//     setEditMode(true);
//     setEditId(flight.f_id);
//     window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนจอกลับขึ้นไปที่ฟอร์ม
//   };

//   // 🗑️ เมื่อกดปุ่ม "ลบ"
//   const handleDeleteClick = async (id) => {
//     if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเที่ยวบินนี้? (ข้อมูลการจองของลูกค้าในเที่ยวบินนี้จะถูกลบด้วย)')) {
//       try {
//         const response = await axios.delete(`http://localhost:5001/api/admin/flights/${id}`);
//         if (response.data.success) {
//           alert('ลบเรียบร้อย');
//           fetchFlights(); // โหลดตารางใหม่
//         }
//       } catch (error) { alert('เกิดข้อผิดพลาดในการลบ'); }
//     }
//   };

//   // 💾 เมื่อกดยืนยันบันทึก (เป็นได้ทั้ง Insert และ Update)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       let response;
//       if (editMode) {
//         // อัปเดตข้อมูลเก่า
//         response = await axios.put(`http://localhost:5001/api/admin/flights/${editId}`, flightData);
//       } else {
//         // เพิ่มข้อมูลใหม่
//         response = await axios.post('http://localhost:5001/api/admin/flights', flightData);
//       }
      
//       if (response.data.success) {
//         alert(response.data.message);
//         // เคลียร์ฟอร์ม
//         setFlightData({ f_date: '', departure_time: '', arrive_time: '', boarding_time: '', gate_id: '', origin_airport_id: '', destination_airport_id: '', air_id: '', ap_id: '' });
//         setEditMode(false);
//         setEditId(null);
//         fetchFlights(); // โหลดตารางใหม่ทันที
//       }
//     } catch (error) { alert(error.response?.data?.message || 'เกิดข้อผิดพลาด'); }
//   };

//   // ยกเลิกการแก้ไข (เคลียร์ฟอร์ม)
//   const handleCancelEdit = () => {
//     setFlightData({ f_date: '', departure_time: '', arrive_time: '', boarding_time: '', gate_id: '', origin_airport_id: '', destination_airport_id: '', air_id: '', ap_id: '' });
//     setEditMode(false);
//     setEditId(null);
//   };

//   return (
//     <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 10 }}>
//       <Box sx={{ backgroundColor: '#111827', color: 'white', py: 3, px: 2 }}>
//         <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Button variant="text" sx={{ color: 'white' }} startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')}>กลับหน้า Dashboard</Button>
//           <Typography variant="h5" fontWeight="bold">✈️ ระบบจัดการเที่ยวบิน (Manage Flights)</Typography>
//         </Container>
//       </Box>

//       <Container maxWidth="lg" sx={{ mt: 5 }}>
//         {/* ================= กล่องฟอร์ม (เพิ่ม/แก้ไข) ================= */}
//         <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, mb: 5 }}>
//           <form onSubmit={handleSubmit}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              
//               <Typography variant="h5" fontWeight="bold" sx={{ color: editMode ? '#f57c00' : '#1976d2' }}>
//                 {editMode ? '✏️ แก้ไขข้อมูลเที่ยวบิน' : '🛫 เพิ่มเที่ยวบินใหม่'}
//               </Typography>

//               {/* ส่วนที่ 1: ข้อมูลเวลา */}
//               <Grid container spacing={2} alignItems="flex-start">
//                 <Grid item xs={12} md={4} sx={{ pt: { md: 2 } }}><Typography variant="h6" color="text.secondary" fontWeight="bold">1. ข้อมูลเวลา (Schedule)</Typography></Grid>
//                 <Grid item xs={12} md={8}>
//                   <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                     <TextField fullWidth size="small" required type="date" label="วันที่เดินทาง" name="f_date" value={flightData.f_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
//                     <TextField fullWidth size="small" required label="Gate" name="gate_id" value={flightData.gate_id} onChange={handleChange} />
//                   </Box>
//                   <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                     <TextField fullWidth size="small" required type="time" label="เวลาออกเดินทาง" name="departure_time" value={flightData.departure_time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
//                     <TextField fullWidth size="small" required type="time" label="เวลาถึงที่หมาย" name="arrive_time" value={flightData.arrive_time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
//                     <TextField fullWidth size="small" required type="time" label="เรียกขึ้นเครื่อง" name="boarding_time" value={flightData.boarding_time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
//                   </Box>
//                 </Grid>
//               </Grid>

//              {/* ================= ส่วนที่ 2: เส้นทางและอากาศยาน ================= */}
//               <Grid container spacing={2} alignItems="flex-start" sx={{ mt: 1 }}>
                
//                 {/* หัวข้อด้านซ้าย */}
//                 <Grid item xs={12} md={4} sx={{ pt: { md: 2 } }}>
//                   <Typography variant="h6" color="primary" fontWeight="bold">
//                     2. เส้นทาง (Route & Aircraft)
//                   </Typography>
//                 </Grid>
                
//                 {/* ช่องกรอกข้อมูลด้านขวา (ใช้ Grid บังคับให้เป็น 2 แถว แถวละ 2 กล่อง) */}
//                 <Grid item xs={12} md={8}>
//                   <Grid container spacing={2}>
                    
//                     {/* กล่องที่ 1: ต้นทาง (กินพื้นที่ครึ่งนึง) */}
//                     <Grid item xs={12} sm={6}>
//                       <FormControl fullWidth size="small" required>
//                         <InputLabel>ต้นทาง (Origin)</InputLabel>
//                         <Select name="origin_airport_id" value={flightData.origin_airport_id} label="ต้นทาง (Origin)" onChange={handleChange}>
//                           {masterData.airports.map(airport => (
//                             <MenuItem key={airport.airport_id} value={airport.airport_id}>{airport.airport_code} - {airport.airport_name}</MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>
//                     </Grid>

//                     {/* กล่องที่ 2: ปลายทาง (กินพื้นที่ครึ่งนึง) */}
//                     <Grid item xs={12} sm={6}>
//                       <FormControl fullWidth size="small" required>
//                         <InputLabel>ปลายทาง (Destination)</InputLabel>
//                         <Select name="destination_airport_id" value={flightData.destination_airport_id} label="ปลายทาง (Destination)" onChange={handleChange}>
//                           {masterData.airports.map(airport => (
//                             <MenuItem key={airport.airport_id} value={airport.airport_id}>{airport.airport_code} - {airport.airport_name}</MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>
//                     </Grid>

//                     {/* กล่องที่ 3: สายการบิน (ปัดลงมาบรรทัดใหม่) */}
//                     <Grid item xs={12} sm={6}>
//                       <FormControl fullWidth size="small" required>
//                         <InputLabel>สายการบิน (Airline)</InputLabel>
//                         <Select name="air_id" value={flightData.air_id} label="สายการบิน (Airline)" onChange={handleChange}>
//                           {masterData.airlines.map(airline => (
//                             <MenuItem key={airline.airline_id} value={airline.airline_id}>{airline.airline_name}</MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>
//                     </Grid>

//                     {/* กล่องที่ 4: เครื่องบิน */}
//                     <Grid item xs={12} sm={6}>
//                       <FormControl fullWidth size="small" required>
//                         <InputLabel>เครื่องบิน (Aircraft)</InputLabel>
//                         <Select name="ap_id" value={flightData.ap_id} label="เครื่องบิน (Aircraft)" onChange={handleChange}>
//                           {masterData.airplanes.map(plane => (
//                             <MenuItem key={plane.ap_id} value={plane.ap_id}>{plane.ap_model}</MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>
//                     </Grid>

//                   </Grid>
//                 </Grid>

//               </Grid>
//               {/* ================= จบส่วนที่ 2 ================= */}

//               {/* ปุ่มบันทึก และ ยกเลิก */}
//               <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
//                 <Button type="submit" variant="contained" color={editMode ? "warning" : "success"} size="large" startIcon={<SaveIcon />} sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}>
//                   {editMode ? 'อัปเดตข้อมูลเที่ยวบิน' : 'บันทึกเที่ยวบินใหม่'}
//                 </Button>
//                 {editMode && (
//                   <Button variant="outlined" color="error" size="large" onClick={handleCancelEdit}>ยกเลิกการแก้ไข</Button>
//                 )}
//               </Box>

//             </Box>
//           </form>
//         </Paper>

//         {/* ================= ตารางแสดงรายการเที่ยวบินทั้งหมด ================= */}
//         <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>📋 รายการเที่ยวบินในระบบ ({flightList.length} เที่ยวบิน)</Typography>
//         <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
//           <Table>
//             <TableHead sx={{ backgroundColor: '#111827' }}>
//               <TableRow>
//                 <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>รหัส</TableCell>
//                 <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่เดินทาง</TableCell>
//                 <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เส้นทาง</TableCell>
//                 <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>สายการบิน</TableCell>
//                 <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เวลาออก - ถึง</TableCell>
//                 <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>จัดการ</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {flightList.map((flight) => (
//                 <TableRow key={flight.f_id} hover>
//                   <TableCell>FL{String(flight.f_id).padStart(3, '0')}</TableCell>
//                   <TableCell>{new Date(flight.f_date).toLocaleDateString('th-TH')}</TableCell>
//                   <TableCell fontWeight="bold">{flight.origin_code} ✈️ {flight.dest_code}</TableCell>
//                   <TableCell>{flight.airline_name}</TableCell>
//                   <TableCell>{flight.departure_time} - {flight.arrive_time}</TableCell>
//                   <TableCell align="center">
//                     <IconButton color="warning" onClick={() => handleEditClick(flight)}>
//                       <EditIcon />
//                     </IconButton>
//                     <IconButton color="error" onClick={() => handleDeleteClick(flight.f_id)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {flightList.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center" sx={{ py: 3 }}>ไม่มีข้อมูลเที่ยวบินในระบบ</TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//       </Container>
//     </Box>
//   );
// }

// export default AdminFlightManage;