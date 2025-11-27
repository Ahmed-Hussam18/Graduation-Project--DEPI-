import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouritesContext';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Favourites = () => {
  const { user } = useAuth();
  const { favourites, loading } = useFavourites();

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <Alert.Heading>Please Login</Alert.Heading>
          <p>You need to be logged in to view your favourites.</p>
          <Link to="/login">
            <Button variant="primary">Go to Login</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <h3>Loading favourites...</h3>
      </Container>
    );
  }

  if (favourites.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">
          <Alert.Heading>No favourites yet</Alert.Heading>
          <p>Start adding products to your favourites!</p>
          <Link to="/">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">My Favourites</h1>
      <Row>
        {favourites.map((fav) => (
          <Col key={fav.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <ProductCard product={fav.product} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Favourites;

