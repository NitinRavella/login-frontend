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
import ProductCard from '../components/ProductCard';

class ProductDetailsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            product: null,
            selectedImage: null,
            toastVisible: false,
            toastMessage: '',
            toastColor: 'success',
            addedToCart: false,
            cartAnimating: false,
            liking: false,
            liked: false,
            selectedVariantIndex: 0,
            selectedSize: '',
        };
    }

    componentDidMount() {
        this.fetchProduct();
        // window.scrollTo(0, 0); // Scroll to top on initial load
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.id !== this.props.params.id) {
            this.fetchProduct(); // Fetch new product on variant switch
            // window.scrollTo(0, 0);
        }
    }

    fetchProduct = async () => {
        const { id: productId } = this.props.params;
        const userId = sessionStorage.getItem('userId');

        try {
            const productRes = await api.get(`/products/${productId}`);
            let liked = false;

            if (userId) {
                const userRes = await api.get(`/${userId}/liked-products`);
                const likedProductIds = userRes.data?.likedProductsIds || [];
                liked = likedProductIds.includes(productId.toString());
            }

            const product = productRes.data;

            this.setState({
                product,
                liked,
                selectedImage: product.productImages?.[0] || '',
                selectedVariantIndex: 0,
                selectedSize: '',
            });
        } catch (error) {
            console.error("Failed to fetch product:", error);
            this.showToast('Failed to fetch product', 'danger');
        }
    };

    renderStars = (rating) => {
        const maxStars = 5;
        return [...Array(maxStars)].map((_, i) => (i < rating ? '★' : '☆')).join('');
    };

    showToast = (message, color = 'success', duration = 1500) => {
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
        const { product, selectedSize } = this.state;
        console.log('Adding to cart:', product, selectedSize);
        this.setState({ cartAnimating: true, addedToCart: true });
        const productWithSize = { ...product, selectedSize };
        this.props.addToCart(productWithSize)
            .then(() => this.showToast('Added to cart!'))
            .catch((err) => {
                console.error('Cart Error:', err);
                this.showToast(err.message, 'danger');
                this.setState({ cartAnimating: false, addedToCart: false });
            })
            .finally(() => {
                setTimeout(() => this.setState({ cartAnimating: false, addedToCart: false }), 1000);
            });
    };

    render() {
        const {
            product, toastVisible, toastMessage, toastColor,
            liked, liking, selectedImage, selectedSize
        } = this.state;
        const allSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        const availableSizes = product?.sizes || [];

        if (!product) return <Container className="mt-5"><h4>Product not found.</h4></Container>;
        console.log('selectedSize', selectedSize, product?.sizes, product?.rom, product?.ram, product?.colors, product?.sizes);
        return (
            <Container className="mt-5 product-details-container">
                <Row>
                    {/* Left Image Section */}
                    <Col md="6">
                        <Row className="flex-md-row flex-column-reverse align-items-center">
                            <Col md="3" className="d-flex flex-md-column flex-row flex-wrap justify-content-center align-items-center">
                                {(product.productImages || []).map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`img${idx}`}
                                        className={`thumbnail-image ${selectedImage === img ? 'selected-thumbnail' : ''}`}
                                        onClick={() => this.setState({ selectedImage: img })}
                                    />
                                ))}
                            </Col>
                            <Col md="9" className="text-center mb-3">
                                <img src={selectedImage} alt="Main" className="main-product-image" />
                            </Col>
                        </Row>
                    </Col>

                    {/* Right Detail Section */}
                    <Col md="6">
                        <h2>{product.name}</h2>
                        <p className="text-muted">{product.category}</p>

                        {product.offerPrice ? (
                            <div className="price-container">
                                <p className="text-success fw-semibold me-2">₹{product.offerPrice}</p>
                                <p className="discount-price">({Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF)</p>
                                <p className="original-price">₹{product.price}</p>
                            </div>
                        ) : (
                            <p className="text-success fw-semibold">₹{product.price}</p>
                        )}

                        <p className="product-description">{product.description}</p>
                        <p><strong>Stock:</strong> {product.stock}</p>

                        {/* Specs & Variants */}
                        {(product.ram?.length || product.rom || product.colors?.length || product.sizes?.length) && (
                            <div className="product-specs-section mt-4">
                                <h5>Available Variants</h5>
                                <div className="specs-table mt-3">
                                    {product.ram && <div className="spec-row"><strong>RAM:</strong><span>{product.ram}</span></div>}
                                    {product.rom && <div className="spec-row"><strong>ROM:</strong><span>{product.rom}</span></div>}
                                    {product.processor && <div className="spec-row"><strong>Processor:</strong><span>{product.processor}</span></div>}

                                    {product.variants?.length > 0 && (
                                        <div className="product-variants mt-4">
                                            <div className="d-flex gap-3 flex-wrap mt-2">
                                                {product.variants.map((variant) => (
                                                    <div
                                                        key={variant._id}
                                                        className="variant-box text-center"
                                                        style={{ cursor: 'pointer', width: 70 }}
                                                        onClick={() => this.props.navigate(`/product/${variant._id}`)}
                                                    >
                                                        <img
                                                            src={variant.thumbnails?.[0]}
                                                            alt={variant.color}
                                                            title={variant.color}
                                                            style={{
                                                                width: '100%',
                                                                height: 70,
                                                                objectFit: 'cover',
                                                                borderRadius: 6,
                                                                border: variant._id === product._id ? '2px solid #007bff' : '1px solid #ccc',
                                                            }}
                                                        />
                                                        <div className="small mt-1">{variant.color}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {availableSizes.length > 0 &&
                                        <div className="spec-row mt-3">
                                            <strong>Available Sizes:</strong>
                                            <div className="sizes-list d-flex gap-2 flex-wrap mt-2">
                                                {allSizes.map((size, index) => {
                                                    const isAvailable = availableSizes.includes(size);
                                                    const isSelected = selectedSize === size;

                                                    return (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            className={`size-button ${isSelected ? 'selected' : ''}`}
                                                            disabled={!isAvailable}
                                                            onClick={() => isAvailable && this.setState({ selectedSize: size })}
                                                            title={!isAvailable ? 'Out of stock' : ''}

                                                        >
                                                            {size}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        )}

                        {product.stock > 0 && (
                            <Row className="mt-4 align-items-center">
                                <Col xs="6" md='4'>
                                    <ProductCard product={product} selectedSize={selectedSize} />
                                </Col>
                                <Col xs='1' md='1'>
                                    <Button color="link" onClick={this.handleLikeToggle} disabled={liking} className="p-0">
                                        {liked ? <FaHeart size={32} color="red" /> : <FaRegHeart size={32} color="grey" />}
                                    </Button>
                                </Col>
                            </Row>
                        )}

                        <div className="my-3">
                            <h5>Average Rating: {product.averageRating.toFixed(1)} / 5</h5>
                            <div className="rating-stars">{this.renderStars(Math.round(product.averageRating))}</div>
                        </div>

                        {/* Ratings */}
                        <div className="mt-4">
                            <h5>User Ratings:</h5>
                            {product.ratings.length === 0 ? <p>No ratings yet.</p> :
                                product.ratings.map((r, idx) => (
                                    <div key={idx} className="rating-box">
                                        <Row className="align-items-center">
                                            <Col xs="5" className="d-flex align-items-center gap-3">
                                                {r.avatar ? <img src={r.avatar} alt={r.userName} className="user-avatar" /> :
                                                    <div className="default-avatar">{r.userName?.charAt(0)}</div>}
                                                <strong className="text-dark">{r.userName}</strong>
                                            </Col>
                                            <Col xs="7" className="text-end">
                                                <small className="text-muted">{new Date(r.date).toLocaleDateString()}</small>
                                            </Col>
                                        </Row>
                                        <div className="rating-stars mt-2">{this.renderStars(r.rating)}</div>
                                        {r.comment && <p className="mt-2 mb-0">{r.comment}</p>}
                                        {r.ratedImages?.length > 0 && (
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
                                ))
                            }
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
    cart: state.product?.cart || [],
    liked: state.product?.liked || {}
});

const mapDispatchToProps = { addToCart, toggleLike };

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProductDetailsComponent));
