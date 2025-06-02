import React, { Component } from 'react';
import { Container, Card, CardBody, Row, Col, Spinner, Badge, Button } from 'reactstrap';
import api from '../utils/Api';

class OrderHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orders: [],
            loading: true,
        };
    }

    componentDidMount() {
        this.fetchOrders();
    }

    fetchOrders = async () => {
        const userId = sessionStorage.getItem('userId');
        try {
            const res = await api.get(`/${userId}/orders`);
            this.setState({ orders: res.data.orders, loading: false });
        } catch (err) {
            console.error('Failed to fetch orders', err);
            this.setState({ loading: false });
        }
    };

    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'placed': return 'secondary';
            case 'confirmed': return 'primary';
            case 'shipped': return 'info';
            case 'out for delivery': return 'warning';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'dark';
        }
    }

    handleCancelProduct = async (orderId, productId) => {
        try {
            const res = await api.put(`/orders/${orderId}/cancel-product/${productId}`);
            if (res.data.success) {
                alert('Product cancelled successfully!');
                this.fetchOrders();
            }
        } catch (err) {
            alert('Failed to cancel product.');
            console.error(err);
        }
    };

    handleCancelOrder = async (orderId) => {
        try {
            const res = await api.put(`/orders/${orderId}/cancel`);
            if (res.data.success) {
                alert('Order cancelled successfully!');
                this.fetchOrders();
            }
        } catch (err) {
            alert('Failed to cancel order.');
            console.error(err);
        }
    };

    canCancel(status) {
        return ['placed', 'confirmed'].includes(status.toLowerCase());
    }

    render() {
        const { orders, loading } = this.state;

        if (loading) {
            return (
                <Container className="text-center mt-5">
                    <Spinner color="primary" />
                </Container>
            );
        }

        if (orders.length === 0) {
            return (
                <Container className="mt-5 text-center">
                    <h3>No past orders found.</h3>
                </Container>
            );
        }

        return (
            <Container className="mt-5">
                <h2 className="mb-4">Your Order History</h2>
                {orders.map((order) => (
                    <Card key={order._id} className="mb-4 shadow-sm rounded-4 border-0">
                        <CardBody>
                            <Row>
                                <Col md="8">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="mb-0">
                                            Order placed on: <small className="text-muted">{new Date(order.placedAt).toLocaleString()}</small>
                                        </h5>
                                        <Badge color={this.getStatusColor(order.status)} pill style={{ fontSize: '1rem' }}>
                                            {order.status}
                                        </Badge>
                                    </div>

                                    <p className="mb-1 fw-semibold">Shipping Address:</p>
                                    <address className="mb-3">
                                        {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pincode} <br />
                                        Phone: {order.shippingAddress.phone}
                                    </address>

                                    <h6 className="mb-3">Items:</h6>
                                    <ul className="list-unstyled">
                                        {order.items.map(({ product, quantity, cancelled }) => (
                                            <li key={product._id} className="d-flex align-items-center mb-2 justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    {product.productImages && product.productImages.length > 0 ? (
                                                        <img
                                                            src={product.productImages[0].dataUri}
                                                            alt={product.name}
                                                            style={{ width: 50, height: 50, borderRadius: 4, marginRight: 10 }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: 50,
                                                                height: 50,
                                                                marginRight: 10,
                                                                backgroundColor: '#ddd',
                                                                borderRadius: 4,
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                fontSize: 24,
                                                                color: '#999'
                                                            }}
                                                        >
                                                            📦
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div>{product.name} × {quantity}</div>
                                                        <small className="text-muted">₹{(quantity * (product.offerPrice ?? product.price)).toFixed(2)}</small>
                                                        {cancelled && <div className="text-danger fw-bold small">Cancelled</div>}
                                                    </div>
                                                </div>
                                                {this.canCancel(order.status) && (
                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        onClick={() => this.handleCancelProduct(order._id, product._id)}
                                                        disabled={cancelled}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                {cancelled && <div className="text-danger fw-bold small">Cancelled</div>}

                                            </li>
                                        ))}
                                    </ul>
                                </Col>

                                <Col md="4" className="text-end">
                                    <h5 className="mb-3">Summary</h5>
                                    <p className="mb-1">Items Price: <strong>₹{order.summary.itemsPrice.toFixed(2)}</strong></p>
                                    <p className="mb-1 text-success">Discount: -₹{order.summary.discount.toFixed(2)}</p>
                                    <hr />
                                    <p className="fs-5"><strong>Total: ₹{order.summary.totalAmount.toFixed(2)}</strong></p>
                                    <Button color="primary" size="sm" className="me-2">View Details</Button>
                                    {this.canCancel(order.status) && (
                                        <Button color="danger" size="sm" onClick={() => this.handleCancelOrder(order._id)}>
                                            Cancel Order
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                ))}
            </Container>
        );
    }
}

export default OrderHistory;
