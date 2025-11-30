import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  Table,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavourites } from "../context/FavouritesContext";
import { productsAPI } from "../utils/api";
import Reviews from "../components/Reviews";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();
  const { addToFavourites, removeFromFavourites, favourites } = useFavourites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Loads product details and related products by product id.
  const loadProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);

      const allProducts = await productsAPI.getAll();
      const related = allProducts.data
        .filter(
          (p) =>
            p.category === response.data.category && p.id !== response.data.id
        )
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Product not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const isInCart = cartItems?.some((item) => item.productId === product?.id);
  const isFavourite = favourites?.some((fav) => fav.productId === product?.id);

  // Adds the current product to the cart, or redirects to login if unauthenticated.
  const handleAddToCart = () => {
    if (user) {
      addToCart(product);
      toast.success("Product added to cart!");
    } else {
      toast.warning("Please login to add items to cart");
      navigate("/login");
    }
  };

  // Toggles favourite status for the product; redirects to login if needed.
  const handleFavouriteToggle = () => {
    if (user) {
      if (isFavourite) {
        const favouriteItem = favourites.find(
          (fav) => fav.productId === product.id
        );
        if (favouriteItem) {
          removeFromFavourites(favouriteItem.id);
          toast.info("Removed from favourites");
        }
      } else {
        addToFavourites(product);
        toast.success("Added to favourites!");
      }
    } else {
      toast.warning("Please login to add favourites");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!product) {
    const StarRating = ({ value = 0, max = 5 }) => {
      const filled = Math.round(value);
      const stars = Array.from({ length: filled }, () => "★");
      return (
        <span aria-label={`Rating ${value} out of ${max}`}>
          {stars.map((s, i) => (
            <span
              key={i}
              style={{ color: "#f5c518", fontSize: "1.1rem", marginRight: 2 }}
            >
              {s}
            </span>
          ))}
        </span>
      );
    };

    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Product Not Found</Alert.Heading>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button
        variant="outline-secondary"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        ← Back
      </Button>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Img
              variant="top"
              src={product.image}
              style={{ height: "500px", objectFit: "cover" }}
            />
          </Card>
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <Badge bg="secondary" className="me-2">
              {product.category}
            </Badge>
            <Badge bg="warning" text="dark">
              ⭐ {product.rating} / 5.0
            </Badge>
            {product.stock > 0 ? (
              product.stock > 10 ? (
                <Badge bg="success" className="ms-2">
                  In Stock ({product.stock} available)
                </Badge>
              ) : (
                <Badge bg="warning" className="ms-2">
                  Low Stock ({product.stock} left)
                </Badge>
              )
            ) : (
              <Badge bg="danger" className="ms-2">
                Out of Stock
              </Badge>
            )}
          </div>
          <h1 className="mb-3">{product.name}</h1>
          <h2 className="text-primary mb-4">${product.price}</h2>
          <p className="lead mb-4">{product.description}</p>

          <div className="mb-4">
            <h5>Product Details</h5>
            <ul>
              <li>Category: {product.category}</li>
              <li>Rating: {product.rating} / 5.0</li>
              <li>Stock Available: {product.stock} units</li>
            </ul>
            {product.specs && (
              <div className="mt-3">
                <h5>Specifications</h5>
                <Table striped bordered hover size="sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key}>
                        <td className="fw-bold" style={{ width: "40%" }}>
                          {key}
                        </td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>

          <div className="d-flex gap-3 mb-4">
            {user ? (
              <>
                <Button
                  variant={isInCart ? "success" : "primary"}
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isInCart || product.stock === 0}
                  className="flex-grow-1"
                >
                  {isInCart ? "✓ In Cart" : "Add to Cart"}
                </Button>
                <Button
                  variant={isFavourite ? "danger" : "outline-danger"}
                  size="lg"
                  onClick={handleFavouriteToggle}
                >
                  {isFavourite ? "❤️" : "🤍"}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={() => navigate("/login")}
              >
                Login to Purchase
              </Button>
            )}
          </div>

          {product.stock === 0 && (
            <Alert variant="warning">
              This product is currently out of stock.
            </Alert>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <Reviews productId={product.id} />
        </Col>
      </Row>

      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-4">Related Products</h3>
          <Row>
            {relatedProducts.map((relatedProduct) => (
              <Col
                key={relatedProduct.id}
                xs={12}
                sm={6}
                md={3}
                className="mb-4"
              >
                <Card className="h-100 shadow-sm">
                  <Link
                    to={`/product/${relatedProduct.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Card.Img
                      variant="top"
                      src={relatedProduct.image}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <Card.Title>{relatedProduct.name}</Card.Title>
                      <Card.Text className="text-muted">
                        {relatedProduct.description.substring(0, 60)}...
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge bg="secondary">{relatedProduct.category}</Badge>
                        <h5 className="text-primary mb-0">
                          ${relatedProduct.price}
                        </h5>
                      </div>
                    </Card.Body>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default ProductDetail;
