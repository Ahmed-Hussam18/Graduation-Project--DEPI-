import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavourites } from "../context/FavouritesContext";

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { favourites } = useFavourites();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const cartCount = cartItems?.length || 0;
  const favouritesCount = favourites?.length || 0;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🛒 Electronics Store
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/cart">
                  Cart{" "}
                  {cartCount > 0 && <Badge bg="primary">{cartCount}</Badge>}
                </Nav.Link>
                <Nav.Link as={Link} to="/favourites">
                  Favourites{" "}
                  {favouritesCount > 0 && (
                    <Badge bg="danger">{favouritesCount}</Badge>
                  )}
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile" className="me-3">
                  Profile
                </Nav.Link>
                <Nav.Link className="me-3" style={{ pointerEvents: "none" }}>
                  Welcome, {user.name || user.email}!
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
