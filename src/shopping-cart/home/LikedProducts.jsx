import React, { Component } from 'react';
import {
    Row, Col, Spinner, Container, Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input
} from 'reactstrap';
import api from '../utils/Api';
import { connect } from 'react-redux';
import { addToCart, fetchCart } from '../../redux/actions/productActions';
import withRouter from '../components/WithRoute';
import WishlistProductCard from './WishlistCard';
import '../../styles/Wishlist.css';


class LikedProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            likedProducts: [],
            loading: true,
            modalOpen: false,
            selectedProduct: null,
            selectedVariant: null,
            selectedSize: '',
            selectedColor: '',
            selectedRam: '',
            selectedRom: ''
        };
    }

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
            const res = await api.get(`/wishlist/${userId}`);
            this.setState({ likedProducts: res.data.wishlist || [], loading: false });
        } catch (error) {
            console.error('Failed to fetch liked products:', error);
            this.setState({ loading: false });
        }
    };

    handleRemoveFromWishlist = async (productId, variantId) => {
        const userId = sessionStorage.getItem('userId');
        try {
            await api.delete(`/wishlist/remove/${userId}/${productId}`, {
                data: { variantId }
            });
            this.fetchLikedProducts()
            this.setState(prevState => ({
                likedProducts: prevState.likedProducts.filter(
                    item => !(item.productId._id === productId && item.variantId === variantId)
                )
            }));
        } catch (err) {
            console.error('Failed to remove liked product:', err);
        }
    };

    handleNavigateToProduct = (product, variant) => {
        const { variantId, color, ram, rom, sizeStock } = variant;

        const routeState = {
            selectedColor: color || '',
            selectedRam: ram || '',
            selectedRom: rom || '',
            selectedSize: sizeStock?.[0]?.size || '',
        };

        this.props.navigate(`/product/${product}`, {
            state: routeState
        });
    };

    handleMoveToBag = (product, variant) => {
        this.setState({
            selectedProduct: product,
            selectedVariant: variant,
            selectedColor: variant.color || '',
            selectedSize: variant.sizeStock?.[0]?.size || '',
            selectedRam: variant.ram || '',
            selectedRom: variant.rom || '',
            modalOpen: true
        });
    };

    handleReduxAddToCart = async () => {
        const { selectedProduct, selectedVariant, selectedSize, selectedColor, selectedRam, selectedRom, } = this.state;
        const isFashion = selectedProduct.category === 'clothing' || selectedProduct.category === 'shoes';
        const userId = sessionStorage.getItem('userId');
        // Basic validation
        if (isFashion) {
            if (!selectedSize) {
                alert('Please select a size');
                return;
            }

            const sizeObj = selectedVariant.sizeStock?.find(s => s.size === selectedSize);
            if (!sizeObj || sizeObj.stock < 1) {
                alert('Selected size is out of stock');
                return;
            }
        } else {
            if (!selectedRam || !selectedRom) {
                alert('Please select RAM and ROM');
                return;
            }

            if (!selectedVariant.stock || selectedVariant.stock < 1) {
                alert('Selected variant is out of stock');
                return;
            }
        }
        try {
            await this.props.addToCart({
                productID: selectedProduct.productId,
                selectedSize: isFashion ? selectedSize : null,
                selectedColor,
                selectedRam: isFashion ? null : selectedRam,
                selectedRom: isFashion ? null : selectedRom,
                quantity: 1
            });

            if (userId) {
                await this.props.fetchCart(userId);
            }

            // Remove from wishlist like Myntra
            await this.handleRemoveFromWishlist(selectedProduct.productId, selectedVariant.variantId);

            // Close modal
            this.setState({ modalOpen: false });
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert(err?.response?.data?.message || 'Failed to add to cart');
        }
    };


    renderModal = () => {
        const {
            modalOpen, selectedVariant, selectedProduct,
            selectedSize, selectedColor, selectedRam, selectedRom
        } = this.state;

        if (!selectedVariant || !selectedProduct) return null;

        const isClothing = selectedVariant?.sizeStock?.length > 0;
        const isElectronics = selectedVariant?.ram && selectedVariant?.rom;

        return (
            <Modal isOpen={modalOpen} toggle={() => this.setState({ modalOpen: false })} centered>
                <ModalHeader toggle={() => this.setState({ modalOpen: false })}>
                    Move to Bag
                </ModalHeader>
                <ModalBody className="move-to-bag-modal">
                    <div className="modal-product">
                        <img src={selectedVariant?.images?.[0]} alt="" className="modal-image" />
                        <div>
                            <h6>{selectedProduct?.name}</h6>
                            <p className="text-muted m-0">{selectedVariant?.color}</p>
                            <p className="text-success fw-bold">
                                ₹{selectedVariant?.pricing?.offerPrice || selectedVariant?.pricing?.price}
                            </p>
                        </div>
                    </div>

                    {isClothing && (
                        <div className="size-options mt-3">
                            <Label>Select Size</Label>
                            <div className="size-list">
                                {selectedVariant.sizeStock.map(({ size, stock }) => (
                                    <div
                                        key={size}
                                        className={`size-option ${selectedSize === size ? 'active' : ''} ${stock === 0 ? 'disabled' : ''}`}
                                        onClick={() => stock > 0 && this.setState({ selectedSize: size })}
                                    >
                                        {size}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isElectronics && (
                        <>
                            <FormGroup className="mt-3">
                                <Label>RAM</Label>
                                <Input
                                    type="select"
                                    value={selectedRam}
                                    onChange={(e) => this.setState({ selectedRam: e.target.value })}
                                >
                                    <option value="">Select RAM</option>
                                    <option value={selectedVariant.ram}>{selectedVariant.ram}</option>
                                </Input>
                            </FormGroup>

                            <FormGroup>
                                <Label>ROM</Label>
                                <Input
                                    type="select"
                                    value={selectedRom}
                                    onChange={(e) => this.setState({ selectedRom: e.target.value })}
                                >
                                    <option value="">Select ROM</option>
                                    <option value={selectedVariant.rom}>{selectedVariant.rom}</option>
                                </Input>
                            </FormGroup>

                            <FormGroup>
                                <Label>Color</Label>
                                <Input
                                    type="select"
                                    value={selectedColor}
                                    onChange={(e) => this.setState({ selectedColor: e.target.value })}
                                >
                                    <option value="">Select Color</option>
                                    <option value={selectedVariant.color}>{selectedVariant.color}</option>
                                </Input>
                            </FormGroup>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        onClick={this.handleReduxAddToCart}
                        disabled={
                            (isClothing && !selectedSize) ||
                            (isElectronics && (!selectedRam || !selectedRom || !selectedColor))
                        }
                    >
                        Add to Bag
                    </Button>
                    <Button color="secondary" onClick={() => this.setState({ modalOpen: false })}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        );
    };

    render() {
        const { likedProducts, loading } = this.state;

        return (
            <Container className="my-5">
                <div className="text-center mb-5">
                    <h2 className="wishlist-header-title">
                        <span role="img" aria-label="heart" className="wishlist-heart">❤️</span>
                        <span className="wishlist-title-text">Your Liked Products</span>
                    </h2>
                    <div className="wishlist-underline"></div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : likedProducts.length === 0 ? (
                    <div className="text-center text-muted">No liked products yet.</div>
                ) : (
                    <Row xs="2" sm="3" md="4" lg="5" className="g-3">
                        {likedProducts.map((item) => {
                            const product = item.productId;
                            const { variantId, variant } = item;
                            return (
                                <Col key={variantId}>
                                    <WishlistProductCard
                                        product={item}
                                        variant={variant}
                                        variantId={variantId}
                                        onClick={() => this.handleNavigateToProduct(product, variant)}
                                        onRemove={() => this.handleRemoveFromWishlist(product._id, variantId)}
                                        onMoveToBag={() => this.handleMoveToBag(item, variant)}
                                    />
                                </Col>
                            );
                        })}

                    </Row>
                )}
                {this.renderModal()}
            </Container>
        );
    }
}

export default connect(null, { addToCart, fetchCart })(withRouter(LikedProducts));
