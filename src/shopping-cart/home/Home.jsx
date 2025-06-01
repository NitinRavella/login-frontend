import React from 'react';
import { Button, Container, Row, Col, Input, Card, CardBody, CardTitle, Spinner, CardFooter, Toast, ToastBody, ToastHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { FcFilledFilter } from "react-icons/fc";
import api from '../utils/Api';
import ProductFilters from './ProductFilters';
import { toast } from 'react-toastify';
import HomeHelper from './HomeHelper';
import { connect } from 'react-redux';
import { addToCart, toggleLike, fetchLikedProducts } from '../../redux/actions/productActions';
import '../../styles/Home.css';
import RatingDisplay from '../components/RatingSummary';

class Home extends HomeHelper {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            renderLayput: 0,
            products: [],
            filteredProducts: [],
            searchQuery: '',
            categories: [],
            name: '',
            description: '',
            offerPrice: '',
            price: '',
            brand: '',
            category: '',
            stock: '',
            imageFiles: [],
            existingImages: [],
            removedImageIndexes: [],
            imagePreview: null,
            editingProductId: null,
            isDeleteModalOpen: false,
            productIdToDelete: null,
            deleteConfirmationText: '',
            showFilters: false,
            addedToCart: false,
            cartAnimating: false,
            cartAnimatingIds: [],
            addedToCartIds: [],
            liking: false,
            liked: false,
            toastVisible: false,
            toastMessage: '',
            toastColor: 'success',
        };
    }

    componentDidMount() {
        this.fetchProducts();
        const verifyUser = sessionStorage.getItem('userId');
        if (verifyUser) {
            this.props.fetchLikedProducts();
        }
    }

    componentWillUnmount() {
        this.state.imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
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

        if (filters.selectedCategory && filters.selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === filters.selectedCategory);
        }

        if (filters.selectedBrands && filters.selectedBrands.length > 0) {
            filtered = filtered.filter(p => filters.selectedBrands.includes(p.brand));
        }

        if (filters.minPrice) {
            filtered = filtered.filter(p => parseFloat(p.price) >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(p => parseFloat(p.price) <= parseFloat(filters.maxPrice));
        }

        if (filters.inStockOnly === true) {
            filtered = filtered.filter(p => p.stock > 0);
        }

        this.setState({ filteredProducts: filtered });
    };

    addProducts = () => {
        this.setState({ renderLayput: 1 });
    };

    editProducts = (product) => {
        this.setState({
            renderLayput: 2,
            editingProductId: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            brand: product.brand || '',
            offerPrice: product.offerPrice || '',
            category: product.category,
            stock: product.stock,
            existingImages: product.productImages || [], // Store existing images
            removedImageIndexes: [],                    // Initialize empty array
            imageFiles: [],                             // Clear any new files
        });
    };

    closeModal = () => {
        this.setState({
            renderLayput: 0,
            name: '',
            description: '',
            price: '',
            category: '',
            imageFiles: [],
            imagePreviews: [],
            stock: '',
            brand: '',
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

    handleSubmit = async (e) => {
        e.preventDefault();
        const { name, description, price, category, imageFiles, stock, offerPrice, brand } = this.state;

        if (!name || !description || !price || !category || !imageFiles.length || !stock || !brand) {
            toast.error("All fields are required!");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('stock', stock);
        formData.append('offerPrice', offerPrice || '');
        formData.append('brand', brand || '');

        imageFiles.forEach((imgObj) => {
            formData.append('images', imgObj.file);
        });

        try {
            await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Product added successfully!");
            this.fetchProducts();
            this.closeModal();
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error("Failed to add product.");
        }
    };


    handleUpdate = async (e) => {
        e.preventDefault();
        const {
            name, description, price, category,
            imageFiles, stock, editingProductId, offerPrice, brand,
            removedImageIndexes
        } = this.state;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('stock', stock);
        formData.append('offerPrice', offerPrice || '');
        formData.append('brand', brand || '');

        // Append new images
        imageFiles.forEach(fileObj => {
            formData.append('images', fileObj.file);
        });

        // Append indexes of images to remove
        formData.append('removedImageIndexes', JSON.stringify(removedImageIndexes));

        try {
            await api.put(`/products/${editingProductId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Product updated successfully!");
            this.fetchProducts();
            this.closeModal();
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error("Failed to update product.");
        }
    };

    handleAddToCart = (product) => {
        const { cartAnimatingIds } = this.state;
        const userID = sessionStorage.getItem('token');
        if (!userID) {
            this.showToast('please login to Wishlist the product', 'danger')
            return;
        }

        if (cartAnimatingIds.includes(product._id)) {
            return;
        }

        this.setState(prevState => ({
            cartAnimatingIds: [...prevState.cartAnimatingIds, product._id],
        }));

        this.props.addToCart(product)
            .then(() => {
                this.showToast('Added to cart!');
            })
            .catch((err) => {
                this.showToast(err.message, 'danger');
            })
            .finally(() => {
                setTimeout(() => {
                    this.setState(prev => ({
                        cartAnimatingIds: prev.cartAnimatingIds.filter(id => id !== product._id),
                    }));
                }, 1000);
            });
    };


    handleLikeToggle = (product) => {
        const userID = sessionStorage.getItem('token')
        if (!userID) {
            this.showToast('please login to Wishlist the product', 'danger')
            return;
        }
        if (!product || !product._id) {
            this.showToast("Invalid product.", "danger");
            return;
        }

        const { likedProducts, toggleLike } = this.props;
        const isCurrentlyLiked = likedProducts.includes(product._id);

        toggleLike(product._id, isCurrentlyLiked)
            .then((newLikedStatus) => {
                this.props.fetchLikedProducts();
                this.showToast(newLikedStatus ? "Product liked" : "Product unliked");
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

    render() {
        const { products, filteredProducts, renderLayput, loading, searchQuery, categories, cartAnimatingIds, liked, liking, toastColor, toastMessage, toastVisible } = this.state;
        const { role, likedProducts, loadingLikes } = this.props;

        if (!products) return <Container className="mt-5"><h4>Product not found.</h4></Container>;

        return (
            <section className="home-container">
                {loading && <Spinner color="primary" className='text-center' style={{ width: '3rem', height: '3rem' }} />}
                {!loading && (
                    <Row>
                        <Col xs="12" className="d-md-none mb-3 d-flex justify-content-end">
                            <Button className='bg-transparent' onClick={this.toggleFilters}>
                                <FcFilledFilter size={24} />
                            </Button>
                        </Col>
                        {(this.state.showFilters || window.innerWidth >= 768) && (
                            <Col lg="2" xs="12" md="2" className="mb-4 d-md-block d-print-none">
                                <ProductFilters
                                    product={products}
                                    categories={categories}
                                    onFilterChange={this.handleFilterChange}
                                />
                            </Col>
                        )}
                        <Col className="mb-4">
                            <Row className='mb-4'>
                                <Col lg='12' xs='12' md='8'>
                                    <Input
                                        type="text"
                                        name="searchQuery"
                                        value={searchQuery}
                                        onChange={this.handleChange}
                                        placeholder="Search products by name or category..."
                                    />
                                </Col>
                                {(role === 'admin' || role === 'superadmin') && (
                                    <Col lg='12' xs='12' md='4'>
                                        <Button color="primary" onClick={this.addProducts}>Add Product</Button>
                                    </Col>
                                )}
                            </Row>
                            <Row>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <Col key={product._id} sm="6" md="4" lg="3" className="mb-4">
                                            <Card className="h-100 product-card shadow-sm border-0">
                                                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <div className="product-image-wrapper">
                                                        <img
                                                            src={product.productImages[0]}
                                                            alt={product.name}
                                                            className="img-fluid product-image"
                                                        />
                                                    </div>
                                                    <CardBody className="text-center">
                                                        <CardTitle tag="h5" className="product-title fw-bold">{product.name}</CardTitle>
                                                        <RatingDisplay productId={product._id} />
                                                        {!isNaN(parseFloat(product.price)) ? (
                                                            product.offerPrice ? (
                                                                <Row className="mb-1">
                                                                    <Col className="text-success fw-semibold mb-0">₹{product.offerPrice}</Col>
                                                                    <Col className="text-muted mb-1" style={{ textDecoration: 'line-through' }}>
                                                                        ₹{product.price}
                                                                    </Col>
                                                                    <Col className="text-danger small mb-0">
                                                                        ({Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF)
                                                                    </Col>
                                                                </Row>
                                                            ) : (
                                                                <p className="text-success fw-semibold mb-1">₹{product.price}</p>
                                                            )
                                                        ) : (
                                                            <p className="text-muted fw-semibold mb-1 bg-body-secondary">{product.price}</p>
                                                        )}

                                                        <p className="text-muted small mb-0">{product.category}</p>
                                                    </CardBody>
                                                </Link>
                                                <CardFooter className="d-flex justify-content-between">
                                                    <Button
                                                        color="primary"
                                                        onClick={() => this.handleAddToCart(product)}
                                                    >
                                                        {cartAnimatingIds.includes(product._id)
                                                            ? <Spinner size="sm" />
                                                            : <><FaShoppingCart /> Add to Cart</>
                                                        }
                                                    </Button>
                                                    <Button color="link" onClick={(e) => {
                                                        e.stopPropagation();
                                                        this.handleLikeToggle(product);
                                                    }}
                                                        disabled={loadingLikes}
                                                        className="p-0 like-button"
                                                    >
                                                        {likedProducts && likedProducts.includes(product._id) ? (
                                                            <FaHeart size={32} className="text-danger" />
                                                        ) : (
                                                            <FaRegHeart size={32} className="text-secondary" />
                                                        )}
                                                        {loadingLikes && (
                                                            <Spinner size="sm" color="secondary" className="ms-2" />
                                                        )}
                                                    </Button>
                                                </CardFooter>
                                                {(role === 'admin' || role === 'superadmin') && (
                                                    <div className="d-flex justify-content-center mb-3">
                                                        <Button
                                                            color="warning"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                this.editProducts(product);
                                                            }}
                                                            className="me-2"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            color="danger"
                                                            size="sm"
                                                            onClick={() => this.openDeleteModal(product._id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                )}
                                            </Card>
                                        </Col>
                                    ))
                                ) : (
                                    <Col>
                                        <p>No products found for "<strong>{searchQuery}</strong>".</p>
                                    </Col>
                                )}
                            </Row>
                        </Col>
                    </Row>
                )
                }

                {renderLayput === 1 && this.renderProductModal()}
                {renderLayput === 2 && this.renderProductModal(true)}
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
    loadingLikes: state.products.loadingLikes,
    loadingCart: state.products.loadingCart,
});


const mapDispatchToProps = {
    addToCart,
    toggleLike,
    fetchLikedProducts,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);