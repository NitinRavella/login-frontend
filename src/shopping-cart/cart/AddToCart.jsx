import React, { Component } from 'react';
import api from '../utils/Api';
import { Card, CardBody, CardTitle, CardText, Input, Row, Col, Button } from 'reactstrap';
import { FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import withRouter from '../components/WithRoute';
import { connect } from 'react-redux';
import { updateCartQuantity, fetchCart } from '../../redux/actions/productActions';

class AddToCart extends Component {

    componentDidMount() {
        const { dispatch } = this.props;
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            dispatch(fetchCart(userId));  // fetchCart action fetches cart and populates Redux store
        }
    }

    handleQuantityChange = async (productId, newQty) => {
        const { dispatch } = this.props;
        try {
            await dispatch(updateCartQuantity(productId, newQty));
            toast.success('Quantity updated successfully!');
        } catch (err) {
            toast.error('Failed to update quantity. Please try again.');
            console.error('Failed to update quantity:', err);
        }
    };

    handleDelete = async (productId) => {
        const { dispatch } = this.props;
        const userId = sessionStorage.getItem('userId');
        try {
            await api.delete(`/${userId}/cart/${productId}`);
            toast.success('Product removed from cart successfully!');
            dispatch(fetchCart(userId)); // refresh cart in Redux store after deletion
        } catch (err) {
            toast.error('Failed to delete product from cart. Please try again.');
            console.error('Failed to delete product from cart:', err);
        }
    };

    getCartSummary = () => {
        const { cartProducts } = this.props;

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
        const { cartProducts } = this.props;
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
                                                src={item.product?.productImages[0]}
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
                                    <div className="text-end">
                                        <Button color="primary" onClick={() => this.props.navigate('/checkout')} disabled={summary.totalAmount === 0}>
                                            Proceed to Checkout
                                        </Button>
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

const mapStateToProps = (state) => ({
    cartProducts: state.products.cart,  // adapt if your reducer key differs
    loadingCart: state.products.loadingCart,
    cartError: state.products.cartError,
});

export default connect(mapStateToProps)(withRouter(AddToCart));
