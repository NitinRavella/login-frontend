import React, { Component } from 'react';
import {
    Container, Card, CardBody, Row, Col, Badge, Button, Input, Spinner, Pagination, PaginationItem, PaginationLink, FormGroup, Label, Modal, ModalBody, ModalHeader
} from 'reactstrap';
import { FaPrint, FaTable, FaThLarge } from 'react-icons/fa';
import api from '../utils/Api';
import '../../styles/AdminOrderCards.css';
import { notifyError } from '../utils/toastUtils';
import PackingSlip from './packingSlip';
import AdminOrderTable from './AdminOrderTable';
import Tooltip from '../utils/Tooltip';

class AdminOrderCards extends Component {
    state = {
        orders: [],
        filteredOrders: [],
        loading: true,
        updatingId: '',
        searchQuery: '',
        statusFilter: 'All',
        dateFrom: '',
        dateTo: '',
        currentPage: 1,
        ordersPerPage: 3,
        showPackingSlip: false,
        selectedOrder: null,
        viewMode: 'card',
    };

    componentDidMount() {
        this.fetchOrders();
    }

    fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            const sorted = res.data.orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
            this.setState({
                orders: sorted,
                filteredOrders: sorted,
                loading: false
            });
        } catch {
            notifyError('Failed to fetch orders');
            this.setState({ loading: false });
        }
    };

    handleStatusChange = async (orderId, newStatus) => {
        this.setState({ updatingId: orderId });
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            this.fetchOrders();
        } catch {
            notifyError('Failed to update status');
        } finally {
            this.setState({ updatingId: '' });
        }
    };

    handleSearchAndFilter = () => {
        const { orders, searchQuery, statusFilter, dateFrom, dateTo } = this.state;
        let filtered = [...orders];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                order._id.toLowerCase().includes(q) ||
                order.userId.fullName.toLowerCase().includes(q) ||
                order.userId.email.toLowerCase().includes(q)
            );
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            filtered = filtered.filter(order => new Date(order.placedAt) >= from);
        }

        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(order => new Date(order.placedAt) <= to);
        }

        this.setState({ filteredOrders: filtered, currentPage: 1 });
    };

    changePage = (page) => {
        this.setState({ currentPage: page });
    };

    renderPagination = () => {
        const { filteredOrders, ordersPerPage, currentPage } = this.state;
        const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
        if (totalPages <= 1) return null;

        return (
            <Pagination className="justify-content-center">
                <PaginationItem disabled={currentPage <= 1}>
                    <PaginationLink previous onClick={() => this.changePage(currentPage - 1)} />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem active={i + 1 === currentPage} key={i}>
                        <PaginationLink onClick={() => this.changePage(i + 1)}>{i + 1}</PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem disabled={currentPage >= totalPages}>
                    <PaginationLink next onClick={() => this.changePage(currentPage + 1)} />
                </PaginationItem>
            </Pagination>
        );
    };

    togglePackingSlip = (order = null) => {
        this.setState({
            showPackingSlip: !this.state.showPackingSlip,
            selectedOrder: order,
        });
    };

    clearFilters = () => {
        this.setState({
            searchQuery: '',
            statusFilter: 'All',
            dateFrom: '',
            dateTo: '',
            currentPage: 1,
        }, this.handleSearchAndFilter);
    };

    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'placed': return 'secondary';
            case 'confirmed': return 'primary';
            case 'shipped': return 'info';
            case 'out for delivery': return 'warning';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'dark';
        }
    }

    render() {
        const {
            filteredOrders, loading, updatingId, statusFilter, searchQuery,
            dateFrom, dateTo, currentPage, ordersPerPage, showPackingSlip, selectedOrder, viewMode
        } = this.state;

        const statusOptions = ['All', 'Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
        const today = new Date().toISOString().split('T')[0];
        const paginated = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

        if (loading) return <div className="text-center mt-5"><Spinner /></div>;

        return (
            <Container className="admin-order-container mt-4">
                <h4 className="mb-4">📦 Admin Packing Orders</h4>
                <Row className="mb-4 g-3 align-items-end">
                    <Col md="3">
                        <Label>Search</Label>
                        <Input
                            type="text"
                            placeholder="Order ID, Name, Email"
                            value={searchQuery}
                            onChange={(e) =>
                                this.setState({ searchQuery: e.target.value }, this.handleSearchAndFilter)
                            }
                        />
                    </Col>
                    <Col md="2">
                        <Label>Status</Label>
                        <Input
                            type="select"
                            value={statusFilter}
                            onChange={(e) =>
                                this.setState({ statusFilter: e.target.value }, this.handleSearchAndFilter)
                            }
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </Input>
                    </Col>
                    <Col md="2">
                        <Label>From Date</Label>
                        <Input
                            type="date"
                            max={today}
                            value={dateFrom}
                            onChange={(e) =>
                                this.setState({ dateFrom: e.target.value }, this.handleSearchAndFilter)
                            }
                        />
                    </Col>
                    <Col md="2">
                        <Label>To Date</Label>
                        <Input
                            type="date"
                            max={today}
                            value={dateTo}
                            onChange={(e) =>
                                this.setState({ dateTo: e.target.value }, this.handleSearchAndFilter)
                            }
                        />
                    </Col>

                    <Col md="3" className="d-flex justify-content-between">
                        <Button
                            color="outline-secondary"
                            disabled={
                                !searchQuery && statusFilter === 'All' && !dateFrom && !dateTo
                            }
                            onClick={this.clearFilters}
                        >
                            Clear Filters
                        </Button>

                        <div className="ms-auto">
                            <Tooltip
                                content={
                                    viewMode === 'card'
                                        ? 'Switch to Table View'
                                        : 'Switch to Card View'
                                }
                            >
                                <Button
                                    id="toggleViewBtn"
                                    color={viewMode === 'card' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() =>
                                        this.setState({
                                            viewMode: viewMode === 'card' ? 'table' : 'card',
                                        })
                                    }
                                >
                                    {viewMode === 'card' ? <FaTable /> : <FaThLarge />}
                                </Button>
                            </Tooltip>
                        </div>
                    </Col>
                </Row>
                {viewMode === 'card' ? (paginated.map(order => (
                    <Card className="order-card shadow-sm mb-4" key={order._id}>
                        <CardBody>
                            <div className="d-flex justify-content-between flex-wrap align-items-start mb-2">
                                <div>
                                    <strong>Order ID:</strong> {order._id}
                                    <div className="text-muted small">Placed: {new Date(order.placedAt).toLocaleString()}</div>
                                    <div className="text-muted small">👤 {order.userId.fullName} ({order.userId.email})</div>
                                </div>
                                <Col className='text-end'>
                                    <Badge color={this.getStatusColor(order.status)} pill>{order.status}</Badge>
                                </Col>
                            </div>

                            {order.items.map(item => (
                                <Row className="align-items-center border-top pt-3" key={item._id}>
                                    <Col xs="3" md="2">
                                        <img src={item.images?.[0]} alt={item.name} className="img-fluid rounded product-thumb" />
                                    </Col>
                                    <Col xs="9" md="10">
                                        <div className="fw-semibold">{item.name}</div>
                                        <div className="text-muted small">
                                            Color: {item.selectedColor}
                                            {item.selectedRam && `, RAM: ${item.selectedRam}`}
                                            {item.selectedRom && `, ROM: ${item.selectedRom}`}
                                            {item.selectedSize && `, Size: ${item.selectedSize}`}
                                        </div>
                                        <div className="text-muted small">Qty: {item.quantity}</div>
                                        {item.cancelled && <div className="text-danger small">❌ Cancelled</div>}
                                    </Col>
                                </Row>
                            ))}

                            <Row className="mt-4">
                                <Col md="6">
                                    <div className="text-muted small">📍 Address:</div>
                                    <div>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
                                    <div>📞 {order.shippingAddress.phone}</div>
                                </Col>
                                <Col md="6" className="text-md-end">
                                    <div>🧮 Items: ₹{order.summary.itemsPrice}</div>
                                    <div>Discount: ₹{order.summary.discount}</div>
                                    <div className="fw-bold">Total: ₹{order.summary.totalAmount}</div>
                                </Col>
                            </Row>

                            <Row className="mt-3 align-items-center">
                                <Col md="6" className="mt-2">
                                    <FormGroup className="d-flex gap-2 align-items-center">
                                        <label>Status:</label>
                                        <Input
                                            type="select"
                                            value={order.status}
                                            onChange={e => this.handleStatusChange(order._id, e.target.value)}
                                            disabled={['Delivered', 'Cancelled'].includes(order.status)}
                                            style={{ maxWidth: 180 }}
                                        >
                                            {statusOptions.filter(s => s !== 'All').map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </Input>
                                        {updatingId === order._id && <Spinner size="sm" />}
                                    </FormGroup>
                                </Col>
                                <Col md="6" className="text-md-end mt-2">
                                    <Button size="sm" color="primary" onClick={() => this.togglePackingSlip(order)}>
                                        <FaPrint className="me-1" /> Packing Slip
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                )))
                    : (
                        <AdminOrderTable orders={paginated} onPackingSlipClick={this.togglePackingSlip} />
                    )
                }
                {/* Packing Slip Modal */}
                <Modal isOpen={showPackingSlip} toggle={() => this.togglePackingSlip()} size="lg">
                    <ModalHeader toggle={() => this.togglePackingSlip()}>Packing Slip</ModalHeader>
                    <ModalBody>
                        {selectedOrder && (
                            <>
                                <div id="printable-slip">
                                    <PackingSlip order={selectedOrder} />
                                </div>
                                <div className="text-end mt-3">
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            const content = document.getElementById('printable-slip')?.innerHTML;
                                            const printWindow = window.open('', '_blank');
                                            if (printWindow && content) {
                                                printWindow.document.write(`
                                                <html>
                                                    <head>
                                                    <title>Packing Slip</title>
                                                    <link rel="stylesheet" href="/styles/PackingSlip.css" />
                                                    </head>
                                                    <body>${content}</body>
                                                </html>
                                                `);
                                                printWindow.document.close();
                                                printWindow.focus();
                                                printWindow.print();
                                            }
                                        }}
                                    >
                                        🖨️ Print
                                    </Button>
                                </div>
                            </>
                        )}
                    </ModalBody>
                </Modal>
                {this.renderPagination()}
            </Container>
        );
    }
}

export default AdminOrderCards;