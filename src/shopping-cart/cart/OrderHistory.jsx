import React, { Component } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Input, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { FaEye, FaFileInvoice, FaSyncAlt, FaBan, FaTimes, FaTable, FaCreditCard } from 'react-icons/fa';
import api from '../utils/Api';
import withRouter from '../components/WithRoute';
import { notifyError, notifySuccess } from '../utils/toastUtils';
import { API_URL } from '../services/ServiceConstants';
import TrackOrderStatus from '../utils/TrackOrderStatus';
import '../../styles/OrderHistory.css';

class OrderHistory extends Component {
    state = {
        orders: [],
        filteredOrders: [],
        loading: true,
        showModal: false,
        cancelType: null,
        cancelOrderId: null,
        cancelProductId: null,
        activeFilter: 'All',
        currentPage: 1,
        ordersPerPage: 5,
        searchQuery: '',
        dateFilter: 'All'
    };

    componentDidMount() {
        this.fetchOrders();
    }

    fetchOrders = async () => {
        const userId = sessionStorage.getItem('userId');
        try {
            const res = await api.get(`/${userId}/orders`);
            this.setState({
                orders: res.data.orders,
                filteredOrders: res.data.orders,
                loading: false
            }, this.applyFilters);
        } catch {
            notifyError('Failed to fetch orders');
            this.setState({ loading: false });
        }
    };

    handleFilterChange = (status) => {
        this.setState({ activeFilter: status }, this.applyFilters);
    };

    handleSearchChange = (e) => {
        this.setState({ searchQuery: e.target.value }, this.applyFilters);
    };

    handleDateChange = (e) => {
        this.setState({ dateFilter: e.target.value }, this.applyFilters);
    };

    applyFilters = () => {
        const { orders, activeFilter, searchQuery, dateFilter } = this.state;
        const filtered = orders.filter(order => {
            const matchesStatus = activeFilter === 'All' || order.status.toLowerCase() === activeFilter.toLowerCase();
            const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase());
            const orderDate = new Date(order.placedAt);
            const now = new Date();
            let matchesDate = true;

            if (dateFilter === '7') matchesDate = orderDate >= new Date(now - 7 * 86400000);
            else if (dateFilter === '15') matchesDate = orderDate >= new Date(now - 15 * 86400000);
            else if (dateFilter === '30') matchesDate = orderDate >= new Date(now - 30 * 86400000);

            return matchesStatus && matchesSearch && matchesDate;
        });

