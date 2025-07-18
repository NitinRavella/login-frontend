import React from 'react';
import { Container, Row, Col, Button, Modal, ModalBody } from 'reactstrap';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import api from '../utils/Api';
import { RiFullscreenFill } from "react-icons/ri";
import withRouter from '../components/WithRoute';
import { addToCart, toggleLike, fetchLikedProducts } from '../../redux/actions/productActions';
import { connect } from 'react-redux';
import ReviewForm from '../components/RatingComponent';
import ProductCard from '../components/ProductCard';
import { notifyError, notifySuccess, notifyInfo } from '../utils/toastUtils';
import '../../styles/ProductDetails.css';

class ProductDetailsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            product: null,
            selectedImage: '',
            selectedRam: '',
            selectedRom: '',
            addedToCart: false,
            cartAnimating: false,
            liking: false,
            liked: false,
            selectedVariantIndex: 0,
            selectedSize: '',
            routeSelection: null,
            zoomVisible: false,
            showMobileZoom: false,
            zoomX: 0,
            zoomY: 0,
        };
    }

    componentDidMount() {
        this.fetchProduct();
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            this.props.fetchLikedProducts(); // ensure likedProducts are in Redux
        }
        const { state } = this.props.location || {};
        const {
            preselectedColor, // from Home
            selectedColor, selectedSize, selectedRam, selectedRom // from Cart
        } = state || {};

        this.setState({ preselectedColor: preselectedColor || null });

        // Delay setting selected variant until after product is fetched
        this.setState({ routeSelection: { selectedColor, selectedSize, selectedRam, selectedRom } });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.id !== this.props.params.id) {
            const { state } = this.props.location || {};
            const {
                preselectedColor,
                selectedColor,
                selectedSize,
                selectedRam,
                selectedRom
            } = state || {};

            this.setState({
                preselectedColor: preselectedColor || null,
                routeSelection: { selectedColor, selectedSize, selectedRam, selectedRom }
            }, () => {
                this.fetchProduct();
            });
        }

        // Apply variant from route state after product is fetched
        if (!prevProps.product && this.state.product && this.state.routeSelection) {
            const { product, routeSelection } = this.state;
            const { selectedColor, selectedSize, selectedRam, selectedRom } = routeSelection;

            const matchedVariant = product.variants.find(v =>
                (!selectedColor || v.color === selectedColor) &&
                (!selectedRam || v.ram === selectedRam) &&
                (!selectedRom || v.rom === selectedRom)
            );

            if (matchedVariant) {
                this.setState({
                    selectedColor: matchedVariant.color,
                    selectedRam: matchedVariant.ram || '',
                    selectedRom: matchedVariant.rom || '',
                    selectedSize: selectedSize || '',
                    selectedVariantIndex: product.variants.indexOf(matchedVariant),
                    selectedImage: matchedVariant.thumbnails?.[0] || '',
                    routeSelection: null
                });
            }
        }
    }

    fetchProduct = async () => {
        const { id: productId } = this.props.params;
        try {
            const productRes = await api.get(`/products/${productId}`);
            const product = productRes.data;

            let selectedVariantIndex = 0;
            let selectedColor = product.variants?.[0]?.color || '';
            let selectedRam = '';
            let selectedRom = '';
            let selectedSize = '';
            let selectedImage = '';

            const { preselectedColor, routeSelection } = this.state;

            if (preselectedColor) {
                const matchIndex = product.variants.findIndex(v => v.color === preselectedColor);
                if (matchIndex !== -1) {
                    selectedVariantIndex = matchIndex;
                    selectedColor = preselectedColor;
                    selectedImage = product.variants[matchIndex]?.images?.[0];
                }
            }

            if (routeSelection?.selectedColor || routeSelection?.selectedRam || routeSelection?.selectedRom) {
                const matchVariant = product.variants.find(v =>
                    (!routeSelection.selectedColor || v.color === routeSelection.selectedColor) &&
                    (!routeSelection.selectedRam || v.ram === routeSelection.selectedRam) &&
                    (!routeSelection.selectedRom || v.rom === routeSelection.selectedRom)
                );

                if (matchVariant) {
                    selectedVariantIndex = product.variants.indexOf(matchVariant);
                    selectedColor = matchVariant.color;
                    selectedRam = matchVariant.ram || '';
                    selectedRom = matchVariant.rom || '';
                    selectedSize = routeSelection.selectedSize || '';
                    selectedImage = matchVariant.images?.[0] || '';
                }
            }

            if (!selectedImage) {
                selectedImage = product.variants?.[selectedVariantIndex]?.images?.[0] ||
                    product.mainImages?.[0]?.url || '';
            }

            this.setState({
                product,
                selectedVariantIndex,
                selectedColor,
                selectedRam,
                selectedRom,
                selectedSize,
                selectedImage,
                routeSelection: null
            });
        } catch (error) {
            console.error("Failed to fetch product:", error);
            notifyError('Failed to fetch product')
        }
    };

    renderStars = (rating) => {
        const maxStars = 5;
        return [...Array(maxStars)].map((_, i) => (i < rating ? '★' : '☆')).join('');
    };

    handleLikeToggle = () => {
        const { product, selectedColor, selectedRam, selectedRom, selectedSize } = this.state;
        const { likedProducts, toggleLike, fetchLikedProducts } = this.props;

        const isElectronics = ['phone', 'laptop', 'tablet'].includes(product.category);

        // Find the selected variant based on category
        const selectedVariant = product.variants.find((v) => {
            if (isElectronics) {
                return v.color === selectedColor && v.ram === selectedRam && v.rom === selectedRom;
            } else {
                return v.color === selectedColor && v.sizeStock?.some(s => s.size === selectedSize);
            }
        });

        if (!selectedVariant) {
            notifyError('Please select the variant before liking.');
            return;
        }

        const variantId = selectedVariant.variantId;
        const isCurrentlyLiked = likedProducts.some(
            item => item.productId === product._id && item.variantId === variantId
        );

        this.setState({ liking: true });

        toggleLike(product._id, variantId, isCurrentlyLiked)
            .then((newLikedStatus) => {
                fetchLikedProducts();

                if (newLikedStatus) {
                    notifySuccess("Product added to wishlist");
                } else {
                    notifyInfo("Product removed from wishlist");
                }
            })
            .catch((err) => {
                notifyError(err.message || "Something went wrong while updating wishlist");
            })
            .finally(() => {
                this.setState({ liking: false });
            });
    };

    getSelectedSizeStock = () => {
        const { selectedSize, product, selectedVariantIndex } = this.state;

        if (!selectedSize || !product?.variants?.[selectedVariantIndex]) return 0;

        const sizeStock = product.variants[selectedVariantIndex].sizeStock || [];
        const foundSize = sizeStock.find(s => s.size === selectedSize);

        return foundSize?.stock ?? 0;
    };

    handleMouseMove = (e) => {
        const { offsetX, offsetY, target } = e.nativeEvent;
        const { offsetWidth, offsetHeight } = target;

        const xPercent = (offsetX / offsetWidth) * 100;
        const yPercent = (offsetY / offsetHeight) * 100;

        this.setState({
            zoomX: xPercent,
            zoomY: yPercent
        });
    };

    render() {
        const { product } = this.state;
        if (!product) return (
            <Container className="mt-5">
                <h4>Product not found.</h4>
            </Container>
        );

        const { selectedImage, selectedSize, selectedVariantIndex, liking, selectedRam, selectedRom } = this.state;

        const { likedProducts } = this.props;

        const selectedVariant = product.variants?.[selectedVariantIndex] || {};
        const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const availableSizes = selectedVariant.sizeStock?.map(s => s.size) || [];
        const selectedColor = product.variants?.[selectedVariantIndex]?.color;

        const isLiked = likedProducts.some(
            item => item.productId === product._id && item.variantId === selectedVariant.variantId
        );

        const selectedExactVariant = product.variants.find(v =>
            v.color === selectedColor && v.ram === selectedRam && v.rom === selectedRom
        );

        const getFirstImage = (variant) =>
            variant?.images?.[0] ||
            variant?.thumbnails?.[0] ||
            product?.mainImages?.[0]?.url ||
            '';
        return (
            <Container className="mt-5 product-details-container">
                <Row>
                    {/* Image Section */}
                    <Col md="6">
                        <Row className="flex-md-row flex-column-reverse align-items-center">
                            <Col md="3" className="d-flex flex-md-column flex-row flex-wrap justify-content-center align-items-center">
                                {(selectedVariant.images || selectedVariant.thumbnails || []).map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`img${idx}`}
                                        className={`thumbnail-image ${selectedImage === img ? 'selected-thumbnail' : ''}`}
                                        onClick={() => this.setState({ selectedImage: img })}
                                    />
                                ))}
                            </Col>
                            <Col md="6" className="position-relative">
                                <img
                                    src={selectedImage || getFirstImage(selectedVariant)}
                                    alt="Main"
                                    className="main-product-image"
                                    onMouseEnter={() => this.setState({ zoomVisible: true })}
                                    onMouseLeave={() => this.setState({ zoomVisible: false })}
                                    onMouseMove={this.handleMouseMove}
                                />
                                {window.innerWidth < 768 && (
                                    <button
                                        className="zoom-button-mobile mt-2 text-end border-0"
                                        onClick={() => this.setState({ showMobileZoom: true })}
                                    >
                                        <RiFullscreenFill size={25} />
                                    </button>
                                )}
                            </Col>
                        </Row>
                    </Col>

                    {/* Product Details Section */}
                    <Col md="6" className="product-details-col">
                        {this.state.zoomVisible && window.innerWidth >= 768 && (
                            <div
                                className="zoom-box"
                                style={{
                                    backgroundImage: `url(${selectedImage || getFirstImage(selectedVariant)})`,
                                    backgroundPosition: `${this.state.zoomX}% ${this.state.zoomY}%`
                                }}
                            />
                        )}
                        <h2>{product.name}
                            {selectedVariant?.color && ` - (${selectedVariant.color})`}
                            {selectedVariant?.ram && ` | ${selectedVariant.ram} RAM`}
                            {selectedVariant?.rom && ` | ${selectedVariant.rom} ROM`}
                        </h2>
                        <p className="text-muted">{selectedVariant.color || product.category}</p>

                        {selectedVariant?.offerPrice && selectedVariant?.price ? (
                            <div className="price-container">
                                <p className="text-success fw-semibold me-2">₹{selectedVariant.offerPrice}</p>
                                <p className="discount-price">
                                    ({Math.round(((selectedVariant.price - selectedVariant.offerPrice) / selectedVariant.price) * 100)}% OFF)
                                </p>
                                <p className="original-price">₹{selectedVariant.price}</p>
                            </div>
                        ) : selectedVariant?.price ? (
                            <p className="text-success fw-semibold">₹{selectedVariant.price}</p>
                        ) : (
                            <p className="text-muted">Price not available</p>
                        )}

                        <p className="product-description">{product.description}</p>

                        {product.variants?.length > 0 && (
                            <div className="mt-4">
                                <h5>Choose Variant</h5>
                                <div className="d-flex gap-3 flex-wrap mt-2">
                                    {[...new Map(product.variants.map(v => [v.color, v])).values()].map((variant, idx) => (
                                        <div
                                            key={idx}
                                            className="variant-box text-center"
                                            style={{ cursor: 'pointer', width: 70 }}
                                            onClick={() => {
                                                this.setState({
                                                    selectedColor: variant.color,
                                                    selectedRam: variant.ram || '',
                                                    selectedRom: variant.rom || '',
                                                    selectedImage: getFirstImage(variant),
                                                    selectedVariantIndex: product.variants.indexOf(variant),
                                                    selectedSize: ''
                                                });
                                            }}
                                        >
                                            <img
                                                src={getFirstImage(variant)}
                                                alt={variant.color}
                                                title={variant.color}
                                                style={{
                                                    width: '100%',
                                                    height: 70,
                                                    objectFit: 'cover',
                                                    borderRadius: 6,
                                                    border: selectedColor === variant.color ? '2px solid #007bff' : '1px solid #ccc',
                                                }}
                                            />
                                            <div className="small mt-1">{variant.color}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Electronics (RAM/ROM) */}
                        {['phone', 'laptop', 'tablet', 'smartwatch'].includes(product.category) && (
                            <Row>
                                <Col>
                                    {selectedColor && (
                                        <>
                                            <strong>Select RAM:</strong>
                                            <div className="d-flex gap-2 flex-wrap mt-2">
                                                {[...new Set(product.variants.filter(v => v.color === selectedColor).map(v => v.ram))].map((ram, i) => (
                                                    <button
                                                        key={i}
                                                        className={`size-button ${selectedRam === ram ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            const firstRom = product.variants.find(v => v.color === selectedColor && v.ram === ram)?.rom || '';
                                                            const variant = product.variants.find(v => v.color === selectedColor && v.ram === ram && v.rom === firstRom);
                                                            this.setState({
                                                                selectedRam: ram,
                                                                selectedRom: firstRom,
                                                                selectedVariantIndex: product.variants.indexOf(variant),
                                                                selectedImage: getFirstImage(variant)
                                                            });
                                                        }}
                                                    >
                                                        {ram}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </Col>

                                <Col>
                                    {selectedColor && selectedRam && (
                                        <>
                                            <strong>Select ROM:</strong>
                                            <div className="d-flex gap-2 flex-wrap mt-2">
                                                {[...new Set(product.variants.filter(v => v.color === selectedColor && v.ram === selectedRam).map(v => v.rom))].map((rom, i) => {
                                                    const variantExists = product.variants.find(v => v.color === selectedColor && v.ram === selectedRam && v.rom === rom);
                                                    return (
                                                        <button
                                                            key={i}
                                                            className={`size-button ${selectedRom === rom ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                const variant = product.variants.find(v => v.color === selectedColor && v.ram === selectedRam && v.rom === rom);
                                                                this.setState({
                                                                    selectedRom: rom,
                                                                    selectedVariantIndex: product.variants.indexOf(variant),
                                                                    selectedImage: getFirstImage(variant)
                                                                });
                                                            }}
                                                            disabled={!variantExists}
                                                            style={{ opacity: variantExists ? 1 : 0.5 }}
                                                        >
                                                            {rom}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </Col>
                            </Row>
                        )}

                        {/* Fashion Sizes */}
                        {['clothing', 'shoes'].includes(product.category) && availableSizes.length > 0 && (
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
                                {selectedSize && (
                                    <div className="mt-2">
                                        <p className="text-muted mb-0">
                                            Stock for <strong>{selectedSize}</strong>: <strong>{this.getSelectedSizeStock()}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <Row className="mt-4 align-items-center">
                            <Col xs="6" md="4">
                                <ProductCard
                                    product={product}
                                    variant={selectedExactVariant || selectedVariant}
                                    selectedSize={selectedSize}
                                    selectedColor={selectedVariant.color}
                                    selectedRam={selectedRam}
                                    selectedRom={selectedRom}
                                    stock={selectedExactVariant?.stock || 0}
                                />
                            </Col>
                            <Col xs="1" md="1">
                                <Button color="link" onClick={this.handleLikeToggle} disabled={liking} className="p-0">
                                    {isLiked ? (
                                        <FaHeart size={32} color="red" />
                                    ) : (
                                        <FaRegHeart size={32} color="grey" />
                                    )}
                                </Button>
                            </Col>
                        </Row>
                        <div className="my-3">
                            <h5>Average Rating: {product.averageRating.toFixed(1)} / 5</h5>
                            <div className="rating-stars">{this.renderStars(Math.round(product.averageRating))}</div>
                        </div>
                        <div className="mt-4">
                            <h5>User Ratings:</h5>
                            {product.ratings.length === 0 ? <p>No ratings yet.</p> :
                                product.ratings.map((r, idx) => (
                                    <div key={idx} className="rating-box">
                                        <Row className="align-items-center">
                                            <Col xs="5" className="d-flex align-items-center gap-3">
                                                {r.avatar
                                                    ? <img src={r.avatar} alt={r.userName} className="user-avatar" />
                                                    : <div className="default-avatar">{r.userName?.charAt(0)}</div>}
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
                                                    <img key={imgIdx} src={imgUrl} alt={`Rating ${imgIdx + 1}`} className="rating-image-thumbnail" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                        <ReviewForm />
                    </Col>
                    {/* Mobile Fullscreen Modal */}
                    <Modal
                        isOpen={this.state.showMobileZoom}
                        toggle={() => this.setState({ showMobileZoom: false })}
                        className="fullscreen-modal"
                    >
                        <ModalBody className="p-0">
                            <div
                                className="mobile-zoom-container"
                                onClick={() => this.setState({ showMobileZoom: false })}
                            >
                                <img src={selectedImage} alt="Zoomed" className="mobile-zoom-image" />
                            </div>
                        </ModalBody>
                    </Modal>
                </Row>
            </Container>
        );
    }
}


const mapStateToProps = (state) => ({
    cart: state.products?.cart || [],
    likedProducts: state.products?.likedProducts || [],
    loading: state.products?.loadingCart || false,
});

const mapDispatchToProps = {
    addToCart,
    toggleLike,
    fetchLikedProducts,
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProductDetailsComponent));
