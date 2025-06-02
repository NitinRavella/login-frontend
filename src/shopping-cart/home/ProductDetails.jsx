// ProductDetailsComponent.js
import React from 'react';
import {
    Container, Row, Col, Button, Spinner, Toast, ToastBody, ToastHeader
} from 'reactstrap';
import { FaRegHeart, FaHeart, FaShoppingCart } from 'react-icons/fa';
import api from '../utils/Api';
import withRouter from '../components/WithRoute';
import { addToCart, toggleLike } from '../../redux/actions/productActions';
import { connect } from 'react-redux';
import '../../styles/ProductDetails.css';
import ReviewForm from '../components/RatingComponent';

class ProductDetailsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            product: null,
            loading: true,
            selectedImage: null,
            toastVisible: false,
            toastMessage: '',
            toastColor: 'success',
            addedToCart: false,
            cartAnimating: false,
            liking: false,
            liked: false,
        };
    }

    componentDidMount() {
        this.fetchProduct();
    }

    fetchProduct = async () => {
        const { id: productId } = this.props.params;
        const userId = sessionStorage.getItem('userId');

        this.setState({ loading: true });

        try {
            const productRes = await api.get(`/products/${productId}`);
            let liked = false;

            if (userId) {
                const userRes = await api.get(`/${userId}/liked-products`);
                const likedProductIds = userRes.data?.likedProductsIds || [];
                liked = likedProductIds.includes(productId.toString());
            }

            this.setState({
                product: productRes.data,
                liked,
                loading: false,
                selectedImage: productRes.data.productImages?.[0] || productRes.data.image
            });
        } catch (error) {
            console.error("Failed to fetch product:", error);
            this.showToast('Failed to fetch product', 'danger');
            this.setState({ loading: false });
        }
    };


    renderStars = (rating) => {
        const maxStars = 5;
        let stars = '';
        for (let i = 0; i < maxStars; i++) {
            stars += i < rating ? '★' : '☆';
        }
        return stars;
    };

    showToast = (message, color = 'success', duration = 1000) => {
        this.setState({ toastVisible: true, toastMessage: message, toastColor: color });
        setTimeout(() => {
            this.setState({ toastVisible: false });
        }, duration);
    };

    handleLikeToggle = () => {
        const { product, liked } = this.state;
        this.setState({ liking: true });
        this.props.toggleLike(product._id, liked)
            .then((newLikedStatus) => {
                this.setState({ liked: newLikedStatus });
                this.showToast(newLikedStatus ? "Product liked" : "Product unliked");
            })
            .catch((err) => {
                this.showToast(err.message, 'danger');
            })
            .finally(() => {
                this.setState({ liking: false });
            });
    };

    handleAddToCart = () => {
        const { product } = this.state;
        this.setState({ cartAnimating: true, addedToCart: true });

        this.props.addToCart(product)
            .then(() => {
                this.showToast('Added to cart!');
            })
            .catch((err) => {
                console.error('error', err)
                this.showToast(err.message, 'danger');
                this.setState({ cartAnimating: false, addedToCart: false });
            })
            .finally(() => {
                setTimeout(() => this.setState({ cartAnimating: false, addedToCart: false }), 1000);
            });
    };


    render() {
        const { product, loading, toastVisible, toastMessage, toastColor, liked, liking, addedToCart, cartAnimating } = this.state;

        if (loading) return (
            <Container className="mt-5 text-center">
                <Spinner color="primary">Loading...</Spinner>
            </Container>
        );
        if (!product) return (
            <Container className="mt-5">
                <h4>Product not found.</h4>
            </Container>
        );

        return (
            <Container className="mt-5 product-details-container">
                <Row>
                    <Col md="6" className="product-images-column">
                        <Row className="flex-md-row flex-column-reverse align-items-center">
                            <Col
                                md="3"
                                className="thumbnail-gallery d-flex flex-md-column flex-row flex-wrap justify-content-center align-items-center"
                            >
                                {product.productImages && product.productImages.length > 0 ? (
                                    product.productImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Product view ${idx + 1}`}
                                            className={`thumbnail-image ${this.state.selectedImage === img ? 'selected-thumbnail' : ''}`}
                                            onClick={() => this.setState({ selectedImage: img })}
                                        />
                                    ))
                                ) : (
                                    <p>No images available</p>
                                )}
                            </Col>
                            <Col md="9" className="main-image-container text-center mb-3">
                                <img src={this.state.selectedImage} alt="Selected" className="main-product-image" />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="6">
                        <h2>{product.name}</h2>
                        <p className="text-muted">{product.category}</p>
                        {!isNaN(parseFloat(product.price)) ? (
                            product.offerPrice ? (
                                <div className="price-container">
                                    <p className="text-success fw-semibold me-2">₹{product.offerPrice}</p>
                                    <p className="discount-price">
                                        ({Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF)
                                    </p>
                                    <p className="original-price">₹{product.price}</p>
                                </div>
                            ) : (
                                <p className="text-success fw-semibold">₹{product.price}</p>
                            )
                        ) : (
                            <p className="text-muted fw-semibold">{product.price}</p>
                        )}

                        <p className="product-description">{product.description}</p>
                        <p><strong>Stock:</strong> {product.stock}</p>
                        {product.stock <= 0 ? '' : (
                            <Row className="mt-4 d-flex gap-3 align-items-center">
                                <Col xs="6" md='4'>
                                    <Button
                                        className={`add-to-cart-btn btn d-flex align-items-center gap-2 ${addedToCart ? 'added' : ''}`}
                                        onClick={this.handleAddToCart}
                                        disabled={product.stock <= 0}
                                        color={addedToCart ? 'success' : 'primary'}
                                    >
                                        <span className="btn-text">Add to Cart</span>
                                        <span className="added-text">✔ Added!</span>
                                        <span className={`cart-icon ${cartAnimating ? 'animated' : ''}`}>
                                            <FaShoppingCart />
                                        </span>
                                    </Button>

                                </Col>
                                <Col xs='1' md='1' className="text-start">
                                    <Button color="link" onClick={this.handleLikeToggle} disabled={liking} className="p-0">
                                        {liked ? (
                                            <FaHeart size={32} color="red" />
                                        ) : (
                                            <FaRegHeart size={32} color="grey" />
                                        )}
                                    </Button>
                                </Col>
                            </Row>
                        )}
                        <div className="my-3">
                            <h5>Average Rating: {product.averageRating.toFixed(1)} / 5</h5>
                            <div className="rating-stars">{this.renderStars(Math.round(product.averageRating))}</div>
                        </div>

                        <div className="mt-4">
                            <h5>User Ratings:</h5>
                            {product.ratings.length === 0 && <p>No ratings yet.</p>}
                            {product.ratings.map((r, idx) => (
                                <div key={idx} className="rating-box">
                                    <Row className="align-items-center">
                                        <Col xs="5" className="d-flex align-items-center gap-3">
                                            {r.avatar ? (
                                                <img src={r.avatar} alt={r.userName} className="user-avatar" />
                                            ) : (
                                                <div className="default-avatar">
                                                    {r.userName?.charAt(0)}
                                                </div>
                                            )}
                                            <strong className="text-dark">{r.userName}</strong>
                                        </Col>
                                        <Col xs="7" className="text-end">
                                            <small className="text-muted">
                                                {new Date(r.date).toLocaleDateString()}
                                            </small>
                                        </Col>
                                    </Row>
                                    <div className="rating-stars mt-2">{this.renderStars(r.rating)}</div>
                                    {r.comment && <p className="mt-2 mb-0">{r.comment}</p>}
                                    {r.ratedImages && r.ratedImages.length > 0 && (
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {r.ratedImages.map((imgUrl, imgIdx) => (
                                                <img
                                                    key={imgIdx}
                                                    src={imgUrl}
                                                    alt={`Rating ${imgIdx + 1}`}
                                                    className="rating-image-thumbnail"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <ReviewForm />
                    </Col>
                </Row>

                <div className="custom-toast">
                    <Toast isOpen={toastVisible} className={`bg-${toastColor} text-white`} fade={false}>
                        <ToastHeader toggle={() => this.setState({ toastVisible: false })}>
                            {toastColor === 'success' ? 'Success' : 'Error'}
                        </ToastHeader>
                        <ToastBody>{toastMessage}</ToastBody>
                    </Toast>
                </div>
            </Container>
        );
    }
}
const mapStateToProps = (state) => ({
    cart: state.product ? state.product.cart : [],
    liked: state.product ? state.product.liked : {},
    loading: state.product ? state.product.loading : false,
});


const mapDispatchToProps = {
    addToCart,
    toggleLike,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProductDetailsComponent));