        this.setState({ filteredOrders: filtered, currentPage: 1 });
    };

    canCancel(status) {
        return ['placed', 'confirmed'].includes(status.toLowerCase());
    }

    getPaginatedOrders = () => {
        const { filteredOrders, currentPage, ordersPerPage } = this.state;
        const startIndex = (currentPage - 1) * ordersPerPage;
        return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
    };

    changePage = (page) => this.setState({ currentPage: page });

    renderPagination = () => {
        const { filteredOrders, ordersPerPage, currentPage } = this.state;
        const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
        if (totalPages <= 1) return null;

        return (
            <div className="mt-4 d-flex justify-content-center">
                <Pagination className="mb-0 shadow-sm">
                    <PaginationItem disabled={currentPage === 1}>
                        <PaginationLink previous onClick={() => this.changePage(currentPage - 1)} />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i} active={i + 1 === currentPage}>
                            <PaginationLink onClick={() => this.changePage(i + 1)}>
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage === totalPages}>
                        <PaginationLink next onClick={() => this.changePage(currentPage + 1)} />
                    </PaginationItem>
                </Pagination>
            </div>
        );
    };

    openCancelModal = (type, orderId, productId = null) => {
        this.setState({ showModal: true, cancelType: type, cancelOrderId: orderId, cancelProductId: productId });
    };

    closeModal = () => this.setState({ showModal: false });

    confirmCancel = () => {
        const { cancelType, cancelOrderId, cancelProductId } = this.state;
        if (cancelType === 'order') this.handleCancelOrder(cancelOrderId);
        else if (cancelType === 'product') this.handleCancelProduct(cancelOrderId, cancelProductId);
        this.closeModal();
    };

    handleCancelOrder = async (orderId) => {
        try {
            const res = await api.put(`/orders/${orderId}/cancel`);
            if (res.data.success) {
                notifySuccess('Order cancelled successfully');
                this.fetchOrders();
            }
        } catch {
            notifyError('Failed to cancel order');
        }
    };

    handleCancelProduct = async (orderId, productId) => {
        try {
            const res = await api.put(`/orders/${orderId}/cancel-product/${productId}`);
            if (res.data.success) {
                notifySuccess('Product cancelled successfully');
                this.fetchOrders();
            }
        } catch {
            notifyError('Failed to cancel product');
        }
    };

    downloadInvoice = (id) => {
        window.open(`${API_URL}/orders/${id}/invoice`, '_blank');
    };

    render() {
        const {
            loading, searchQuery, dateFilter, activeFilter, showModal, cancelType
        } = this.state;

        const paginatedOrders = this.getPaginatedOrders();

        if (loading) return <Container className="text-center mt-5"><Spinner /></Container>;

        return (
            <Container className="mt-4">
                <h4 className="mb-4">My Orders</h4>

                <Row className="mb-3 g-3">
                    <Col md="3">
                        <Input
                            type="text"
                            placeholder="Search by Order ID"
                            value={searchQuery}
                            onChange={this.handleSearchChange}
                        />
                    </Col>
                    <Col md="3">
                        <Input type="select" value={dateFilter} onChange={this.handleDateChange}>
                            <option value="All">All Dates</option>
                            <option value="7">Last 7 days</option>
                            <option value="15">Last 15 days</option>
                            <option value="30">Last 30 days</option>
                        </Input>
                    </Col>
                    <Col className="d-flex flex-wrap gap-2 align-items-center">
                        {['All', 'Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
                            <Button
                                key={status}
                                color={activeFilter === status ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => this.handleFilterChange(status)}
                            >
                                {status}
                            </Button>
                        ))}
                    </Col>

                </Row>


                {paginatedOrders.map(order => (
                    <Card key={order._id} className="order-history-card mb-4 p-3 shadow-sm border">
                        <Row className="d-flex justify-content-between flex-wrap mb-3">
                            <Col>
                                <div className="fw-semibold">Order ID: {order._id}</div>
                                <small className="text-muted">Placed on {new Date(order.placedAt).toLocaleDateString()}</small>
                            </Col>
                            <Col className='text-end'>
                                <div className="track-status-scroll">
                                    <div className="track-status-container">
                                        <TrackOrderStatus status={order.status} isCancelled={order.status === 'Cancelled'} />
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {order.items.map(({ product, variant, quantity, cancelled }) => (
                            <Row key={variant.variantId} className="mb-3 border-top pt-3">
                                <Col md="2" xs="4">
                                    <img src={variant.images?.[0]} alt={product?.name} className="img-fluid rounded" style={{ maxHeight: 80 }} />
                                </Col>
                                <Col md="7" xs="8">
                                    <div className="fw-bold">{product?.name}</div>
                                    <div className="text-muted small">
                                        Color: {variant.color}
                                        {variant.ram && `, RAM: ${variant.ram}`}
                                        {variant.rom && `, ROM: ${variant.rom}`}
                                        {variant.size && `, Size: ${variant.size}`}
                                    </div>
                                    <div className="text-muted small">Qty: {quantity}</div>
                                    <div className="fw-semibold mt-1">
                                        ₹{Number(variant.offerPrice || variant.price).toLocaleString()}
                                    </div>
                                    {cancelled && <div className="text-danger small mt-1">Cancelled</div>}
                                </Col>
                                <Col md="3" className="text-md-end mt-2">
                                    {!cancelled && this.canCancel(order.status) && (
                                        <Button
                                            size="sm"
                                            color="danger"
                                            outline
                                            onClick={() => this.openCancelModal('product', order._id, product?._id)}
                                        >
                                            <FaTimes className="me-1" /> Cancel
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        ))}

                        <Row className="order-summary mt-3 pt-3 border-top">
                            <Col xs="12">
                                <div className="order-summary-content d-flex flex-column flex-md-row justify-content-between align-items-start gap-4">
                                    <div className="order-address">
                                        <div className="text-muted small fw-semibold mb-1">📍 Deliver to:</div>
                                        <div>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
                                        <div>📞 {order.shippingAddress.phone}</div>
                                    </div>
                                    <div className="order-pricing-box text-md-end">
                                        <div className="text-muted small fw-semibold mb-2 d-flex align-items-center gap-1 justify-content-md-end justify-content-start">
                                            <FaTable className="text-secondary" /> Price Summary:
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Items Price:</span>
                                            <span className="fw-semibold">₹{order.summary.itemsPrice}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Discount:</span>
                                            <span className="text-success">- ₹{order.summary.discount}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                                            <strong>Total:</strong>
                                            <strong>₹{order.summary.totalAmount}</strong>
                                        </div>

                                        <div className="mt-3 text-muted small">
                                            <FaCreditCard className="me-1 text-dark" />
                                            <strong>Payment:</strong> {order.paymentInfo?.method || 'N/A'} - {order.paymentInfo?.status}
                                            {order.paymentInfo?.transactionId && (
                                                <div className="text-wrap small text-secondary">Txn: {order.paymentInfo.transactionId}</div>
                                            )}
                                            {order.refunds?.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-muted small mb-1 fw-semibold">🔁 Refund Status:</div>
                                                    {order.refunds.map(refund => (
                                                        <div key={refund.refundId} className="small">
                                                            ₹{(refund.amount / 100).toFixed(2)} - {refund.reason}
                                                            <span className={`ms-2 badge bg-${refund.status === 'processed' ? 'success' : refund.status === 'failed' ? 'danger' : 'warning'}`}>
                                                                {refund.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="order-action-buttons mt-3 d-flex flex-wrap gap-2 justify-content-md-end justify-content-start">
                                            <Button color="outline-primary" size="sm" className="rounded-pill shadow-sm px-3" onClick={() => this.props.navigate(`/order/${order._id}`)}>
                                                <FaEye className="me-1" /> View Details
                                            </Button>
                                            <Button color="outline-dark" size="sm" className="rounded-pill shadow-sm px-3" onClick={() => this.downloadInvoice(order._id)}>
                                                <FaFileInvoice className="me-1" /> Invoice
                                            </Button>
                                            <Button color="outline-warning" size="sm" className="rounded-pill shadow-sm px-3" onClick={() => this.handleReorder(order._id)}>
                                                <FaSyncAlt className="me-1" /> Reorder
                                            </Button>
                                            {this.canCancel(order.status) && (
                                                <Button color="outline-danger" size="sm" className="rounded-pill shadow-sm px-3" onClick={() => this.openCancelModal('order', order._id)}>
                                                    <FaBan className="me-1" /> Cancel Order
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                ))}
                {paginatedOrders.length === 0 && (
                    <div className="text-center mt-4">
                        <h5>No orders found</h5>
                    </div>
                )}
                {this.renderPagination()}

                <Modal isOpen={showModal} toggle={this.closeModal}>
                    <ModalHeader toggle={this.closeModal}>Confirm Cancellation</ModalHeader>
                    <ModalBody>Are you sure you want to cancel this {cancelType === 'order' ? 'order' : 'product'}?</ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={this.confirmCancel}>Yes, Cancel</Button>
                        <Button color="secondary" onClick={this.closeModal}>No</Button>
                    </ModalFooter>
                </Modal>
            </Container>
        );
    }
}

export default withRouter(OrderHistory);
