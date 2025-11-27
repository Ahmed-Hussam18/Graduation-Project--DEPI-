import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavourites } from "../context/FavouritesContext";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();
  const { addToFavourites, removeFromFavourites, favourites } = useFavourites();

  const isInCart = cartItems?.some((item) => item.productId === product.id);
  const isFavourite = favourites?.some((fav) => fav.productId === product.id);

  const handleAddToCart = () => {
    if (user) {
      addToCart(product);
    }
  };

  const handleFavouriteToggle = (e) => {
    e.preventDefault();
    e.currentTarget.blur();

    if (user) {
      if (isFavourite) {
        const favouriteItem = favourites.find(
          (fav) => fav.productId === product.id
        );
        if (favouriteItem) {
          removeFromFavourites(favouriteItem.id);
        }
      } else {
        addToFavourites(product);
      }
    }
  };

  return (
    <Card className="h-100 shadow-sm">
      <div className="position-relative">
        <Link to={`/product/${product.id}`}>
          <Card.Img
            variant="top"
            src={product.image}
            loading="lazy"
            style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
          />
        </Link>
        {user && (
          <Button
            variant={isFavourite ? "danger" : "outline-danger"}
            size="sm"
            className="position-absolute top-0 end-0 m-2"
            onClick={handleFavouriteToggle}
            style={{
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              zIndex: 10,
            }}
          >
            {isFavourite ? "❤️" : "🤍"}
          </Button>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Link
          to={`/product/${product.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Card.Title style={{ cursor: "pointer" }}>{product.name}</Card.Title>
        </Link>
        <Card.Text className="text-muted">{product.description}</Card.Text>
        <div className="mb-2">
          <Badge bg="secondary">{product.category}</Badge>
          <Badge bg="warning" text="dark" className="ms-2">
            ⭐ {product.rating}
          </Badge>
          {product.stock > 0 ? (
            product.stock > 10 ? (
              <Badge bg="success" className="ms-2">
                In Stock
              </Badge>
            ) : (
              <Badge bg="warning" className="ms-2">
                Low Stock
              </Badge>
            )
          ) : (
            <Badge bg="danger" className="ms-2">
              Out of Stock
            </Badge>
          )}
        </div>
        <div className="mt-auto">
          <h5 className="text-primary mb-3">${product.price}</h5>
          {user ? (
            <Button
              variant={isInCart ? "success" : "primary"}
              className="w-100"
              onClick={handleAddToCart}
              disabled={isInCart || product.stock === 0}
            >
              {isInCart
                ? "In Cart"
                : product.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
          ) : (
            <Button variant="outline-primary" className="w-100" disabled>
              Login to Add
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
