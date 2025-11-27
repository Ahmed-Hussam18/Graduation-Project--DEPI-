import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Badge,
  Card,
  Button,
  Collapse,
} from "react-bootstrap";
import { productsAPI } from "../utils/api";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 15000]);
  const [minRating, setMinRating] = useState(0);
  const [debouncedMinRating, setDebouncedMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  // Debounce price range changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Debounce rating changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinRating(minRating);
    }, 500);
    return () => clearTimeout(timer);
  }, [minRating]);

  useEffect(() => {
    filterProducts();
  }, [
    products,
    searchTerm,
    selectedCategory,
    debouncedPriceRange,
    debouncedMinRating,
    sortBy,
  ]);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    filtered = filtered.filter(
      (product) =>
        product.price >= debouncedPriceRange[0] &&
        product.price <= debouncedPriceRange[1]
    );

    if (debouncedMinRating > 0) {
      filtered = filtered.filter(
        (product) => product.rating >= debouncedMinRating
      );
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
  };

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  if (loading) {
    return (
      <Container className="text-center py-5">
        <h3>Loading products...</h3>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Container>
        <div className="text-center mb-5 py-4">
          <h1 className="display-4 fw-bold mb-3">Electronics Store</h1>
          <p className="lead text-muted">Discover the latest in technology</p>
        </div>

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Label className="fw-semibold mb-2">
                  Search Products
                </Form.Label>
                <InputGroup size="lg">
                  <InputGroup.Text>
                    <i className="bi bi-search">🔍</i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0"
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-semibold mb-2">Sort By</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  size="lg"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-controls="filters-collapse"
                  aria-expanded={showFilters}
                >
                  {showFilters ? "▲ Hide Filters" : "▼ Show Filters"}
                </Button>
              </Col>
            </Row>

            <Collapse in={showFilters}>
              <div id="filters-collapse" className="mt-4 pt-4 border-top">
                <Row className="g-4">
                  <Col md={3}>
                    <Form.Label className="fw-semibold">Category</Form.Label>
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label className="fw-semibold">
                      Min Price:{" "}
                      <span className="text-primary">${priceRange[0]}</span>
                    </Form.Label>
                    <Form.Range
                      min={0}
                      max={15000}
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([parseInt(e.target.value), priceRange[1]])
                      }
                      className="mt-2"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="fw-semibold">
                      Max Price:{" "}
                      <span className="text-primary">${priceRange[1]}</span>
                    </Form.Label>
                    <Form.Range
                      min={0}
                      max={15000}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="mt-2"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="fw-semibold">
                      Min Rating:{" "}
                      <span className="text-warning">
                        ⭐ {minRating.toFixed(1)}+
                      </span>
                    </Form.Label>
                    <Form.Range
                      min={0}
                      max={5}
                      step={0.5}
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="mt-2"
                    />
                  </Col>
                </Row>
              </div>
            </Collapse>
          </Card.Body>
        </Card>

        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <Badge bg="info" className="fs-6 px-3 py-2">
              Showing <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> products
            </Badge>
          </div>
          {(searchTerm ||
            selectedCategory !== "All" ||
            priceRange[0] > 0 ||
            priceRange[1] < 15000 ||
            minRating > 0) && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setPriceRange([0, 15000]);
                setMinRating(0);
                setSortBy("default");
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <h4 className="mb-3">No products found</h4>
              <p className="text-muted mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setPriceRange([0, 15000]);
                  setMinRating(0);
                  setSortBy("default");
                }}
              >
                Clear Filters
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Container>
  );
};

export default Home;
