import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Alert,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ordersAPI, productsAPI } from "../utils/api";

const Cart = () => {
  const { user } = useAuth();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
    loading,
  } = useCart();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        toast.error(
          `Not enough stock for ${item.product.name}. Available: ${item.product.stock}`
        );
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      const order = {
        userId: user.id,
        items: cartItems.map((item) => ({
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: getTotalPrice(),
        date: new Date().toISOString(),
        status: "pending",
      };

      console.log("Creating order:", order);
      console.log("User ID:", user.id);
      console.log("Token:", localStorage.getItem("token"));

      const response = await ordersAPI.createOrder(order);
      console.log("Order created successfully:", response.data);

      for (const item of cartItems) {
        try {
          const { data: product } = await productsAPI.getById(item.productId);
          const newStock = product.stock - item.quantity;

          if (newStock >= 0) {
            await productsAPI.updateProduct(item.productId, {
              stock: newStock,
            });
          }
        } catch (err) {
          console.error(
            `Failed to update stock for product ${item.productId}`,
            err
          );
        }
      }

      await clearCart();
      toast.success("Order placed successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);

      let errorMessage = "Failed to place order. Please try again.";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`Checkout failed: ${errorMessage}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <Alert.Heading>Please Login</Alert.Heading>
          <p>You need to be logged in to view your cart.</p>
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
        <h3>Loading cart...</h3>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">
          <Alert.Heading>Your cart is empty</Alert.Heading>
          <p>Start shopping to add items to your cart!</p>
          <Link to="/">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Shopping Cart</h1>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            loading="lazy"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              marginRight: "15px",
                            }}
                          />
                          <div>
                            <strong>{item.product.name}</strong>
                            <br />
                            <Badge bg="secondary">
                              {item.product.category}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td>${item.product.price}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              if (item.quantity >= item.product.stock) {
                                toast.warning(
                                  `Only ${item.product.stock} units available`
                                );
                                return;
                              }
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td>
                        <strong>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <strong>${getTotalPrice().toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <strong>Free</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span>Total:</span>
                <strong className="text-primary">
                  ${getTotalPrice().toFixed(2)}
                </strong>
              </div>
              <Button
                variant="primary"
                className="w-100"
                size="lg"
                onClick={handleCheckout}
                disabled={checkoutLoading || cartItems.length === 0}
              >
                {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
