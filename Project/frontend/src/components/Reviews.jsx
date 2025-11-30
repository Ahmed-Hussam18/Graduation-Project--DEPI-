import { useState, useEffect } from "react";
import { Card, Form, Button, Badge, Alert, Row, Col } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { reviewsAPI } from "../utils/api";

const Reviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  });
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    setReviews([]);
    setUserReview(null);
    setFormData({ rating: 5, comment: "" });
    setLoading(true);
    loadReviews();
    if (user) {
      checkUserReview();
    }
  }, [productId, user]);

  // Loads all reviews for the current product.
  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getReviews(productId);
      setReviews(response.data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Checks if the current user already wrote a review for this product.
  const checkUserReview = async () => {
    try {
      const response = await reviewsAPI.getUserReview(user.id, productId);
      if (response.data && response.data.length > 0) {
        setUserReview(response.data[0]);
        setFormData({
          rating: response.data[0].rating,
          comment: response.data[0].comment,
        });
      }
    } catch (error) {
      console.error("Error checking user review:", error);
    }
  };

  // Creates or updates the user's review for the product.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Please login to leave a review");
      return;
    }

    setSubmitting(true);
    try {
      if (userReview) {
        await reviewsAPI.updateReview(userReview.id, {
          rating: formData.rating,
          comment: formData.comment,
        });
        toast.success("Review updated successfully!");
      } else {
        await reviewsAPI.createReview({
          userId: user.id,
          productId: productId,
          userName: user.name || user.email,
          rating: formData.rating,
          comment: formData.comment,
          date: new Date().toISOString(),
        });
        toast.success("Review submitted successfully!");
      }
      setShowForm(false);
      setFormData({ rating: 5, comment: "" });
      loadReviews();
      if (user) checkUserReview();
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Deletes the specified review after user confirmation.
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) {
      return;
    }

    try {
      await reviewsAPI.deleteReview(reviewId);
      toast.success("Review deleted successfully!");
      setUserReview(null);
      setFormData({ rating: 5, comment: "" });
      loadReviews();
    } catch (error) {
      toast.error("Failed to delete review. Please try again.");
      console.error("Error deleting review:", error);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (loading) {
    return <div className="text-center py-3">Loading reviews...</div>;
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Customer Reviews</h4>
          {reviews.length > 0 && (
            <div className="mt-2">
              <Badge bg="primary" className="me-2">
                ⭐ {averageRating} / 5.0
              </Badge>
              <span className="text-muted">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
        {user && !userReview && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            Write a Review
          </Button>
        )}
      </div>

      {user && !userReview && showForm && (
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      variant={
                        star <= formData.rating
                          ? "warning"
                          : "outline-secondary"
                      }
                      className="me-1"
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      ⭐
                    </Button>
                  ))}
                  <span className="ms-2">{formData.rating} / 5</span>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder="Share your experience with this product..."
                  required
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {user && userReview && (
        <Card className="mb-4 border-primary">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6>Your Review</h6>
                <div className="mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        color: i < userReview.rating ? "#ffc107" : "#ccc",
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                  <span className="ms-2">{userReview.rating} / 5</span>
                </div>
                <p className="mb-0">{userReview.comment}</p>
                <small className="text-muted">
                  {new Date(userReview.date).toLocaleDateString()}
                </small>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(userReview.id)}
              >
                Delete
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {reviews.length === 0 && !userReview && (
        <Alert variant="info">
          <Alert.Heading>No Reviews Yet</Alert.Heading>
          <p>Be the first to review this product!</p>
        </Alert>
      )}

      <div className="reviews-list">
        {reviews
          .filter((review) => !userReview || review.id !== userReview.id)
          .map((review) => (
            <Card key={review.id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{review.userName || "Anonymous"}</strong>
                    <div className="mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < review.rating ? "#ffc107" : "#ccc",
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                      <span className="ms-2">{review.rating} / 5</span>
                    </div>
                  </div>
                  <small className="text-muted">
                    {new Date(review.date).toLocaleDateString()}
                  </small>
                </div>
                <p className="mb-0">{review.comment}</p>
              </Card.Body>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Reviews;
