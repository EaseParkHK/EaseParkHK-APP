import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col, Badge, InputGroup, Spinner, ListGroup } from 'react-bootstrap';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const VEHICLE_TYPES = [
  { value: 'privateCar', label: 'Private Car' },
  { value: 'motorCycle', label: 'Motorcycle' },
  { value: 'HGV', label: 'Heavy Goods Vehicle' },
  { value: 'LGV', label: 'Light Goods Vehicle' },
  { value: 'coach', label: 'Coach' },
];

function Main() {
  const [carparks, setCarparks] = useState([]);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorite_carparks') || '[]'));
  const [vehicleType, setVehicleType] = useState(() => localStorage.getItem('selected_vehicle_type') || 'privateCar');
  const [showMap, setShowMap] = useState(false);
  const [mapInfo, setMapInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Save vehicleType to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selected_vehicle_type', vehicleType);
  }, [vehicleType]);

  // Fetch carpark data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [infoRes, vacancyRes] = await Promise.all([
        fetch('https://api.data.gov.hk/v1/carpark-info-vacancy'),
        fetch('https://api.data.gov.hk/v1/carpark-info-vacancy?data=vacancy&vehicleTypes=privateCar,motorCycle,LGV,HGV,coach&lang=en_US'),
      ]);
      const infoData = await infoRes.json();
      const vacancyData = await vacancyRes.json();

      // Map park_Id to vacancy info
      const vacancyMap = {};
      for (const item of vacancyData.results) {
        vacancyMap[item.park_Id] = {
          privateCar: item.privateCar?.[0] || {},
          motorCycle: item.motorCycle?.[0] || {},
          LGV: item.LGV?.[0] || {},
          HGV: item.HGV?.[0] || {},
          coach: item.coach?.[0] || {},
        };
      }

      // Combine info and vacancy
      const combined = infoData.results.map(carpark => {
        const parkId = carpark.park_Id;
        const vacancy = vacancyMap[parkId] || {};
        const result = { ...carpark, park_Id: parkId };
        for (const vt of VEHICLE_TYPES.map(v => v.value)) {
          result[`${vt}_vacancy`] = vacancy[vt]?.vacancy ?? 'N/A';
          result[`${vt}_vacancy_type`] = vacancy[vt]?.vacancy_type ?? '';
        }
        // Example: Check for hourly charges for private cars
        if (carpark.privateCar && carpark.privateCar.hourlyCharges) {
          result.price = carpark.privateCar.hourlyCharges[0]?.price ?? 'N/A';
        } else {
          result.price = 'N/A';
        }
        return result;
      });

      setCarparks(combined);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Favorite handling
  const toggleFavorite = parkId => {
    let newFavs;
    if (favorites.includes(parkId)) {
      newFavs = favorites.filter(id => id !== parkId);
    } else {
      newFavs = [...favorites, parkId];
    }
    setFavorites(newFavs);
    localStorage.setItem('favorite_carparks', JSON.stringify(newFavs));
  };

  // Filtering
  const filterCarparks = list =>
    list.filter(carpark => {
      // Check if carpark is open
      if (carpark.opening_status !== 'OPEN') return false;
      // Vehicle type vacancy
      const vacancy = carpark[`${vehicleType}_vacancy`];
      if (['N/A', 'none', '-1', '0'].includes(String(vacancy))) return false;
      // Search filter
      if (
        search &&
        !(
          (carpark.name && carpark.name.toLowerCase().includes(search.toLowerCase())) ||
          (carpark.displayAddress && carpark.displayAddress.toLowerCase().includes(search.toLowerCase()))
        )
      ) {
        return false;
      }
      return true;
    });

  const favoriteCarparks = filterCarparks(carparks.filter(c => favorites.includes(c.park_Id)));
  const otherCarparks = filterCarparks(carparks.filter(c => !favorites.includes(c.park_Id)));

  // Map modal
  const handleShowMap = carpark => {
    setMapInfo(carpark);
    setShowMap(true);
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Hong Kong Parking Information</h1>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Vehicle Type:</Form.Label>
            <Form.Select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
              {VEHICLE_TYPES.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Search (Name or Address):</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Enter name or address"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <Button variant="outline-secondary" onClick={() => setSearch('')}>Clear</Button>
              )}
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div style={{ marginTop: 10, fontWeight: 'bold', fontSize: '1.2em', letterSpacing: '2px', color: '#007bff', animation: 'blinker 1s linear infinite' }}>
            Loading...
          </div>
          <style>
            {`
              @keyframes blinker {
                50% { opacity: 0.3; }
              }
            `}
          </style>
        </div>
      ) : (
        <>
          {favoriteCarparks.length > 0 && (
            <>
              <h2>Favorite Parking Lots <Badge bg="warning">{favoriteCarparks.length}</Badge></h2>
              <CarparkTable
                carparks={favoriteCarparks}
                vehicleType={vehicleType}
                onShowMap={handleShowMap}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
              />
            </>
          )}

          <h2 className="mt-4">All Parking Lots <Badge bg="info">{otherCarparks.length}</Badge></h2>
          <CarparkTable
            carparks={otherCarparks}
            vehicleType={vehicleType}
            onShowMap={handleShowMap}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
          />
          {favoriteCarparks.length + otherCarparks.length === 0 && (
            <p className="text-center text-danger font-weight-bold mt-4">
              No results found. Please adjust the filter conditions or try again.
            </p>
          )}
        </>
      )}

      {/* Map Modal */}
      <Modal show={showMap} onHide={() => setShowMap(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Carpark Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <strong>Name:</strong> {mapInfo.name}<br />
            <strong>Address:</strong> {mapInfo.displayAddress}<br />
            <strong>Status:</strong> <StatusBadge status={mapInfo.opening_status} /><br />
            <strong>Vacancy:</strong> {mapInfo[`${vehicleType}_vacancy`]}
          </div>
          <iframe
            id="map"
            title="Google Map"
            src={mapInfo.latitude && mapInfo.longitude
              ? `https://www.google.com/maps?q=${mapInfo.latitude},${mapInfo.longitude}&output=embed`
              : ''}
            width="100%"
            height="350"
            style={{ border: 0, marginTop: 10 }}
            allowFullScreen=""
            loading="lazy"
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  if (status === 'OPEN')
    return <span style={{ color: 'green', fontWeight: 'bold' }}>OPEN</span>;
  if (status === 'CLOSED')
    return <span style={{ background: 'red', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>CLOSED</span>;
  return <span>{status}</span>;
}

// Carpark Table Component
function CarparkTable({ carparks, vehicleType, onShowMap, onToggleFavorite, favorites }) {
  return (
    <>
      {/* Table for medium and larger screens */}
      <div className="d-none d-md-block">
        <Table striped hover responsive className="mt-3 align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Status</th>
              <th>Vacancies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {carparks.map(carpark => (
              <tr key={carpark.park_Id}>
                <td>
                  <Link to={`/info/${carpark.park_Id}`} style={{ fontWeight: 'bold', fontSize: '1.05em' }}>{carpark.name}</Link>
                </td>
                <td>
                  <span style={{ color: '#555' }}>{carpark.displayAddress}</span>
                </td>
                <td>
                  <StatusBadge status={carpark.opening_status} />
                </td>
                <td>
                  <Badge bg="success" style={{ fontSize: '1em' }}>
                    {carpark[`${vehicleType}_vacancy`]}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Button variant="info" size="sm" onClick={() => onShowMap(carpark)}>Map</Button>
                    <Button variant="link" size="sm" onClick={() => onToggleFavorite(carpark.park_Id)} title={favorites.includes(carpark.park_Id) ? "Remove Favorite" : "Add Favorite"}>
                      {favorites.includes(carpark.park_Id) ? <FaStar style={{ color: '#FFD700' }} /> : <FaRegStar style={{ color: '#888' }} />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* ListGroup for small screens */}
      <div className="d-md-none">
        <ListGroup>
          {carparks.map(carpark => (
            <ListGroup.Item key={carpark.park_Id}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Link to={`/info/${carpark.park_Id}`} style={{ fontWeight: 'bold' }}>{carpark.name}</Link>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9em' }}>{carpark.displayAddress}</p>
                  <div>
                    <StatusBadge status={carpark.opening_status} /> <Badge bg="success">{carpark[`${vehicleType}_vacancy`]}</Badge>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button variant="info" size="sm" onClick={() => onShowMap(carpark)}>Map</Button>
                  <Button variant="link" size="sm" onClick={() => onToggleFavorite(carpark.park_Id)} title={favorites.includes(carpark.park_Id) ? "Remove Favorite" : "Add Favorite"}>
                    {favorites.includes(carpark.park_Id) ? <FaStar style={{ color: '#FFD700' }} /> : <FaRegStar style={{ color: '#888' }} />}
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default Main;