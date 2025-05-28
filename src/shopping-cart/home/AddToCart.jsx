import React, { Component } from 'react';
import api from '../utils/Api';
import { Card, CardBody, CardTitle, CardText, Input, Row, Col, Button } from 'reactstrap';
import { FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import withRouter from '../components/WithRoute';

class AddToCart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cartProducts: [],
        };
    }

    componentDidMount() {
        this.getCartProducts();
    }

    getCartProducts = async () => {
        const userId = sessionStorage.getItem('userId');
        try {
            const res = await api.get(`/${userId}/cart`);
            this.setState({ cartProducts: res.data || [] });
        } catch (error) {
            toast.error('Failed to fetch cart products. Please try again later.');
            console.error('Error fetching cart products:', error);
            this.setState({ cartProducts: [] });
        }
    };

    handleQuantityChange = async (productId, newQty) => {
        const userId = sessionStorage.getItem('userId');
        try {
            const res = await api.put(`/${userId}/cart/update`, {
                productId,
                quantity: newQty,
            });
            toast.success('Quantity updated successfully!');
            this.setState({ cartProducts: res.data });
        } catch (err) {
            toast.error('Failed to update quantity. Please try again.');
            console.error('Failed to update quantity:', err);
        }
    };

    handleDelete = async (productId) => {
        const userId = sessionStorage.getItem('userId');
        try {
            const res = await api.delete(`/${userId}/cart/${productId}`);
            toast.success('Product removed from cart successfully!');
            this.setState({ cartProducts: res.data });
        } catch (err) {
            toast.error('Failed to delete product from cart. Please try again.');
            console.error('Failed to delete product from cart:', err);
        }
    };

    getCartSummary = () => {
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

        return {
            itemsPrice,
            discount,
            totalAmount,
            itemCount: cartProducts.reduce((sum, item) => sum + item.quantity, 0),
        };
    };


    render() {
        const { cartProducts } = this.state;
        const summary = this.getCartSummary();

        return (
            <div className="container mt-5">
                <h3 className="mb-4">🛒 Your Cart</h3>
                {cartProducts.length > 0 ? (
                    <>
                        <Row>
                            {cartProducts.map((item, index) => (
                                <Col md="6" lg="4" key={index} className="mb-4">
                                    <Card className="shadow-sm h-100 border-0 rounded-4">
                                        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
                                            <img
                                                src={item.product?.image}
                                                alt={item.product?.name}
                                                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '0.5rem' }}
                                            />
                                        </div>
                                        <CardBody className="d-flex flex-column">
                                            <CardTitle tag="h5" className="product-title mb-2" style={{ cursor: 'pointer' }} onClick={() => this.props.navigate(`/product/${item.product._id}`)}>{item.product?.name}</CardTitle>
                                            <CardText className="text-muted mb-2">Quantity:</CardText>
                                            <Input
                                                type="select"
                                                className="mb-3 w-50"
                                                value={item.quantity}
                                                onChange={(e) => this.handleQuantityChange(item.product._id, parseInt(e.target.value))}
                                            >
                                                {[...Array(10).keys()].map((num) => (
                                                    <option key={num + 1} value={num + 1}>
                                                        {num + 1}
                                                    </option>
                                                ))}
                                            </Input>

                                            {item.product?.offerPrice ? (
                                                <>
                                                    <p className="text-success fw-semibold mb-1 fs-5">₹{item.product.offerPrice}</p>
                                                    <p className="text-muted" style={{ textDecoration: 'line-through' }}>
                                                        ₹{item.product.price}
                                                    </p>
                                                    <p className="text-danger small mb-0">
                                                        ({Math.round(((item.product.price - item.product.offerPrice) / item.product.price) * 100)}% OFF)
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-success fw-semibold fs-5">₹{item.product.price}</p>
                                            )}

                                            <div className="mt-auto text-end">
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    className="rounded-circle"
                                                    onClick={() => this.handleDelete(item.product._id)}
                                                >
                                                    <FaTrashAlt />
                                                </Button>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Summary block */}
                        <Row>
                            <Col lg="12" xs='12' className=" mt-4">
                                <div className="p-4 border rounded-4 shadow-sm bg-light">
                                    <h5 className="mb-3 fw-bold">🧾 Price Details</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Items Price ({summary.itemCount} items)</span>
                                        <span>₹{summary.itemsPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2 text-danger">
                                        <span>Discount</span>
                                        <span>-₹{summary.discount.toFixed(2)}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between fw-bold fs-5">
                                        <span>Total Amount</span>
                                        <span>₹{summary.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <div className="text-center mt-5">
                        <p className="text-muted">🛍️ Your cart is empty.</p>
                    </div>
                )}
            </div>
        );
    }
}


export default withRouter(AddToCart);