import React from 'react';
import { Button, Container, Row, Col, Input, Card, CardBody, CardTitle, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FcFilledFilter } from "react-icons/fc";
import api from '../utils/Api';
import ProductFilters from './ProductFilters';
import { toast } from 'react-toastify';
import HomeHelper from './HomeHelper';
import { connect } from 'react-redux';
import '../../styles/Home.css';

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
            imageFile: null,
            imagePreview: null,
            editingProductId: null,
            isDeleteModalOpen: false,
            productIdToDelete: null,
            deleteConfirmationText: '',
            showFilters: false,
        };
    }

    componentDidMount() {
        this.fetchProducts();
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
            imagePreview: product.image
        });
    };

    closeModal = () => {
        this.setState({
            renderLayput: 0,
            name: '',
            description: '',
            price: '',
            category: '',
            imageFile: null,
            imagePreview: null,
            stock: '',
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


    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, () => {
            if (e.target.name === 'searchQuery') {
                this.handleSearch();
            }
        });
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

    handleSubmit = async (e) => {
        e.preventDefault();
        const { name, description, price, category, imageFile, stock, offerPrice } = this.state;

        if (!name || !description || !price || !category || !imageFile || !stock) {
            toast.error("All fields are required!");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('image', imageFile);
        formData.append('stock', stock);
        formData.append('offerPrice', offerPrice || '');

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
            imageFile, stock, editingProductId, offerPrice, brand
        } = this.state;

        if (!name || !description || !price || !category) {
            toast.error("All fields except image are required!");
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

        if (imageFile) {
            formData.append('image', imageFile);
        }

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

    renderStars = (rating) => {
        const maxStars = 5;
        let stars = '';
        for (let i = 0; i < maxStars; i++) {
            stars += i < rating ? '★' : '☆';
        }
        return stars;
    };

    toggleFilters = () => {
        this.setState({ showFilters: !this.state.showFilters });
    }

    render() {
        const { products, filteredProducts, renderLayput, loading, searchQuery, categories } = this.state;
        const { role } = this.props;

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
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="img-fluid product-image"
                                                        />
                                                    </div>
                                                    <CardBody className="text-center">
                                                        <CardTitle tag="h5" className="product-title fw-bold">{product.name}</CardTitle>
                                                        <div className="my-3">
                                                            <div style={{ fontSize: '1.5rem', color: '#FFD700' }}>
                                                                {this.renderStars(Math.round(product.averageRating))}
                                                            </div>
                                                            <h5>Average Rating: {product.averageRating.toFixed(1)} / 5</h5>
                                                        </div>
                                                        {!isNaN(parseFloat(product.price)) ? (
                                                            product.offerPrice ? (
                                                                <div className="mb-1">
                                                                    <p className="text-success fw-semibold mb-0">₹{product.offerPrice}</p>
                                                                    <p className="text-muted mb-1" style={{ textDecoration: 'line-through' }}>
                                                                        ₹{product.price}
                                                                    </p>
                                                                    <p className="text-danger small mb-0">
                                                                        ({Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF)
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-success fw-semibold mb-1">₹{product.price}</p>
                                                            )
                                                        ) : (
                                                            <p className="text-muted fw-semibold mb-1 bg-body-secondary">{product.price}</p>
                                                        )}

                                                        <p className="text-muted small mb-0">{product.category}</p>
                                                    </CardBody>
                                                </Link>
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
            </section >
        );
    }
}


const mapStateToProps = (state) => ({
    role: state.auth.role,
});

export default connect(mapStateToProps)(Home);