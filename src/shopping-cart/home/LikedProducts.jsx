import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Spinner, CardImg, Container } from 'reactstrap';
import api from '../utils/Api';

export default class LikedProducts extends Component {
    state = {
        likedProducts: [],
        loading: true,
    };

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

    render() {
        const { likedProducts, loading } = this.state;

        return (
            <Container className="my-5">
                <h2 className="mb-4">Your Wishlist</h2>
                {loading ? (
                    <div className="text-center"><Spinner /></div>
                ) : likedProducts.length === 0 ? (
                    <p>No liked products yet.</p>
                ) : (
                    <Row>
                        {likedProducts.map(product => (
                            <Col md="4" lg="3" key={product._id} className="mb-4">
                                <Card>
                                    <CardImg top src={product.image} alt={product.name} />
                                    <CardBody>
                                        <CardTitle tag="h5">{product.name}</CardTitle>
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
