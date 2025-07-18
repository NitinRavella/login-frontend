import React, { Component } from 'react';
import {
    Card, CardBody, CardTitle, Button, Row, Col, Input, CardImg,
    Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { IoMdClose } from 'react-icons/io';
import api from '../utils/Api';
import { notifyError, notifySuccess } from '../utils/toastUtils';

class DeletedProducts extends Component {
    state = {
        deletedProducts: this.props.deletedProducts || [],
        loading: false,
        searchTerm: '',
        restoreModal: false,
        selectedProduct: null,
        restoreStock: 1
    };

    openRestoreModal = (product) => {
        this.setState({ restoreModal: true, selectedProduct: product, restoreStock: 1 });
    };

    closeRestoreModal = () => {
        this.setState({ restoreModal: false, selectedProduct: null, restoreStock: 1 });
    };

    handleRestore = async () => {
        const { selectedProduct, restoreStock } = this.state;
        if (!selectedProduct) return;

        try {
            await api.patch(`/products/${selectedProduct._id}/restore`, {
                stock: parseInt(restoreStock)
            });

            this.setState(prev => ({
                deletedProducts: prev.deletedProducts.filter(p => p._id !== selectedProduct._id),
                restoreModal: false,
                selectedProduct: null,
                restoreStock: 1
            }), () => {
                if (this.props.onRefresh) this.props.onRefresh();
            });
            notifySuccess('Product Restore')
        } catch (error) {
            console.error('Failed to restore product:', error);
            notifyError('Failed to restore product')
        }
    };

    render() {
        const {
            deletedProducts,
            loading,
            searchTerm,
            restoreModal,
            selectedProduct,
            restoreStock
        } = this.state;

        const { onRefresh } = this.props;

        const filtered = deletedProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="container mt-4">
                <Row>
                    <Col>
                        <h3 className='text-start'>Deleted Products</h3>
                    </Col>
                    <Col className="text-end">
                        {onRefresh && (
                            <Button color="warning" onClick={onRefresh}>
                                <IoMdClose />
                            </Button>
                        )}
                    </Col>
                </Row>

                <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={e => this.setState({ searchTerm: e.target.value })}
                    className="mb-4"
                />

                {loading ? (
                    <p>Loading...</p>
                ) : filtered.length === 0 ? (
                    <p>No deleted products found.</p>
                ) : (
                    <Row>
                        {filtered.map(product => {
                            const firstVariant = product.variants?.[0];
                            const thumbnail = firstVariant?.images?.[0] || '';
                            const ram = firstVariant?.ram;
                            const rom = firstVariant?.rom;
                            const price = firstVariant?.pricing?.offerPrice || firstVariant?.pricing?.price;

                            return (
                                <Col md="4" key={product._id} className="mb-4">
                                    <Card className="h-100 border-danger">
                                        <CardImg
                                            top
                                            src={thumbnail}
                                            alt={product.name}
                                            style={{ objectFit: 'cover', height: '200px' }}
                                        />
                                        <CardBody>
                                            <CardTitle className="fw-bold">{product.name}</CardTitle>
                                            <p className="text-muted mb-1">{product.category}</p>
                                            {ram && rom && (
                                                <p className="mb-1">{ram} / {rom}</p>
                                            )}
                                            {price && (
                                                <p className="text-success fw-bold mb-2">₹{price}</p>
                                            )}
                                            <Button
                                                color="success"
                                                size="sm"
                                                onClick={() => this.openRestoreModal(product)}
                                            >
                                                Restore
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}

                {/* Modal */}
                <Modal isOpen={restoreModal} toggle={this.closeRestoreModal}>
                    <ModalHeader toggle={this.closeRestoreModal}>Restore Product</ModalHeader>
                    <ModalBody>
                        {selectedProduct && (
                            <>
                                <p>
                                    Are you sure you want to restore <strong>{selectedProduct.name}</strong>?
                                </p>
                                <Input
                                    type="number"
                                    min="1"
                                    value={restoreStock}
                                    onChange={e => this.setState({ restoreStock: e.target.value })}
                                    placeholder="Initial stock (default 1)"
                                />
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="success" onClick={this.handleRestore}>Confirm</Button>
                        <Button color="secondary" onClick={this.closeRestoreModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default DeletedProducts;
