import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Table, Spinner, Button } from 'react-bootstrap';

const vehicleTypeNames = {
  P: 'Private Car',
  P_D: 'Private Car (Disabled)',
  M: 'Motorcycle',
  LGV: 'Light Goods Vehicle',
  HGV: 'Heavy Goods Vehicle',
  COACH: 'Coach',
};

const CarparkDetail = ({ parkId }) => {
  const [carpark, setCarpark] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarparkData = async () => {
      setLoading(true);
      try {
        const [vacancyRes, infoRes] = await Promise.all([
          fetch('https://resource.data.one.gov.hk/td/carpark/vacancy_all.json'),
          fetch('https://resource.data.one.gov.hk/td/carpark/basic_info_all.json'),
        ]);
        const vacancyData = await vacancyRes.json();
        const infoData = await infoRes.json();

        // Find carpark info by park_id
        const info = (infoData.car_park || []).find(cp => String(cp.park_id) === String(parkId));
        if (!info) {
          setCarpark(null);
          setLoading(false);
          return;
        }

        // Find vacancy info by park_id
        const vacancy = (vacancyData.car_park || []).find(cp => String(cp.park_id) === String(parkId));

        // Compose vacancy data
        let vacancyDataArr = [];
        if (vacancy && Array.isArray(vacancy.vehicle_type)) {
          vacancy.vehicle_type.forEach(vt => {
            const hourly = (vt.service_category || []).find(sc => sc.category === 'HOURLY');
            vacancyDataArr.push({
              type: vehicleTypeNames[vt.type] || vt.type,
              vacancy: hourly ? hourly.vacancy : 'N/A',
              last_update: hourly ? hourly.lastupdate : '',
            });
          });
        }

        // Compose detail object
        setCarpark({
          name: info.name_en,
          displayAddress: info.displayAddress_en,
          contactNo: info.contactNo,
          website: info.website_en,
          opening_status: info.opening_status || 'UNKNOWN',
          price: extractPrice(info.remark_en),
          latitude: info.latitude,
          longitude: info.longitude,
          carpark_photo: info.carpark_photo,
          vacancy_data: vacancyDataArr,
        });
      } catch (err) {
        setCarpark(null);
      }
      setLoading(false);
    };

    fetchCarparkData();
  }, [parkId]);

  // Extract price from remark_en (e.g. "*Private Car / Van<br>$20 per hour")
  function extractPrice(remark) {
    if (!remark) return 'N/A';
    const match = remark.match(/\$([\d.]+)\s*per\s*hour/i);
    return match ? `$${match[1]} per hour` : 'N/A';
  }

  if (loading)
    return (
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
    );
  if (!carpark) return <div className="text-center text-danger font-weight-bold mt-4">Carpark not found</div>;

  return (
    <Container className="mt-5">
      <Row>
        <Col md={4} className="d-flex flex-column align-items-center">
          {carpark.carpark_photo && (
            <img
              src={carpark.carpark_photo}
              alt="Car Park"
              className="carpark-photo mb-3"
              style={{
                maxWidth: 300,
                height: 'auto',
                borderRadius: 5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          )}
          <Button
            variant="outline-primary"
            className="mt-2"
            id="view-map-button"
            onClick={() => {
              const el = document.getElementById('map-container');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ width: '100%' }}
          >
            View on Map
          </Button>
        </Col>
        <Col md={8}>
          <h1 style={{ fontWeight: 'bold', color: '#007bff' }}>{carpark.name}</h1>
          <p>
            <strong>Address:</strong> {carpark.displayAddress}
          </p>
          <p>
            <strong>Contact:</strong> {carpark.contactNo || 'N/A'}
          </p>
          <p>
            <strong>Website:</strong>{' '}
            {carpark.website ? (
              <a href={carpark.website} target="_blank" rel="noopener noreferrer">
                {carpark.website}
              </a>
            ) : 'N/A'}
          </p>
          <p>
            <strong>Opening Status:</strong>{' '}
            {carpark.opening_status === 'OPEN' ? (
              <span style={{ color: 'green', fontWeight: 'bold' }}>OPEN</span>
            ) : carpark.opening_status === 'CLOSED' ? (
              <span style={{ background: 'red', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>CLOSED</span>
            ) : (
              <span>{carpark.opening_status}</span>
            )}
          </p>
          <p>
            <strong>Price (Private Car):</strong> <Badge bg="info">{carpark.price}</Badge>
          </p>
        </Col>
      </Row>
      <h2 className="mt-4 mb-3">Car Park Vacancy</h2>
      <Table striped hover responsive className="align-middle">
        <thead>
          <tr>
            <th>Type</th>
            <th>Vacancy</th>
            <th>Last Update Time</th>
          </tr>
        </thead>
        <tbody>
          {carpark.vacancy_data &&
            carpark.vacancy_data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.type}</td>
                <td>
                  <Badge bg="success" style={{ fontSize: '1em' }}>
                    {item.vacancy}
                  </Badge>
                </td>
                <td>{item.last_update}</td>
              </tr>
            ))}
        </tbody>
      </Table>
      <div
        id="map-container"
        style={{
          marginTop: 20,
          width: '100%',
          height: 400,
          display: 'block',
        }}
      >
        <iframe
          id="map"
          title="Carpark Map"
          style={{ width: '100%', height: '100%', border: 'none' }}
          src={`https://maps.google.com/?q=${carpark.latitude},${carpark.longitude}&output=embed`}
        />
      </div>
    </Container>
  );
};

export default CarparkDetail;