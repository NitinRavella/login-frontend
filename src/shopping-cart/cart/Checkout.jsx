// src/pages/Checkout.jsx
import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Input, Label, Button, FormGroup, Form } from 'reactstrap';
import api from '../utils/Api';
import { toast } from 'react-toastify';
import withRouter from '../components/WithRoute';

class Checkout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cartProducts: [],
            address: '',
            city: '',
            state: '',
            pincode: '',
            phone: '',
        };
    }

    componentDidMount() {
        this.fetchCart();
    }

    fetchCart = async () => {
        const userId = sessionStorage.getItem('userId');
        try {
            const res = await api.get(`/${userId}/cart`);
            this.setState({ cartProducts: res.data || [] });
        } catch (err) {
            toast.error('Unable to fetch cart.');
        }
    };

    getSummary = () => {
        const { cartProducts } = this.state;
        let itemsPrice = 0;
        let discount = 0;

        cartProducts.forEach((item) => {
            const price = item.product?.price ?? 0;
            const offer = item.product?.offerPrice ?? price;
            const quantity = item.quantity;
            itemsPrice += price * quantity;
            discount += (price - offer) * quantity;
        });

        const totalAmount = itemsPrice - discount;
        return { itemsPrice, discount, totalAmount };
    };

    handlePlaceOrder = async () => {
        const userId = sessionStorage.getItem('userId');
        const { address, city, pincode, phone, cartProducts, state } = this.state;

        if (!address || !city || !pincode || !phone) {
            return toast.warn('Please fill in all address details');
        }

        const items = cartProducts.map(item => ({
            product: item.product._id,
            quantity: item.quantity
        }));

        const orderDetails = {
            userId,
            shippingAddress: { address, city, state, pincode, phone },
            items,
            summary: this.getSummary(),
            paymentInfo: {
                method: 'COD',
                status: 'Pending',
                transactionId: ''
            }
        };

        try {
            await api.post(`/order/place`, orderDetails);
            toast.success('Order placed successfully!');
            this.props.navigate('/order-confirmation');
        } catch (err) {
            toast.error('Order failed. Try again.');
        }
    };

    fetchCityState = async (pincode) => {
        if (pincode.length !== 6) return;

        try {
            const res = await api.get(`/pincode/${pincode}`); // YOUR API now
            const { city, state } = res.data;
            this.setState({ city, state });
        } catch (err) {
            toast.error("Invalid pincode or failed to fetch");
            this.setState({ city: '', state: '' });
        }
    };


    render() {
        const { cartProducts, address, city, pincode, phone } = this.state;
        const summary = this.getSummary();

        return (
            <Container className="mt-5">
                <h2 className="mb-4">Checkout</h2>
                <Row>
                    <Col md="7">
                        <Card className="mb-4 shadow-sm rounded-4">
                            <CardBody>
                                <h5>📦 Delivery Address</h5>
                                <Form>
                                    <FormGroup>
                                        <Label>Address</Label>
                                        <Input
                                            type="textarea"
                                            value={address}
                                            onChange={(e) => this.setState({ address: e.target.value })}
                                            placeholder="Street address"
                                        />
                                    </FormGroup>
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label>Pincode</Label>
                                                <Input
                                                    type="number"
                                                    value={pincode}
                                                    onChange={(e) => {
                                                        const pincode = e.target.value;
                                                        this.setState({ pincode });
                                                        if (pincode.length === 6) this.fetchCityState(pincode);
                                                    }}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label>City</Label>
                                                <Input
                                                    type="text"
                                                    value={city}
                                                    onChange={(e) => this.setState({ city: e.target.value })}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label>State</Label>
                                                <Input type="text" value={this.state.state} readOnly />
                                            </FormGroup>
                                        </Col>
                                        <Col md='6'>
                                            <FormGroup>
                                                <Label>Phone Number</Label>
                                                <Input
                                                    type="text"
                                                    value={phone}
                                                    onChange={(e) => this.setState({ phone: e.target.value })}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Form>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm rounded-4">
                            <CardBody>
                                <h5>🛍️ Order Summary</h5>
                                {cartProducts.map((item, index) => (
                                    <div key={index} className="mb-3">
                                        <strong>{item.product.name}</strong> × {item.quantity} = ₹
                                        {item.quantity * (item.product.offerPrice ?? item.product.price)}
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md="5">
                        <Card className="shadow-sm rounded-4">
                            <CardBody>
                                <h5>🧾 Price Details</h5>
                                <div className="d-flex justify-content-between">
                                    <span>Items Price</span>
                                    <span>₹{summary.itemsPrice.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between text-danger">
                                    <span>Discount</span>
                                    <span>-₹{summary.discount.toFixed(2)}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fw-bold fs-5">
                                    <span>Total Amount</span>
                                    <span>₹{summary.totalAmount.toFixed(2)}</span>
                                </div>

                                <Button color="success" className="mt-4 w-100" onClick={this.handlePlaceOrder}>
                                    ✅ Place Order
                                </Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(Checkout);
