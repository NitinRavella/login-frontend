import React, { Component } from 'react';
import {
    Row, Col, Card, CardBody, CardTitle, Spinner,
    CardImg, Container, Button
} from 'reactstrap';
import { FaHeartBroken } from 'react-icons/fa';
import api from '../utils/Api';
import withRouter from '../components/WithRoute';
import '../../styles/Wishlist.css'

class LikedProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            likedProducts: [],
            loading: true,
        };
    }

    componentDidMount() {
        this.fetchLikedProducts();
    }

    fetchLikedProducts = async () => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            this.setState({ loading: false });
            return;
        }
        try {
            const res = await api.get(`/${userId}/liked-products`);
            this.setState({ likedProducts: res.data, loading: false });
        } catch (error) {
            console.error('Failed to fetch liked products:', error);
            this.setState({ loading: false });
        }
    };

    handleRemoveFromWishlist = async (productId) => {
        const userId = sessionStorage.getItem('userId');
        try {
            await api.delete(`/${userId}/unlike/${productId}`);
            this.setState(prev => ({
                likedProducts: {
                    ...prev.likedProducts,
                    likedProductsWithImages: prev.likedProducts.likedProductsWithImages.filter(p => p._id !== productId),
                }
            }));
        } catch (err) {
            console.error('Failed to remove liked product:', err);
        }
    };

    render() {
        const { likedProducts, loading } = this.state;

        return (
            <Container className="my-5">
                <h2 className="mb-4 text-center fw-bold">Your Wishlist</h2>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : likedProducts?.likedProductsWithImages?.length === 0 ? (
                    <div className="text-center text-muted">No liked products yet.</div>
                ) : (
                    <Row>
                        {likedProducts?.likedProductsWithImages.map(product => (
                            <Col md="6" lg="4" xl="3" key={product._id} className="mb-4">
                                <Card className="wishlist-card shadow-sm position-relative h-100">
                                    <div
                                        className="wishlist-img-container"
                                        onClick={() => this.props.navigate(`/product/${product._id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <CardImg
                                            top
                                            src={product.productImages[0]}
                                            alt={product.name}
                                            className="wishlist-img"
                                        />
                                        <Button
                                            color="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-2 rounded-circle"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                this.handleRemoveFromWishlist(product._id);
                                            }}
                                            title="Remove from wishlist"
                                        >
                                            <FaHeartBroken />
                                        </Button>
                                    </div>
                                    <CardBody>
                                        <CardTitle tag="h5" className="text-truncate">{product.name}</CardTitle>
                                        {!isNaN(parseFloat(product.price)) ? (
                                            product.offerPrice ? (
                                                <>
                                                    <p className="text-success fw-semibold mb-0">₹{product.offerPrice}</p>
                                                    <p className="text-muted mb-1" style={{ textDecoration: 'line-through' }}>
                                                        ₹{product.price}
                                                    </p>
                                                    <p className="text-danger small mb-0">
                                                        ({Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF)
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-success fw-semibold mb-1">₹{product.price}</p>
                                            )
                                        ) : (
                                            <p className="text-muted fw-semibold mb-1 bg-body-secondary">{product.price}</p>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        );
    }
}

export default withRouter(LikedProducts);
