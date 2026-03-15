import React, { useState, useEffect } from 'react'; // 📍 เพิ่ม useEffect
import axios from 'axios'; // 📍 เพิ่ม axios สำหรับเรียก API
import { 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  MenuItem, 
  Button, 
  Radio, 
  RadioGroup, 
  FormControlLabel 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';

// ข้อมูลชั้นโดยสาร (อันนี้ Hardcode ได้เพราะปกติมีแค่ 2 คลาสนี้ครับ)
const flightClasses = [
  { id: 1, name: 'ชั้นประหยัด (Economy)' },
  { id: 2, name: 'ชั้นธุรกิจ (Business)' }
];

function SearchWidget({ onSearch }) {
  // 📍 สร้าง State มารับข้อมูลสนามบินจาก Database
  const [airports, setAirports] = useState([]);

  const [searchData, setSearchData] = useState({
    tripType: 'oneway', 
    origin: '', // ปล่อยว่างไว้ก่อน รอโหลดข้อมูลเสร็จ
    destination: '', 
    travelDate: '',
    passengers: 1,
    flightClass: 1 
  });

  // 📍 ฟังก์ชันดึงข้อมูลสนามบินตอนเปิดเว็บ
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/airports');
        if (response.data.success) {
          setAirports(response.data.data);
          
          // ตั้งค่าเริ่มต้นให้ Dropdown (ถ้ามีข้อมูล)
          if (response.data.data.length >= 2) {
            setSearchData(prev => ({
              ...prev,
              origin: 'DMK', // ตั้งค่าเริ่มต้นเป็น ดอนเมือง
              destination: 'CNX' // ตั้งค่าเริ่มต้นเป็น เชียงใหม่
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching airports:", error);
      }
    };

    fetchAirports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchClick = () => {
    onSearch(searchData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <RadioGroup
          row
          name="tripType"
          value={searchData.tripType}
          onChange={handleChange}
        >
          <FormControlLabel value="oneway" control={<Radio />} label="เที่ยวเดียว" />
          <FormControlLabel value="roundtrip" control={<Radio disabled />} label="ไป-กลับ (เร็วๆ นี้)" />
        </RadioGroup>
      </Box>

      <Grid container spacing={2} alignItems="center">
        {/* 📍 Dropdown ต้นทาง (ดึงจาก State airports อัตโนมัติ) */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            label="ออกจาก"
            name="origin"
            value={searchData.origin}
            onChange={handleChange}
            InputProps={{ startAdornment: <FlightTakeoffIcon sx={{ color: 'action.active', mr: 1 }} /> }}
          >
            {airports.map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {option.name} ({option.code})
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* 📍 Dropdown ปลายทาง */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            label="ไปถึง"
            name="destination"
            value={searchData.destination}
            onChange={handleChange}
            InputProps={{ startAdornment: <FlightLandIcon sx={{ color: 'action.active', mr: 1 }} /> }}
          >
            {airports.map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {option.name} ({option.code})
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            type="date"
            label="วันเดินทาง"
            name="travelDate"
            value={searchData.travelDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            type="number"
            label="ผู้โดยสาร"
            name="passengers"
            value={searchData.passengers}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 1, max: 10 } }}
            InputLabelProps={{
              sx: { fontSize: { xs: '1rem', md: '0.9rem' }, whiteSpace: 'nowrap', overflow: 'visible' }
            }}
            sx={{ mb: { xs: 2, md: 0 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            label="ชั้นโดยสาร"
            name="flightClass"
            value={searchData.flightClass}
            onChange={handleChange}
          >
            {flightClasses.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSearchClick}
            startIcon={<SearchIcon />}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
          >
            ค้นหาเที่ยวบิน
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default SearchWidget;




