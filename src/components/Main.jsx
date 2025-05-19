import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col, Badge, InputGroup, Spinner, ListGroup } from 'react-bootstrap';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Vehicle types mapping
const VEHICLE_TYPES = [
  { value: 'P', label: 'Private Car' },
  { value: 'P_D', label: 'Private Car (Disabled)' },
  { value: 'M', label: 'Motorcycle' },
  { value: 'LGV', label: 'Light Goods Vehicle' },
  { value: 'HGV', label: 'Heavy Goods Vehicle' },
  { value: 'COACH', label: 'Coach' },
];

function Main() {
  const [carparks, setCarparks] = useState([]);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorite_carparks') || '[]'));
  const [vehicleType, setVehicleType] = useState(() => localStorage.getItem('selected_vehicle_type') || 'P');
  const [showMap, setShowMap] = useState(false);
  const [mapInfo, setMapInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  // Save selected vehicle type to localStorage
  useEffect(() => {
    localStorage.setItem('selected_vehicle_type', vehicleType);
  }, [vehicleType]);

  // Fetch car park data from APIs
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [infoRes, vacancyRes] = await Promise.all([
          fetch('https://resource.data.one.gov.hk/td/carpark/basic_info_all.json'),
          fetch('https://resource.data.one.gov.hk/td/carpark/vacancy_all.json'),
        ]);
        const infoData = await infoRes.json();
        const vacancyData = await vacancyRes.json();

        // Build vacancy map: park_id -> { vehicle_type -> { vacancy, vacancy_type, lastupdate } }
        const vacancyMap = {};
        for (const item of vacancyData.car_park || []) {
          vacancyMap[item.park_id] = {};
          for (const vt of item.vehicle_type || []) {
            const hourly = (vt.service_category || []).find(sc => sc.category === 'HOURLY');
            vacancyMap[item.park_id][vt.type] = hourly
              ? {
                  vacancy: hourly.vacancy,
                  vacancy_type: hourly.vacancy_type,
                  lastupdate: hourly.lastupdate,
                }
              : { vacancy: 'N/A', vacancy_type: '', lastupdate: '' };
          }
        }

        // Combine basic info with vacancy data, using English names and district
        const combined = (infoData.car_park || []).map(carpark => {
          const parkId = carpark.park_id;
          const vacancy = vacancyMap[parkId] || {};
          const result = {
            ...carpark,
            park_Id: parkId,
            name: carpark.name_en,
            displayAddress: carpark.displayAddress_en,
            district: carpark.district_en,
            contactNo: carpark.contactNo || 'N/A',
            opening_status: carpark.opening_status || 'UNKNOWN',
            latitude: carpark.latitude,
            longitude: carpark.longitude,
          };
          for (const vt of VEHICLE_TYPES.map(v => v.value)) {
            result[`${vt}_vacancy`] = vacancy[vt]?.vacancy ?? 'N/A';
            result[`${vt}_vacancy_type`] = vacancy[vt]?.vacancy_type ?? '';
          }
          return result;
        });

        setCarparks(combined);
      } catch (error) {
        console.error('Error fetching car park data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Toggle favorite status for a car park
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

  // Filter car parks based on status and search
  const filterCarparks = list =>
    list.filter(carpark => {
      if (showOnlyOpen && carpark.opening_status !== 'OPEN') return false;
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

  // Show map for a selected car park
  const handleShowMap = carpark => {
    setMapInfo(carpark);
    setShowMap(true);
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Hong Kong Parking Information</h1>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Vehicle Type:</Form.Label>
            <Form.Select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
              {VEHICLE_TYPES.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
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
        <Col md={4} className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            label="Show only open car parks"
            checked={showOnlyOpen}
            onChange={e => setShowOnlyOpen(e.target.checked)}
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div style={{ marginTop: 10, fontWeight: 'bold', fontSize: '1.2em', color: '#007bff' }}>
            Loading...
          </div>
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
            <p className="text-center text-danger mt-4">
              No results found. Try adjusting your search or filters.
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
            <strong>Name:</strong> {mapInfo.name || 'N/A'}<br />
            <strong>District:</strong> {mapInfo.district || 'N/A'}<br />
            <strong>Address:</strong> {mapInfo.displayAddress || 'N/A'}<br />
            <strong>Contact:</strong> {mapInfo.contactNo || 'N/A'}<br />
            <strong>Status:</strong> <StatusBadge status={mapInfo.opening_status} /><br />
            <strong>Vacancy:</strong> {mapInfo[`${vehicleType}_vacancy`] || 'N/A'}
          </div>
          {mapInfo.latitude && mapInfo.longitude ? (
            <iframe
              title="Google Map"
              src={`https://www.google.com/maps?q=${mapInfo.latitude},${mapInfo.longitude}&output=embed`}
              width="100%"
              height="350"
              style={{ border: 0, marginTop: 10 }}
              allowFullScreen=""
              loading="lazy"
            />
          ) : (
            <p>Location not available</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

// Status badge component
function StatusBadge({ status }) {
  if (status === 'OPEN') return <span style={{ color: 'green', fontWeight: 'bold' }}>OPEN</span>;
  if (status === 'CLOSED') return <span style={{ background: 'red', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>CLOSED</span>;
  return <span style={{ color: 'gray' }}>UNKNOWN</span>;
}

// Carpark table component with sorting
function CarparkTable({ carparks, vehicleType, onShowMap, onToggleFavorite, favorites }) {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = column => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const sortedCarparks = [...carparks].sort((a, b) => {
    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    if (sortColumn === 'vacancy') {
      aValue = a[`${vehicleType}_vacancy`] === 'N/A' ? -Infinity : parseInt(a[`${vehicleType}_vacancy`], 10);
      bValue = b[`${vehicleType}_vacancy`] === 'N/A' ? -Infinity : parseInt(b[`${vehicleType}_vacancy`], 10);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <>
      {/* Desktop Table */}
      <div className="d-none d-md-block">
        <Table striped hover responsive className="mt-3 align-middle">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('district')} style={{ cursor: 'pointer' }}>
                District {sortColumn === 'district' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('displayAddress')} style={{ cursor: 'pointer' }}>
                Address {sortColumn === 'displayAddress' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('opening_status')} style={{ cursor: 'pointer' }}>
                Status {sortColumn === 'opening_status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('vacancy')} style={{ cursor: 'pointer' }}>
                Vacancy {sortColumn === 'vacancy' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCarparks.map(carpark => (
              <tr key={carpark.park_Id}>
                <td>
                  <Link to={`/info/${carpark.park_Id}`} style={{ fontWeight: 'bold', color: '#007bff', textDecoration: 'underline' }}>
                    {carpark.name}
                  </Link>
                </td>
                <td>{carpark.district}</td>
                <td>{carpark.displayAddress}</td>
                <td><StatusBadge status={carpark.opening_status} /></td>
                <td>
                  {carpark[`${vehicleType}_vacancy`] !== 'N/A' ? (
                    <Badge bg="success">{carpark[`${vehicleType}_vacancy`]}</Badge>
                  ) : (
                    <Badge bg="secondary">N/A</Badge>
                  )}
                </td>
                <td>
                  <Button variant="info" size="sm" onClick={() => onShowMap(carpark)}>Map</Button>{' '}
                  <Button variant="link" size="sm" onClick={() => onToggleFavorite(carpark.park_Id)}>
                    {favorites.includes(carpark.park_Id) ? <FaStar style={{ color: '#FFD700' }} /> : <FaRegStar />}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Mobile ListGroup */}
      <div className="d-md-none">
        <ListGroup>
          {sortedCarparks.map(carpark => (
            <ListGroup.Item key={carpark.park_Id}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Link to={`/info/${carpark.park_Id}`} style={{ fontWeight: 'bold', color: '#007bff', textDecoration: 'underline' }}>
                    {carpark.name} ({carpark.district})
                  </Link>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9em' }}>{carpark.displayAddress}</p>
                  <div>
                    <StatusBadge status={carpark.opening_status} />{' '}
                    {carpark[`${vehicleType}_vacancy`] !== 'N/A' ? (
                      <Badge bg="success">{carpark[`${vehicleType}_vacancy`]}</Badge>
                    ) : (
                      <Badge bg="secondary">N/A</Badge>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="info" size="sm" onClick={() => onShowMap(carpark)}>Map</Button>
                  <Button variant="link" size="sm" onClick={() => onToggleFavorite(carpark.park_Id)}>
                    {favorites.includes(carpark.park_Id) ? <FaStar style={{ color: '#FFD700' }} /> : <FaRegStar />}
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