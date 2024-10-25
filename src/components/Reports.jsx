import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { format } from "date-fns";
import { Navbar } from "./Navbar/Navbar";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fixedId = "admin";
  const fixedPassword = "admin";

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId === fixedId && password === fixedPassword) {
      setAuthenticated(true);
      setUserId("");
      setPassword("");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/location/getAllReports`);
        setReports(response.data.reports);
      } catch (err) {
        setError(err.response?.data?.Message || "Failed to fetch reports.");
      } finally {
        setLoading(false);
      }
    };

    if (authenticated) {
      fetchReports();
    }
  }, [authenticated]);

  const handleOpenDialog = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const filteredReports = reports.filter(report =>
    report.description.toLowerCase().includes(filter.toLowerCase())
  );

  if (!authenticated) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="max-w-sm mx-auto">
          <TextField label="User ID" variant="outlined" fullWidth value={userId} onChange={(e) => setUserId(e.target.value)} required />
          <TextField label="Password" type="password" variant="outlined" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" color="primary" fullWidth>Login</Button>
        </form>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center">Loading Reports...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 font-bold">{error}</div>;
  }

  if (!reports.length) {
    return <div className="text-center">No Reports Available</div>;
  }

  return (<>
    <Navbar />
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      
      <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">All Reports</h2>
      <TextField
        label="Search Reports"
        variant="outlined"
        fullWidth
        onChange={(e) => setFilter(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Submitted On</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report._id}</TableCell>
                <TableCell>{report.description}</TableCell>
                <TableCell>{format(new Date(report.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleOpenDialog(report)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle><div className="text-2xl">Report Details</div></DialogTitle>
        <DialogContent>
          {selectedReport && (
            <>
              <h3 className="font-bold m-5 font-serif text-pretty text-xl text-">{selectedReport.description}</h3>
              <img src={selectedReport.filesArray[0]} alt="Report" style={{ width: '100%', height: 'auto' }} />
              <MapContainer center={[selectedReport.location.latitude, selectedReport.location.longitude]} zoom={13} style={{ height: "300px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[selectedReport.location.latitude, selectedReport.location.longitude]}>
                  <Popup>{selectedReport.description}</Popup>
                </Marker>
              </MapContainer>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>);
};

export default ReportsPage;
