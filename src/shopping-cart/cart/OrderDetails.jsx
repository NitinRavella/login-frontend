import React, { Component } from 'react';
import {
    Container, Card, CardBody, CardTitle, Table, Spinner, Alert, Badge
} from 'reactstrap';
import api from '../utils/Api';
import withRouter from '../components/WithRoute';

class OrderDetailsPage extends Component {
    state = {
        order: null,
        loading: true,
        error: '',
    };

    componentDidMount() {
        this.getOrderById()

    }

    getOrderById = async () => {
        const orderId = this.props.params.orderId;
        await api.get(`/orders/${orderId}`)
            .then(res => this.setState({ order: res.data.order, loading: false }))
            .catch(err => {
                console.error(err);
                this.setState({ error: 'Failed to load order.', loading: false });
            });
    }

    render() {
        const { order, loading, error } = this.state;
        const statusColorMap = {
            Placed: 'secondary',
            Confirmed: 'primary',
            Shipped: 'warning',
            'Out for Delivery': 'info',
            Delivered: 'success',
            Cancelled: 'danger',
        };


        if (loading) return <div className="text-center mt-5"><Spinner color="primary" /></div>;
        if (error) return <Alert color="danger" className="mt-3 text-center">{error}</Alert>;

        return (
            <Container className="my-5">
                <Card className="shadow-lg border-0 rounded-4">
                    <CardBody>
                        <CardTitle tag="h3" className="text-center mb-4 text-success">Order Summary</CardTitle>

                        <div className="mb-3">
                            <h5>Order ID: <span className="text-muted">{order._id}</span></h5>
                            <h6>Customer: {order.userId?.name} (<em>{order.userId?.email}</em>)</h6>
                            <h6>Status:  <Badge color={statusColorMap[order.status] || 'secondary'} className="px-3 py-2">
                                {order.status}
                            </Badge></h6>
                        </div>

                        <Table bordered hover responsive className="mt-4">
                            <thead className="bg-light">
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item?.product.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price}</td>
                                        <td>₹{(item.quantity * item.price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <div className="text-end mt-4">
                            <h5>Items Total: ₹{order.summary.itemsPrice}</h5>
                            <h5>Discount: -₹{order.summary.discount}</h5>
                            <h4 className="text-success mt-2">Grand Total: ₹{order.summary.totalAmount}</h4>
                        </div>

                        <div className="mt-5">
                            <h6 className="text-muted">Shipping Address:</h6>
                            <div className="border rounded-3 p-3 bg-light">
                                <p className="mb-1"><strong>Address:</strong> {order.shippingAddress.address}</p>
                                <p className="mb-1"><strong>City:</strong> {order.shippingAddress.city}</p>
                                <p className='mb-1'><strong>State:</strong> {order.shippingAddress.state}</p>
                                <p className="mb-1"><strong>Pincode:</strong> {order.shippingAddress.pincode}</p>
                                <p className="mb-0"><strong>Phone:</strong> {order.shippingAddress.phone}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Container>
        );
    }
}

export default withRouter(OrderDetailsPage)
