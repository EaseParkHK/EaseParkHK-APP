import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Table, Spinner, Button } from 'react-bootstrap';

const vehicleTypeNames = {
    privateCar: 'Private Car',
    LGV: 'Large Goods Vehicle',
    HGV: 'Heavy Goods Vehicle',
    motorCycle: 'Motor Cycle',
    coach: 'Coach',
};

const CarparkDetail = ({ parkId }) => {
    const [carpark, setCarpark] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarparkData = async () => {
            setLoading(true);
            try {
                const [res1, res2] = await Promise.all([
                    fetch('https://api.data.gov.hk/v1/carpark-info-vacancy'),
                    fetch('https://api.data.gov.hk/v1/carpark-info-vacancy?data=vacancy&lang=en_US'),
                ]);
                const data1 = await res1.json();
                const data2 = await res2.json();

                const carparkData = data1.results.find(
                    (cp) => String(cp.park_Id) === String(parkId)
                );

                const vacancyInfo = {};
                data2.results.forEach((item) => {
                    vacancyInfo[item.park_Id] = item;
                });

                if (carparkData) {
                    const pid = carparkData.park_Id;
                    let carparkVacancies = [];
                    if (vacancyInfo[pid]) {
                        Object.entries(vacancyInfo[pid]).forEach(([vehicleType, details]) => {
                            if (Array.isArray(details)) {
                                details.forEach((detail) => {
                                    carparkVacancies.push({
                                        type: vehicleTypeNames[vehicleType] || vehicleType,
                                        vacancy: detail.vacancy,
                                        last_update: detail.lastupdate,
                                    });
                                });
                            }
                        });
                    }
                    carparkData.vacancy_data = carparkVacancies;

                    // Price extraction
                    if (
                        carparkData.privateCar &&
                        carparkData.privateCar.hourlyCharges &&
                        carparkData.privateCar.hourlyCharges.length > 0
                    ) {
                        carparkData.price = carparkData.privateCar.hourlyCharges[0].price;
                    } else {
                        carparkData.price = 'N/A';
                    }
                }

                setCarpark(carparkData || null);
            } catch (err) {
                console.error('Fetch error:', err);
                setCarpark(null);
            }
            setLoading(false);
        };

        fetchCarparkData();
    }, [parkId]);

    const showMap = () => {
        document.getElementById('map-container').style.display = 'block';
    };

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
                    {carpark.renditionUrls && carpark.renditionUrls.carpark_photo && (
                        <img
                            src={carpark.renditionUrls.carpark_photo}
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
                        onClick={showMap}
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
                        <strong>Contact:</strong> {carpark.contactNo}
                    </p>
                    <p>
                        <strong>Website:</strong>{' '}
                        <a href={carpark.website} target="_blank" rel="noopener noreferrer">
                            {carpark.website}
                        </a>
                    </p>
                    <p>
                        <strong>Opening Status:</strong>{' '}
                        {carpark.opening_status === 'OPEN' ? (
                            <span style={{ color: 'green', fontWeight: 'bold' }}>OPEN</span>
                        ) : (
                            <span style={{ background: 'red', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>CLOSED</span>
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