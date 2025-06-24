import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spinner } from 'reactstrap';
import { FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { addToCart, updateCartQuantity, fetchCart } from '../../redux/actions/productActions';
import api from '../utils/Api';
import '../../styles/ProductCard.css';

class ProductCard extends Component {
    state = {
        cartAnimatingIds: []
    };

    showToast = (message, type = 'success') => {
        toast[type](message);
    };

    handleAddToCart = (product) => {
        const { cartAnimatingIds } = this.state;
        const { selectedSize } = this.props
        console.log('Selected Size:', selectedSize);
        const userID = sessionStorage.getItem('token');

        if (!userID) {
            this.showToast('Please login to add to cart', 'error');
            return;
        }

        if (!selectedSize) {
            this.showToast('Please select a size before adding to cart', 'warning');
            return;
        }

        if (cartAnimatingIds.includes(product._id)) return;

        if (product.stock < 1) {
            this.showToast('Out of stock', 'info');
            return;
        }

        this.setState(prev => ({
            cartAnimatingIds: [...prev.cartAnimatingIds, product._id]
        }));

        this.props.addToCart({ ...product, selectedSize }) // ⬅ include size
            .then(() => this.showToast('Added to cart!'))
            .catch((err) => this.showToast(err.message || 'Failed to add to cart', 'error'))
            .finally(() => {
                setTimeout(() => {
                    this.setState(prev => ({
                        cartAnimatingIds: prev.cartAnimatingIds.filter(id => id !== product._id)
                    }));
                }, 1000);
            });
    };

    handleQuantityChange = async (productId, newQty, selectedSize) => {
        const userId = sessionStorage.getItem('userId');

        if (!selectedSize) {
            this.showToast('Size missing. Cannot update quantity.', 'error');
            return;
        }

        if (newQty < 1) {
            try {
                await api.delete(`/${userId}/cart/${productId}`, {
                    data: { selectedSize } // Must be supported by backend
                });
                this.showToast('Product removed from cart', 'info');
                this.props.fetchCart(userId);
            } catch (err) {
                this.showToast(err?.response?.data?.message, 'error');
                console.error(err);
            }
            return;
        }

        try {
            await this.props.updateCartQuantity(productId, newQty, selectedSize);
            this.showToast('Quantity updated');
        } catch (err) {
            this.showToast(err?.response?.data?.message, 'error');
        }
    };

    render() {
        const { product, cartProducts, selectedSize } = this.props;
        const { cartAnimatingIds } = this.state;

        const cartItem = cartProducts.find(item =>
            item.product._id === product._id &&
            item.selectedSize === product.selectedSize
        );

        const maxQty = Math.min(product.stock, 10);

        return (
            <>
                {cartItem ? (
                    <div className="quantity-control">
                        <span
                            className="icon"
                            onClick={() => this.handleQuantityChange(product._id, cartItem.quantity - 1, selectedSize)}
                        >
                            <FaMinus />
                        </span>

                        <span className="qty">{cartItem.quantity}</span>

                        <span
                            className={`icon ${cartItem.quantity >= maxQty ? 'disabled' : ''}`}
                            onClick={() => {
                                if (cartItem.quantity < maxQty) {
                                    this.handleQuantityChange(product._id, cartItem.quantity + 1, product.selectedSize);
                                } else {
                                    this.showToast(`Only ${product.stock} in stock`, 'info');
                                }
                            }}
                        >
                            <FaPlus />
                        </span>
                    </div>
                ) : (
                    <button
                        className={`add-cart-btn ${product.stock < 1 ? 'disabled' : ''}`}
                        onClick={() => this.handleAddToCart(product)}
                        disabled={cartAnimatingIds.includes(product._id) || product.stock < 1}
                    >
                        {cartAnimatingIds.includes(product._id) ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                <FaShoppingCart /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </>
                        )}
                    </button>
                )}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    cartProducts: state.products.cart,
});

export default connect(mapStateToProps, { addToCart, updateCartQuantity, fetchCart })(ProductCard);
