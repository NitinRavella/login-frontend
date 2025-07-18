import React, { Component } from 'react';
import {
    Container, Row, Col, Card, CardBody, Input, Label,
    Button, FormGroup, Form, Spinner
} from 'reactstrap';
import api from '../utils/Api';
import withRouter from '../components/WithRoute';
import { clearCart } from '../../redux/actions/productActions';
import { connect } from 'react-redux';
import { notifyError, notifySuccess, notifyWarning } from '../utils/toastUtils';
import { REACT_APP_RAZORPAY_KEY_ID } from '../services/ServiceConstants';

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
            paymentMethod: 'COD',
            loading: false,
            verifyingPayment: false
        };
    }

    componentDidMount() {
        this.fetchCart();
        this.successSound = new Audio('/sounds/success.mp3');

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            notifySuccess("Razorpay script loaded");
        };
        document.body.appendChild(script);
    }

    fetchCart = async () => {
        const userId = sessionStorage.getItem('userId');
        try {
            const res = await api.get(`/${userId}/cart`);
            this.setState({ cartProducts: res.data || [] });
        } catch (err) {
            notifyError('Unable to fetch cart.');
        }
    };

    getSummary = () => {
        const { cartProducts } = this.state;
        let itemsPrice = 0;
        let discount = 0;

        cartProducts.forEach((item) => {
            const price = item.variant?.pricing?.price ?? 0;
            const offer = item.variant?.pricing?.offerPrice ?? price;
            const quantity = item.quantity;
            itemsPrice += price * quantity;
            discount += (price - offer) * quantity;
        });

        const totalAmount = itemsPrice - discount;
        return { itemsPrice, discount, totalAmount };
    };

    handlePlaceOrder = async () => {
        const userId = sessionStorage.getItem('userId');
        const { address, city, pincode, phone, cartProducts, state, paymentMethod } = this.state;

        if (!address || !city || !pincode || !phone) {
            return notifyWarning('Please fill in all address details');
        }

        if (!/^[6-9][0-9]{9}$/.test(phone)) {
            return notifyWarning('Invalid Indian mobile number');
        }

        const fullPhone = '+91' + phone;

        const items = cartProducts.map(item => ({
            product: item.product._id,
            variantId: item.variant?.variantId,
            quantity: item.quantity,
            selectedSize: item.selectedSize || null,
            selectedColor: item.variant?.color || null,
            selectedRam: item.variant?.ram || null,
            selectedRom: item.variant?.rom || null
        }));

        const summary = this.getSummary();
        const orderData = {
            userId,
            shippingAddress: { address, city, state, pincode, phone: fullPhone },
            items,
            summary,
            paymentMethod,
        };

        this.setState({ loading: true });

        try {
            if (paymentMethod === 'COD') {
                const res = await api.post(`/order/checkout`, orderData);
                if (res.data.success) {
                    this.props.clearCart();
                    this.successSound.play().catch(console.warn);
                    this.props.navigate('/order-confirmation');
                } else {
                    notifyError('Order failed. Please try again.');
                }
            } else {
                const res = await api.post(`/razorpay/create-order`, {
                    amount: summary.totalAmount
                });

                const { razorpayOrderId, amount, currency } = res.data;
                const name = sessionStorage.getItem('username') || 'Guest';
                const email = sessionStorage.getItem('userEmail') || 'guest@example.com';

                const options = {
                    key: REACT_APP_RAZORPAY_KEY_ID,
                    amount,
                    currency,
                    order_id: razorpayOrderId,
                    name: "Your Store",
                    description: "Order Payment",
                    handler: async (response) => {
                        this.setState({ verifyingPayment: true });
                        try {
                            const verifyRes = await api.post(`/verify-payment`, {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderData
                            });

                            if (verifyRes.data?.success) {
                                notifySuccess("Payment successful! Order placed.");
                                this.props.clearCart();
                                this.successSound.play().catch(console.warn);
                                this.props.navigate('/order-confirmation');
                            } else {
                                notifyError("Payment verification failed.");
                            }
                        } catch (err) {
                            console.error('Verification or order save error:', err);
                            notifyError("Something went wrong. Please contact support.");
                        } finally {
                            this.setState({ loading: false, verifyingPayment: false });
                        }
                    },
                    prefill: { name, email, contact: phone },
                    theme: { color: "#28a745" }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (err) {
            console.error('Order/payment error:', err);
            notifyError('Order failed. Please try again.');
        } finally {
            this.setState({ loading: false });
        }
    };

    fetchCityState = async (pincode) => {
        if (pincode.length !== 6) return;

        try {
            const res = await api.get(`/pincode/${pincode}`);
            const { city, state } = res.data;
            this.setState({ city, state });
        } catch (err) {
            notifyError("Invalid pincode or failed to fetch");
            this.setState({ city: '', state: '' });
        }
    };

    render() {
        const { cartProducts, address, city, pincode, phone, state, loading, paymentMethod, verifyingPayment } = this.state;
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
                                                <Input type="text" value={state} readOnly />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label>Phone Number</Label>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-2">+91</span>
                                                    <Input
                                                        type="tel"
                                                        pattern="[6-9]{1}[0-9]{9}"
                                                        maxLength="10"
                                                        placeholder="Enter 10-digit number"
                                                        value={phone}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10); // numeric only, 10 max
                                                            this.setState({ phone: value });
                                                        }}
                                                        required
                                                    />
                                                </div>
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
                                        {item.quantity * (item.variant.offerPrice ?? item.variant.price)}
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

                                <FormGroup tag="fieldset" className="mt-3">
                                    <legend className="fs-6 fw-bold mb-2">💳 Payment Method</legend>
                                    <FormGroup check>
                                        <Input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => this.setState({ paymentMethod: e.target.value })}
                                        />
                                        <Label check>Cash on Delivery (COD)</Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Razorpay"
                                            checked={paymentMethod === 'Razorpay'}
                                            onChange={(e) => this.setState({ paymentMethod: e.target.value })}
                                        />
                                        <Label check>Pay Online (Razorpay)</Label>
                                    </FormGroup>
                                </FormGroup>

                                <Button
                                    color="success"
                                    className="mt-4 w-100 d-flex align-items-center justify-content-center"
                                    onClick={this.handlePlaceOrder}
                                    disabled={loading || verifyingPayment}
                                >
                                    {(loading || verifyingPayment) ? (
                                        <>
                                            <Spinner size="sm" color="light" className="me-2" />
                                            {verifyingPayment ? 'Verifying & Placing Order...' : 'Processing...'}
                                        </>
                                    ) : (
                                        '✅ Place Order'
                                    )}
                                </Button>

                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(null, { clearCart })(withRouter(Checkout));
