import React, { Component } from 'react';
import api from '../utils/Api';
import { Card, CardBody, CardTitle, CardText, Input, Row, Col, Button } from 'reactstrap';
import { FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import withRouter from '../components/WithRoute';
import { connect } from 'react-redux';
import { updateCartQuantity, fetchCart } from '../../redux/actions/productActions';
import '../../styles/AddToCart.css'

class AddToCart extends Component {

    componentDidMount() {
        const { dispatch } = this.props;
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            dispatch(fetchCart(userId));
        }
    }

    handleQuantityChange = async (productId, newQty, selectedSize, selectedRam, selectedRom, selectedColor) => {
        const { dispatch } = this.props;
        try {
            await dispatch(updateCartQuantity(productId, newQty, selectedSize, selectedColor, selectedRam, selectedRom));
            toast.success('Quantity updated successfully!');
        } catch (err) {
            toast.error(err?.response.data?.message);
            console.error('Failed to update quantity:', err);
        }
    };

    handleDelete = async (item) => {
        const { dispatch } = this.props;
        const userId = sessionStorage.getItem('userId');
        if (!userId) return toast.error('You must be logged in');

        try {
            await api.delete(`/${userId}/cart/${item.product._id}`, {
                data: {
                    variantId: item.variant?.variantId,
                    selectedSize: item.selectedSize,
                    selectedColor: item.selectedColor,
                    selectedRam: item.selectedRam,
                    selectedRom: item.selectedRom
                }
            });

            toast.success('Product removed from cart!');
            dispatch(fetchCart(userId));
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(err?.response?.data?.message || 'Failed to delete product');
        }
    };

    getCartSummary = () => {
        const { cartProducts = [] } = this.props;

        let itemsPrice = 0;
        let discount = 0;

        cartProducts.forEach((item) => {
            const price = item.variant?.pricing?.price || 0;
            const offer = item.variant?.pricing?.offerPrice || price;
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
                    <Row>
                        <Col md="8">
                            {cartProducts.map((item, index) => {
                                const isFashion = ['clothing', 'shoes'].includes(item.product.category.toLowerCase());
                                const isElectronics = ['phone', 'laptop', 'tablet', 'smartwatch'].includes(item.product.category.toLowerCase());
                                const maxQty = isFashion
                                    ? item.variant?.sizeStock?.find(s => s.size === item.selectedSize)?.stock || 10
                                    : item.variant?.stock || 10;
                                console.log('item', item)
                                return (
                                    <Card key={index} className="mb-3 border rounded-0 cart-card shadow-sm">
                                        <Row className="g-0">
                                            <Col md="4" className="p-3">
                                                <div className="cart-image-wrapper">
                                                    <img
                                                        src={item.variant?.images?.[0] || item.product?.mainImages?.[0]?.url}
                                                        alt={item.product?.name}
                                                        className="cart-product-image"
                                                    />
                                                </div>
                                            </Col>
                                            <Col md="8" className="p-3">
                                                <h5
                                                    style={{ cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => this.props.navigate(`/product/${item.product._id}`, {
                                                        state: {
                                                            selectedColor: item.selectedColor,
                                                            selectedSize: item.selectedSize,
                                                            selectedRam: item.selectedRam,
                                                            selectedRom: item.selectedRom,
                                                            variantId: item.variant?.variantId
                                                        }
                                                    })}
                                                >
                                                    {item.product?.name}
                                                    {item?.selectedColor && ` - (${item.selectedColor})`}
                                                    {item?.selectedSize && `-[${item.selectedSize}]`}
                                                    {item?.selectedRam && ` | ${item.selectedRam} RAM`}
                                                    {item?.selectedRom && ` | ${item?.selectedRom} ROM`}
                                                </h5>
                                                <p className="text-muted mb-1">Color: {item.selectedColor}</p>
                                                {isFashion && <p className="text-muted mb-1">Size: {item.selectedSize}</p>}
                                                {isElectronics && (
                                                    <p className="text-muted mb-1">
                                                        RAM: {item.selectedRam} | ROM: {item.selectedRom}
                                                    </p>
                                                )}

                                                <div className="d-flex align-items-center mb-2">
                                                    <Button
                                                        size="sm"
                                                        outline
                                                        color="secondary"
                                                        disabled={item.quantity === 1}
                                                        onClick={() =>
                                                            this.handleQuantityChange(item.product._id, item.quantity - 1, item.selectedSize, item.selectedRam, item.selectedRom, item.selectedColor)
                                                        }
                                                    >-</Button>
                                                    <span className="mx-3">{item.quantity}</span>
                                                    <Button
                                                        size="sm"
                                                        outline
                                                        color="secondary"
                                                        onClick={() => {
                                                            if (item.quantity < maxQty) {
                                                                this.handleQuantityChange(
                                                                    item.product._id,
                                                                    item.quantity + 1,
                                                                    item.selectedSize,
                                                                    item.selectedRam,
                                                                    item.selectedRom,
                                                                    item.selectedColor
                                                                );
                                                            } else {
                                                                toast.info(`Only ${maxQty} in stock`);
                                                            }
                                                        }}
                                                    >+</Button>
                                                </div>

                                                {item.variant?.pricing?.offerPrice ? (
                                                    <>
                                                        <div className="text-success fw-semibold fs-5 mb-0">₹{item.variant.pricing.offerPrice}</div>
                                                        <div className="text-muted" style={{ textDecoration: 'line-through' }}>₹{item.variant.pricing.price}</div>
                                                        <div className="text-danger small">
                                                            You save ₹{(item.variant.pricing.price - item.variant.pricing.offerPrice) * item.quantity} (
                                                            {Math.round(((item.variant.pricing.price - item.variant.pricing.offerPrice) / item.variant.pricing.price) * 100)}% OFF)
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-success fw-semibold fs-5">₹{item.variant?.pricing.price}</div>
                                                )}

                                                <div className="text-end mt-2">
                                                    <Button color="" size="sm" onClick={() => this.handleDelete(item)}>
                                                        <FaTrashAlt className="me-1" color='red' />
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                );
                            })}
                        </Col>

                        <Col md="4">
                            <div className="sticky-top" style={{ top: '90px' }}>
                                <div className="p-4 border rounded-3 bg-white shadow-sm">
                                    <h5 className="mb-3">Price Details</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Price ({summary.itemCount} items)</span>
                                        <span>₹{summary.itemsPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between text-danger mb-2">
                                        <span>Discount</span>
                                        <span>-₹{summary.discount.toFixed(2)}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                                        <span>Total</span>
                                        <span>₹{summary.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <Button
                                        color="primary"
                                        block
                                        onClick={() => this.props.navigate('/checkout')}
                                        disabled={summary.totalAmount === 0}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
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
    cartProducts: state.products.cart,
    loadingCart: state.products.loadingCart,
    cartError: state.products.cartError,
});

export default connect(mapStateToProps)(withRouter(AddToCart));
