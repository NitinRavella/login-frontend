import React from 'react';
import {
    Button, Container, Row, Col, Form, FormGroup, Label, InputGroup, Input, Modal, ModalHeader, ModalBody, ModalFooter, Card, CardBody,
    CardTitle, InputGroupText, Spinner
} from 'reactstrap';
import { FaTag, FaInfoCircle, FaListAlt, FaBox, FaImage, FaTrash } from 'react-icons/fa';
import { Navigate, Link } from 'react-router-dom';
import api from '../utils/Api';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import '../style/Home.css';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            logout: false,
            renderLayput: 0,
            products: [],
            filteredProducts: [],
            searchQuery: '',
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            imageFile: null,
            imagePreview: null,
            isAdmin: false,
            editingProductId: null,
            isDeleteModalOpen: false,
            productIdToDelete: null,
            deleteConfirmationText: '',
        };
    }

    componentDidMount() {
        this.fetchProducts();
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        this.setState({ isAdmin });
    }

    fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            this.setState({
                products: response.data,
                filteredProducts: response.data,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        }
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
        const query = searchQuery.toLowerCase();

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

        this.setState({ filteredProducts: filtered });
    };

    onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file instanceof File) {
                this.setState({
                    imageFile: file,
                    imagePreview: URL.createObjectURL(file)
                });
            } else {
                toast.error("Invalid file uploaded.");
            }
        }
    };

    renderDropzone = () => {
        const { imagePreview } = this.state;
        const DropzoneArea = () => {
            const { getRootProps, getInputProps } = useDropzone({
                onDrop: this.onDrop,
                onDropRejected: (fileRejections) => {
                    fileRejections.forEach(rejection => {
                        const file = rejection.file;
                        if (file.size > 1048576) {
                            toast.error("File size exceeds 1MB limit!");
                        } else {
                            toast.error("Invalid file. Only image files are allowed.");
                        }
                    });
                },
                accept: { 'image/*': [] },
                multiple: false,
                maxSize: 1048576,
            });

            return (
                <div {...getRootProps()} style={{
                    border: '2px dashed #cccccc',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer'
                }}>
                    <input {...getInputProps()} />
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                    ) : (
                        <p>Drag & drop image here, or click to select (Max size: 1MB)</p>
                    )}
                </div>
            );
        };

        return <DropzoneArea />;
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { name, description, price, category, imageFile, stock } = this.state;

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
            imageFile, stock, editingProductId
        } = this.state;

        if (!name || !description || !price || !category || !stock) {
            toast.error("All fields except image are required!");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('stock', stock);

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


    renderProductModal = (isEdit = false) => {
        const {
            name, description, category, price, stock, imagePreview, imageFile
        } = this.state;

        const submitHandler = isEdit ? this.handleUpdate : this.handleSubmit;
        const modalTitle = isEdit ? "Edit Product" : "Add Product";

        return (
            <Modal isOpen={true} toggle={this.closeModal}>
                <ModalHeader toggle={this.closeModal}>{modalTitle}</ModalHeader>
                <ModalBody>
                    <Form onSubmit={submitHandler}>
                        <FormGroup>
                            <Label for="name">Name of the Product</Label>
                            <InputGroup>
                                <InputGroupText><FaTag /></InputGroupText>
                                <Input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <InputGroup>
                                <InputGroupText><FaInfoCircle /></InputGroupText>
                                <Input
                                    type="text"
                                    name="description"
                                    value={description}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label for="price">Price</Label>
                            <InputGroup>
                                <InputGroupText>₹</InputGroupText>
                                <Input
                                    type="text"
                                    name="price"
                                    value={price}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label for="category">Category</Label>
                            <InputGroup>
                                <InputGroupText><FaListAlt /></InputGroupText>
                                <Input
                                    type="text"
                                    name="category"
                                    value={category}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label for="stock">Stock</Label>
                            <InputGroup>
                                <InputGroupText><FaBox /></InputGroupText>
                                <Input
                                    type="number"
                                    name="stock"
                                    value={stock}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label>Image</Label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaImage style={{ fontSize: '1.2rem' }} />
                                {this.renderDropzone()}
                            </div>
                            {isEdit && imagePreview && !imageFile && (
                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', marginTop: '10px' }} />
                            )}
                        </FormGroup>
                        <Button type="submit" color="primary">{isEdit ? "Update" : "Add"}</Button>{' '}
                        <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
                    </Form>
                </ModalBody>
            </Modal>
        );
    };

    renderStars = (rating) => {
        const maxStars = 5;
        let stars = '';
        for (let i = 0; i < maxStars; i++) {
            stars += i < rating ? '★' : '☆';
        }
        return stars;
    };


    renderDeleteModal() {
        const { isDeleteModalOpen, deleteConfirmationText } = this.state;
        const isConfirmed = deleteConfirmationText.toLowerCase() === 'yes';

        return (
            <Modal isOpen={isDeleteModalOpen} toggle={this.closeDeleteModal}>
                <ModalHeader toggle={this.closeDeleteModal}>Confirm Delete</ModalHeader>
                <ModalBody>
                    <p>Type <strong>yes</strong> to confirm deletion of this product.</p>
                    <InputGroup>
                        <InputGroupText><FaTrash /></InputGroupText>
                        <Input
                            type="text"
                            value={deleteConfirmationText}
                            onChange={this.handleDeleteConfirmationChange}
                            placeholder="Type yes to confirm"
                        />
                    </InputGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" disabled={!isConfirmed} onClick={this.confirmDelete}>Delete</Button>
                    <Button color="secondary" onClick={this.closeDeleteModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }


    render() {
        const {
            products, filteredProducts, logout, renderLayput, loading, isAdmin, searchQuery } = this.state;

        if (logout) return <Navigate to="/login" />;
        if (!products) return <Container className="mt-5"><h4>Product not found.</h4></Container>;

        return (
            <section className="mt-5">
                {loading && <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />}
                {!loading && (
                    <>
                        {/* Search Bar */}
                        <Row className="mb-4">
                            <Col md="8">
                                <Input
                                    type="text"
                                    name="searchQuery"
                                    value={searchQuery}
                                    onChange={this.handleChange}
                                    placeholder="Search products by name or category..."
                                />
                            </Col>
                            {isAdmin && (
                                <Col md="4" className="text-end">
                                    <Button color="primary" onClick={this.addProducts}>Add Product</Button>
                                </Col>
                            )}
                        </Row>

                        {/* Product Cards */}
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
                                                    <p className="text-success fw-semibold mb-1">₹{product.price}</p>
                                                    <p className="text-muted small mb-0">{product.category}</p>
                                                </CardBody>
                                            </Link>
                                            {isAdmin && (
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
                    </>
                )}

                {renderLayput === 1 && this.renderProductModal()}
                {renderLayput === 2 && this.renderProductModal(true)}
                {this.renderDeleteModal()}
            </section>
        );
    }
}