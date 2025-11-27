import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tab,
  Tabs,
  Table,
  Badge,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userAPI, ordersAPI } from "../utils/api";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const response = await ordersAPI.getOrders(user.id);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await userAPI.updateUser(user.id, formData);
      toast.success("Profile updated successfully!");
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    setCancelling(true);
    try {
      await ordersAPI.cancelOrder(orderToCancel.id);
      toast.success("Order cancelled successfully!");
      setShowCancelModal(false);
      setOrderToCancel(null);
      loadOrders();
    } catch (error) {
      toast.error("Failed to cancel order. Please try again.");
      console.error("Error cancelling order:", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await ordersAPI.deleteOrder(orderId);
      toast.success("Order deleted successfully!");
      loadOrders();
    } catch (error) {
      toast.error("Failed to delete order. Please try again.");
      console.error("Error deleting order:", error);
    }
  };

  const getOrderStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: "warning", text: "Pending" },
      processing: { variant: "info", text: "Processing" },
      shipped: { variant: "primary", text: "Shipped" },
      delivered: { variant: "success", text: "Delivered" },
      cancelled: { variant: "danger", text: "Cancelled" },
    };
    const statusInfo = statusMap[status] || {
      variant: "secondary",
      text: status,
    };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const canCancelOrder = (status) => {
    return status === "pending" || status === "processing";
  };

  if (!user) {
    return null;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">My Profile</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="profile" title="Profile Information">
          <Card>
            <Card.Body>
              <Form onSubmit={handleProfileUpdate}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="orders" title="Order History">
          <Card>
            <Card.Body>
              {ordersLoading ? (
                <div className="text-center py-4">
                  <p>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <Alert variant="info">
                  <Alert.Heading>No Orders Yet</Alert.Heading>
                  <p>
                    You haven't placed any orders yet. Start shopping to see
                    your order history here!
                  </p>
                  <Button variant="primary" onClick={() => navigate("/")}>
                    Browse Products
                  </Button>
                </Alert>
              ) : (
                <>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{new Date(order.date).toLocaleDateString()}</td>
                          <td>{order.items?.length || 0} item(s)</td>
                          <td>${order.total?.toFixed(2) || "0.00"}</td>
                          <td>{getOrderStatusBadge(order.status)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              {canCancelOrder(order.status) && (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => handleCancelOrder(order)}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <Modal
                    show={showCancelModal}
                    onHide={() => setShowCancelModal(false)}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Cancel Order</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      Are you sure you want to cancel order{" "}
                      <strong>#{orderToCancel?.id}</strong>?
                      <br />
                      This action cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant="secondary"
                        onClick={() => setShowCancelModal(false)}
                      >
                        No, Keep Order
                      </Button>
                      <Button
                        variant="warning"
                        onClick={confirmCancelOrder}
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Profile;
