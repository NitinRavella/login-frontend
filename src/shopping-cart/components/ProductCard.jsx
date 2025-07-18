import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spinner } from 'reactstrap';
import { FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { addToCart, updateCartQuantity, fetchCart } from '../../redux/actions/productActions';
import api from '../utils/Api';
import '../../styles/ProductCard.css';
import { notifyError, notifySuccess, notifyWarning, notifyInfo } from '../utils/toastUtils';

class ProductCard extends Component {
    state = {
        cartAnimatingIds: []
    };

    handleAddToCart = (product) => {
        const { cartAnimatingIds } = this.state;
        const { selectedSize, selectedColor, selectedRam, selectedRom, stock, variant } = this.props;

        const userID = sessionStorage.getItem('userId');
        if (!userID) {
            notifyError('Please login to add to cart');
            return;
        }

        const isFashion = product.category === 'clothing' || product.category === 'shoes';

        // Validation: Ensure selections and stock
        if (isFashion) {
            if (!selectedSize) {
                notifyWarning('Please select a size');
                return;
            }

            const sizeObj = variant?.sizeStock?.find(s => s.size === selectedSize);
            if (!sizeObj || sizeObj.stock < 1) {
                notifyInfo('Selected size is out of stock');
                return;
            }
        } else {
            if (!selectedRam || !selectedRom) {
                notifyWarning('Please select RAM and ROM');
                return;
            }

            if (!stock || stock < 1) {
                notifyInfo('Selected variant is out of stock');
                return;
            }
        }

        if (cartAnimatingIds.includes(product._id)) return;

        this.setState(prev => ({
            cartAnimatingIds: [...prev.cartAnimatingIds, product._id]
        }));

        this.props.addToCart({
            productID: product._id,
            selectedSize: isFashion ? selectedSize : null,
            selectedColor,
            selectedRam: isFashion ? null : selectedRam,
            selectedRom: isFashion ? null : selectedRom,
            quantity: 1
        })
            .then(() => notifySuccess('Added to cart!'))
            .catch(err => notifyError(err?.response?.data?.message || 'Failed to add to cart'))
            .finally(() => {
                setTimeout(() => {
                    this.setState(prev => ({
                        cartAnimatingIds: prev.cartAnimatingIds.filter(id => id !== product._id)
                    }));
                }, 1000);
            });
    };

    handleQuantityChange = async (productId, newQty, selectedSize, selectedColor, selectedRam, selectedRom, variantId) => {
        const userId = sessionStorage.getItem('userId');

        if (!userId) {
            notifyError('You must be logged in');
            return;
        }
        if (newQty < 1) {
            try {
                await api.delete(`/${userId}/cart/${productId}`, {
                    data: { variantId, selectedSize, selectedColor, selectedRam, selectedRom }
                });
                notifyInfo('Product removed from cart');
                this.props.fetchCart(userId);
            } catch (err) {
                notifyError(err?.response?.data?.message);
            }
            return;
        }

        try {
            await this.props.updateCartQuantity(
                productId,
                newQty,
                selectedSize,
                selectedColor,
                selectedRam,
                selectedRom
            );
            notifySuccess('Quantity updated');
        } catch (err) {
            notifyError(err?.response?.data?.message);
        }
    };

    render() {
        const { product, variant, selectedSize, selectedRam, selectedRom, selectedColor, stock, cartProducts } = this.props;

        const { cartAnimatingIds } = this.state;

        const isFashion = product.category === 'clothing' || product.category === 'shoes';
        const sizeObj = variant?.sizeStock?.find(s => s.size === selectedSize);
        const currentStock = isFashion ? (sizeObj?.stock || 0) : (stock || 0);
        const maxQty = Math.min(currentStock, 10);
        const inStock = currentStock > 0;

        const cartItem = cartProducts?.find(item =>
            item.product &&
            item.product._id === product._id &&
            item.variantId === variant?.variantId &&
            item.selectedColor === selectedColor &&
            (isFashion
                ? item.selectedSize === selectedSize
                : item.selectedRam === selectedRam && item.selectedRom === selectedRom)
        );

        const hasSelectedRequiredOptions = isFashion
            ? selectedSize
            : selectedRam && selectedRom;

        const shouldShowOutOfStock = hasSelectedRequiredOptions && !inStock;
        const isAddDisabled = cartAnimatingIds.includes(product._id) || shouldShowOutOfStock;
        return (
            <>
                {cartItem ? (
                    <div className="quantity-control">
                        <span
                            className="icon"
                            onClick={() =>
                                this.handleQuantityChange(
                                    product._id,
                                    cartItem.quantity - 1,
                                    selectedSize,
                                    selectedColor,
                                    selectedRam,
                                    selectedRom,
                                )
                            }
                        >
                            <FaMinus />
                        </span>

                        <span className="qty">{cartItem.quantity}</span>

                        <span
                            className={`icon ${cartItem.quantity >= maxQty ? 'disabled' : ''}`}
                            onClick={() => {
                                if (cartItem.quantity < maxQty) {
                                    this.handleQuantityChange(
                                        product._id,
                                        cartItem.quantity + 1,
                                        selectedSize,
                                        selectedColor,
                                        selectedRam,
                                        selectedRom,
                                    );
                                } else {
                                    notifyInfo(`Only ${currentStock} in stock`);
                                }
                            }}
                        >
                            <FaPlus />
                        </span>
                    </div>
                ) : (
                    <button
                        className={`add-cart-btn ${shouldShowOutOfStock ? 'disabled' : ''}`}
                        onClick={() => this.handleAddToCart(product)}
                        disabled={isAddDisabled}
                    >
                        {cartAnimatingIds.includes(product._id) ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                <FaShoppingCart />{" "}
                                {shouldShowOutOfStock ? 'Out of Stock' : 'Add to Cart'}
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

export default connect(mapStateToProps, {
    addToCart,
    updateCartQuantity,
    fetchCart
})(ProductCard);
