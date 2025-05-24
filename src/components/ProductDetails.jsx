import React from 'react';
import { Container, Row, Col, Button, Spinner, Input, Label, Form, FormGroup, Toast, ToastBody, ToastHeader } from 'reactstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/Api';

class ProductDetailsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            product: null,
            loading: true,
            rating: 5,
            comment: '',
            submitting: false,
            toastVisible: false,
            toastMessage: '',
            toastColor: 'success', // success or danger
        };
    }

    componentDidMount() {
        this.fetchProduct();
    }

    fetchProduct = async () => {
        const { id } = this.props.params;
        this.setState({ loading: true });
        try {
            const response = await api.get(`/products/${id}`);
            this.setState({ product: response.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch product:", error);
            this.showToast('Failed to fetch product', 'danger');
            this.setState({ loading: false });
        }
    }

    renderStars = (rating) => {
        const maxStars = 5;
        let stars = '';
        for (let i = 0; i < maxStars; i++) {
            stars += i < rating ? '★' : '☆';
        }
        return stars;
    };

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    showToast = (message, color = 'success') => {
        this.setState({ toastVisible: true, toastMessage: message, toastColor: color });
        setTimeout(() => {
            this.setState({ toastVisible: false });
        }, 3000);
    };

    handleSubmitRating = async (e) => {
        e.preventDefault();
        const { rating, comment } = this.state;
        const { id } = this.props.params;

        if (!rating || rating < 1 || rating > 5) {
            this.showToast("Please provide a rating between 1 and 5.", 'danger');
            return;
        }

        this.setState({ submitting: true });

        try {
            await api.post(`/products/${id}/rating`, {
                rating: Number(rating),
                comment: comment.trim() === '' ? undefined : comment.trim()
            });
            this.setState({ rating: 5, comment: '', submitting: false });
            this.showToast("Thank you for your rating!", 'success');
            this.fetchProduct();
        } catch (error) {
            console.error(error);
            this.setState({ submitting: false });
            this.showToast(error.response.data.message || "Failed to submit rating. Try again.", 'danger');
        }
    };

    render() {
        const { product, loading, rating, comment, submitting, toastVisible, toastMessage, toastColor } = this.state;

        if (loading) return (
            <Container className="mt-5">
                <Spinner color="primary">Loading...</Spinner>
            </Container>
        );
        if (!product) return (
            <Container className="mt-5">
                <h4>Product not found.</h4>
            </Container>
        );

        return (
            <Container className="mt-5">
                <Row>
                    <Col md="6" className="text-center">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="img-fluid"
                            style={{ maxHeight: '400px', objectFit: 'contain' }}
                        />
                    </Col>
                    <Col md="6">
                        <h2>{product.name}</h2>
                        <p className="text-muted">{product.category}</p>
                        <h3 className="text-success">₹{product.price}</h3>
                        <p style={{ fontSize: '1.1rem' }}>{product.description}</p>
                        <p><strong>Stock:</strong> {product.stock}</p>

                        <div className="mt-4 d-flex gap-3">
                            <Button color="primary">Add to Cart</Button>
                        </div>

                        {/* Average rating */}
                        <div className="my-3">
                            <h5>Average Rating: {product.averageRating.toFixed(1)} / 5</h5>
                            <div style={{ fontSize: '1.5rem', color: '#FFD700' }}>
                                {this.renderStars(Math.round(product.averageRating))}
                            </div>
                        </div>


                        {/* Ratings List */}
                        <div className="mt-4">
                            <h5>User Ratings:</h5>
                            {product.ratings.length === 0 && <p>No ratings yet.</p>}
                            {product.ratings.map((r, idx) => (
                                <div key={idx} className="mb-3 p-3 border rounded">
                                    <Row>
                                        <Col xs="5" className="text-start">
                                            <strong>{r.userName}</strong>
                                        </Col>
                                        <Col xs="7" className="text-end">
                                            <small className="text-muted">
                                                {new Date(r.date).toLocaleDateString()}
                                            </small>
                                        </Col>
                                    </Row>
                                    <div style={{ color: '#FFD700', fontSize: '1.2rem' }}>
                                        {this.renderStars(r.rating)}
                                    </div>
                                    {r.comment && <p style={{ marginTop: '0.5rem' }}>{r.comment}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Rating form */}
                        <div className="mt-5">
                            <h5>Rate this product</h5>
                            <Form onSubmit={this.handleSubmitRating}>
                                <FormGroup>
                                    <Label for="rating">Rating (1 to 5)</Label>
                                    <Input
                                        type="number"
                                        id="rating"
                                        name="rating"
                                        min="1"
                                        max="5"
                                        value={rating}
                                        onChange={this.handleInputChange}
                                        disabled={submitting}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="comment">Comment (optional)</Label>
                                    <Input
                                        type="textarea"
                                        id="comment"
                                        name="comment"
                                        value={comment}
                                        onChange={this.handleInputChange}
                                        disabled={submitting}
                                        placeholder="Write your review here..."
                                    />
                                </FormGroup>
                                <Button color="primary" type="submit" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>

                {/* Toast */}
                <div
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 9999,
                        minWidth: '250px',
                    }}
                >
                    <Toast isOpen={toastVisible} className={`bg-${toastColor} text-white`}>
                        <ToastHeader toggle={() => this.setState({ toastVisible: false })}>
                            {toastColor === 'success' ? 'Success' : 'Error'}
                        </ToastHeader>
                        <ToastBody>
                            {toastMessage}
                        </ToastBody>
                    </Toast>
                </div>
            </Container>
        );
    }
}

const ProductDetails = (props) => {
    const params = useParams();
    const navigate = useNavigate();
    return <ProductDetailsComponent {...props} params={params} navigate={navigate} />;
};

export default ProductDetails;
