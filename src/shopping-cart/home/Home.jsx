import React, { useState } from 'react';
import { Button, Container, Row, Col, Input, Card, CardBody, CardTitle, Spinner, CardFooter, Toast, ToastBody, ToastHeader, Offcanvas, OffcanvasHeader, OffcanvasBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FcFilledFilter } from "react-icons/fc";
import api from '../utils/Api';
import ProductFilters from './ProductFilters';
import { toast } from 'react-toastify';
import HomeHelper from './HomeHelper';
import { connect } from 'react-redux';
import { addToCart, toggleLike, fetchLikedProducts, fetchCart } from '../../redux/actions/productActions';
import '../../styles/Home.css';
import RatingDisplay from '../components/RatingSummary';
import ProductCard from '../components/ProductCard';
import ProductForm from './ProductForm';
import DeletedProducts from './DeletedProducts';

class Home extends HomeHelper {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            renderLayout: 0,
            products: [],
            filteredProducts: [],
            editingProduct: null,
            cardVariantsState: {},
            searchQuery: '',
            categories: [],
            isDeleteModalOpen: false,
            productIdToDelete: null,
            deleteConfirmationText: '',
            showFilters: false,
            isSubmitting: false,
            toastVisible: false,
            toastMessage: '',
            toastColor: 'success',
            carouselImageMap: {},  // { [productId]: currentImageURL }
            imageIntervals: {},
        };
    }

    componentDidMount() {
        this.fetchProducts();
        const verifyUser = sessionStorage.getItem('userId');
        if (verifyUser) {
            this.props.fetchLikedProducts();
        }
    }

    fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            const categories = [...new Set(response.data.map(product => product.category))];
            this.setState({
                products: response.data,
                filteredProducts: response.data,
                categories,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    handleFilterChange = (filters) => {
        const { products } = this.state;
        let filtered = [...products];

        // Category
        if (filters.selectedCategory && filters.selectedCategory !== '') {
            filtered = filtered.filter(p => p.category === filters.selectedCategory);
        }

        // Brand
        if (filters.selectedBrands?.length > 0) {
            filtered = filtered.filter(p => filters.selectedBrands.includes(p.brand));
        }

        // ✅ Price using filters.priceRange [min, max]
        if (filters.priceRange?.length === 2) {
            const [min, max] = filters.priceRange;
            filtered = filtered.filter(p =>
                p.variants?.some(v =>
                    parseFloat(v.price) >= min && parseFloat(v.price) <= max
                )
            );
        }

        // In Stock
        if (filters.inStockOnly) {
            filtered = filtered.filter(p =>
                p.variants?.some(v => {
                    if (v.sizeStock?.length > 0) {
                        return v.sizeStock.some(s => s.stock > 0);
                    }
                    return v.stock > 0;
                })
            );
        }

        // Colors
        if (filters.selectedColors?.length > 0) {
            filtered = filtered.filter(p =>
                p.variants?.some(v => filters.selectedColors.includes(v.color))
            );
        }

        // RAM
        if (filters.selectedRams?.length > 0) {
            filtered = filtered.filter(p =>
                p.variants?.some(v => filters.selectedRams.includes(v.ram))
            );
        }

        // ROM
        if (filters.selectedRoms?.length > 0) {
            filtered = filtered.filter(p =>
                p.variants?.some(v => filters.selectedRoms.includes(v.rom))
            );
        }

        // Sizes
        if (filters.selectedSizes?.length > 0) {
            filtered = filtered.filter(p =>
                p.variants?.some(v =>
                    v.sizeStock?.some(s => filters.selectedSizes.includes(s.size))
                )
            );
        }

        this.setState({ filteredProducts: filtered });
    };



    addProducts = () => {
        this.setState({ renderLayout: 1 });
    };

    editProducts = (product) => {
        this.setState({
            renderLayout: 2,
            editingProduct: product,
        });
    };

    closeModal = () => {
        this.setState({
            renderLayout: 0,
            name: '',
            description: '',
            price: '',
            category: '',
            imageFiles: [],
            imagePreviews: [],
            stock: '',
            brand: '',
            ram: '',
            rom: '',
            processor: '',
            sizes: '',
            colors: '',
            editingProductId: null
        });
    };

    openDeleteModal = (productId) => {
        this.setState({
            isDeleteModalOpen: true,
            productIdToDelete: productId,
            deleteConfirmationText: '',
        });
    };

    closeDeleteModal = () => {
        this.setState({
            isDeleteModalOpen: false,
            productIdToDelete: null,
            deleteConfirmationText: '',
        });
    };

    handleDeleteConfirmationChange = (e) => {
        this.setState({ deleteConfirmationText: e.target.value });
    };

    handleSearch = () => {
        const { searchQuery, products } = this.state;
        const query = searchQuery.toLowerCase().trim();

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

        this.setState({ filteredProducts: filtered });
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, () => {
            if (e.target.name === 'searchQuery') {
                this.handleSearch();
            }
        });
    };

    handleLikeToggle = (product, variantId) => {
        const userToken = sessionStorage.getItem('token');
        if (!userToken) {
            this.showToast('Please login to wishlist the product', 'danger');
            return;
        }

        if (!product || !product._id || !variantId) {
            this.showToast("Invalid product or variant.", "danger");
            return;
        }

        const { likedProducts, toggleLike } = this.props;

        // Find if product with the given variantId is already liked
        const isCurrentlyLiked = likedProducts.some(
            (item) =>
                item.productId === product._id && item.variantId === variantId
        );

        toggleLike(product._id, variantId, isCurrentlyLiked)
            .then((newLikedStatus) => {
                this.props.fetchLikedProducts();
                this.showToast(
                    newLikedStatus ? "Product liked" : "Product unliked",
                    newLikedStatus ? "success" : "info"
                );
            })
            .catch((err) => {
                this.showToast(err.message, 'danger');
            });
    };

    showToast = (message, color = 'success', duration = 1000) => {
        this.setState({ toastVisible: true, toastMessage: message, toastColor: color });
        setTimeout(() => {
            this.setState({ toastVisible: false });
        }, duration);
    };

    confirmDelete = async () => {
        const { productIdToDelete } = this.state;
        try {
            await api.delete(`/products/${productIdToDelete}`);
            toast.success("Product deleted successfully!");
            this.fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error("Failed to delete product.");
        } finally {
            this.closeDeleteModal();
        }
    };

    toggleFilters = () => {
        this.setState({ showFilters: !this.state.showFilters });
    }

    resetFormView = () => {
        this.setState({ renderLayout: 0, editingProduct: null }, this.fetchProducts);
    };

    handleVariantChange = (productId, newVariant) => {
        this.setState(prevState => ({
            cardVariantsState: {
                ...prevState.cardVariantsState,
                [productId]: newVariant
            },
            carouselImageMap: {
                ...prevState.carouselImageMap,
                [productId]: newVariant.images?.[0] || ''
            }
        }));
    };

    startImageCarousel = (productId, images = []) => {
        if (!images || images.length <= 1) return;

        let index = 0;

        // Immediately show second image to give hover feedback
        this.setState(prevState => ({
            carouselImageMap: {
                ...prevState.carouselImageMap,
                [productId]: images[1]
            }
        }));

        const intervalId = setInterval(() => {
            index = (index + 1) % images.length;

            this.setState(prevState => ({
                carouselImageMap: {
                    ...prevState.carouselImageMap,
                    [productId]: images[index]
                }
            }));
        }, 1000); // 1 second per image

        this.setState(prevState => ({
            imageIntervals: {
                ...prevState.imageIntervals,
                [productId]: intervalId
            }
        }));
    };

    stopImageCarousel = (productId, images = []) => {
        const intervalId = this.state.imageIntervals[productId];
        if (intervalId) {
            clearInterval(intervalId);
        }

        this.setState(prevState => ({
            carouselImageMap: {
                ...prevState.carouselImageMap,
                [productId]: images[0] // revert to first image
            },
            imageIntervals: {
                ...prevState.imageIntervals,
                [productId]: null
            }
        }));
    };

    deletedProducts = async () => {
        try {
            const deletedProducts = await api.get('/product/deleted/all')
            this.setState({ renderLayout: 3, deletedProducts: deletedProducts.data.products });
        } catch (err) {
            console.error(err)
        }
    }

    render() {
        const { products, filteredProducts, renderLayout, loading, searchQuery, categories, toastColor, toastMessage, toastVisible, editingProduct, deletedProducts } = this.state;
        const { role, likedProducts } = this.props;
        if (!products) return <Container className="mt-5"><h4>Product not found.</h4></Container>;

        return (
            <section className="home-container">
                {loading && <Spinner color="primary" className='text-center' style={{ width: '3rem', height: '3rem' }} />}
                {!loading && renderLayout === 0 && (
                    <Row>
                        <Col xs="12" className="d-md-none mb-3 d-flex justify-content-end">
                            <Button className='bg-transparent' onClick={this.toggleFilters}>
                                <FcFilledFilter size={24} />
                            </Button>
                        </Col>
                        {/* Offcanvas shown only in mobile */}
                        <Offcanvas isOpen={this.state.showFilters} toggle={this.toggleFilters} direction="start">
                            <OffcanvasHeader toggle={this.toggleFilters}>Filters</OffcanvasHeader>
                            <OffcanvasBody>
                                <ProductFilters
                                    product={products}
                                    categories={categories}
                                    onFilterChange={this.handleFilterChange}
                                />
                            </OffcanvasBody>
                        </Offcanvas>

                        {/* Permanent sidebar in desktop */}
                        {window.innerWidth >= 768 && (
                            <Col lg="2" md="2" className="mb-4 d-none d-md-block">
                                <ProductFilters
                                    product={products}
                                    categories={categories}
                                    onFilterChange={this.handleFilterChange}
                                />
                            </Col>
                        )}

                        <Col className="mb-4">
                            <Row className='mb-4'>
                                {/* <Col lg='12' xs='12' md='8'>
                                    <Input
                                        type="text"
                                        name="searchQuery"
                                        value={searchQuery}
                                        onChange={this.handleChange}
                                        placeholder="Search products by name or category..."
                                    />
                                </Col> */}
                                {(role === 'admin' || role === 'superadmin') && (
                                    <Col lg='12' xs='12' md='4'>
                                        <Button color="primary" onClick={this.addProducts}>Add Product</Button>
                                        <Button color='warning' onClick={this.deletedProducts} className='ms-5'>Deleted Products</Button>
                                    </Col>
                                )}
                            </Row>
                            <Row>
                                {filteredProducts.map(product => {
                                    const productId = product._id;
                                    const activeVariant = this.state.cardVariantsState[productId] || product.variants?.[0];
                                    const price = activeVariant?.price || 0;
                                    const offerPrice = activeVariant?.offerPrice;
                                    return (
                                        <Col key={product._id} sm="6" md="4" lg="3" className="mb-4">
                                            <Card className="h-100 product-card shadow-sm border-0">
                                                <Link to={`/product/${product._id}`} state={{ preselectedColor: activeVariant?.color }} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <div
                                                        className="product-image-wrapper position-relative"
                                                        onMouseEnter={() => this.startImageCarousel(productId, activeVariant.images)}
                                                        onMouseLeave={() => this.stopImageCarousel(productId, activeVariant.images)}
                                                    >
                                                        {(role === 'admin' || role === 'superadmin') && (
                                                            <Row className="admin-icon-row">
                                                                <Col xs="6" className="text-start">
                                                                    <RiDeleteBin6Line
                                                                        className="admin-icon delete"
                                                                        title="Delete Product"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            this.openDeleteModal(product._id);
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col xs="6" className="text-end">
                                                                    <FaEdit
                                                                        className="admin-icon edit"
                                                                        title="Edit Product"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            this.editProducts(product);
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        )}

                                                        <img
                                                            src={
                                                                this.state.carouselImageMap[productId] ||
                                                                activeVariant.images?.[0] ||
                                                                product.mainImages?.[0]
                                                            }
                                                            alt={product.name}
                                                            className="img-fluid product-image"
                                                            style={{ transition: 'opacity 0.4s ease-in-out' }}
                                                        />

                                                        <Row className="wishlist-overlay">
                                                            <Col>
                                                                <RatingDisplay productId={product._id} />
                                                            </Col>
                                                            <Col className='text-end'>
                                                                <button
                                                                    className="wishlist-bar-btn"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        this.handleLikeToggle(product, activeVariant.variantId);
                                                                    }}
                                                                >
                                                                    {likedProducts?.some(
                                                                        (item) =>
                                                                            item.productId === product._id &&
                                                                            item.variantId === activeVariant.variantId
                                                                    ) ? (
                                                                        <FaHeart size={14} className="me-2 text-danger" />
                                                                    ) : (
                                                                        <FaRegHeart size={14} className="me-2 text-dark" />
                                                                    )}
                                                                    <span className="wishlist-text">WISHLIST</span>
                                                                </button>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                    <CardBody className="text-center">
                                                        <CardTitle tag="h5" className="product-title fw-bold">
                                                            {product.name}
                                                            {activeVariant?.color && ` - (${activeVariant.color})`}
                                                            {activeVariant?.ram && ` | ${activeVariant.ram} RAM`}
                                                            {activeVariant?.rom && ` | ${activeVariant.rom} ROM`}
                                                        </CardTitle>

                                                        {/* Price Display */}
                                                        {!isNaN(parseFloat(price)) ? (
                                                            offerPrice ? (
                                                                <Row className="mb-1">
                                                                    <Col className="text-success fw-semibold mb-0">₹{offerPrice}</Col>
                                                                    <Col className="text-muted mb-1" style={{ textDecoration: 'line-through' }}>
                                                                        ₹{price}
                                                                    </Col>
                                                                    <Col className="text-danger small mb-0">
                                                                        ({Math.round(((price - offerPrice) / price) * 100)}% OFF)
                                                                    </Col>
                                                                </Row>
                                                            ) : (
                                                                <p className="text-success fw-semibold mb-1">₹{price}</p>
                                                            )
                                                        ) : (
                                                            <p className="text-muted fw-semibold mb-1 bg-body-secondary">N/A</p>
                                                        )}

                                                        {/* Variant Swatches */}
                                                        <div className="d-flex justify-content-center mt-2 gap-2">
                                                            {[...new Map(product.variants.map(v => [v.color, v])).values()].map((variant, index) => (
                                                                <button
                                                                    key={index}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        this.handleVariantChange(productId, variant);
                                                                    }}
                                                                    className={`variant-swatch ${variant.color === activeVariant?.color ? 'active' : ''}`}
                                                                    style={{
                                                                        backgroundImage: `url(${variant.images?.[0]})`,
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        borderRadius: '50%',
                                                                        backgroundSize: 'cover',
                                                                        border: variant.color === activeVariant?.color ? '2px solid black' : '1px solid #ccc'
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-muted small mb-0">
                                                            {(activeVariant?.color || product.variants?.[0]?.color || '')}
                                                        </p>
                                                    </CardBody>
                                                </Link>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Col>
                    </Row>
                )
                }
                {(renderLayout === 1 || renderLayout === 2) && (
                    <ProductForm
                        initialData={renderLayout === 2 ? editingProduct : null}
                        isEdit={renderLayout === 2}
                        onSuccess={this.resetFormView}
                        onCancel={this.resetFormView}
                    />
                )}
                {renderLayout === 3 && (
                    <DeletedProducts
                        deletedProducts={deletedProducts}
                        onRefresh={() => {
                            this.setState({ renderLayout: 0 }, () => {
                                this.fetchProducts(); // parent fetches updated product list
                            });
                        }}
                    />
                )}

                {this.renderDeleteModal()}
                <div className="custom-toast">
                    <Toast isOpen={toastVisible} className={`bg-${toastColor} text-white`} fade={false}>
                        <ToastHeader toggle={() => this.setState({ toastVisible: false })}>
                            {toastColor === 'success' ? 'Success' : 'Error'}
                        </ToastHeader>
                        <ToastBody>{toastMessage}</ToastBody>
                    </Toast>
                </div>
            </section >
        );
    }
}

const mapStateToProps = (state) => ({
    role: state.auth.role,
    likedProducts: state.products.likedProducts,
});


const mapDispatchToProps = {
    addToCart,
    toggleLike,
    fetchLikedProducts,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);