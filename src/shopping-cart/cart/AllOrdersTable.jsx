import React, { Component } from 'react';
import {
    Table, Spinner, Input, FormGroup, Pagination, PaginationItem, PaginationLink, Row, Col, Label
} from 'reactstrap';
import api from '../utils/Api';

class AllOrdersTable extends Component {
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
        ordersPerPage: 5,
    };

    componentDidMount() {
        this.fetchAllOrders();
    }

    fetchAllOrders = async () => {
        try {
            const res = await api.get('/orders');
            this.setState({
                orders: res.data.orders,
                filteredOrders: res.data.orders,
                loading: false,
            });
        } catch (err) {
            console.error('Failed to load orders', err);
            this.setState({ loading: false });
        }
    };

    handleStatusChange = async (orderId, newStatus) => {
        this.setState({ updatingId: orderId });
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            this.fetchAllOrders();
        } catch (err) {
            alert('Failed to update status');
        } finally {
            this.setState({ updatingId: '' });
        }
    };

    handleFilterChange = () => {
        const { orders, searchQuery, statusFilter, dateFrom, dateTo } = this.state;

        let filtered = orders;

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
            // start of the dateFrom day (midnight)
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            filtered = filtered.filter(order => new Date(order.placedAt) >= from);
        }

        if (dateTo) {
            // end of the dateTo day (23:59:59.999)
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(order => new Date(order.placedAt) <= to);
        }

        this.setState({ filteredOrders: filtered, currentPage: 1 });
    };


    clearFilters = () => {
        this.setState({
            searchQuery: '',
            statusFilter: 'All',
            dateFrom: '',
            dateTo: '',
        }, this.handleFilterChange);
    };

    paginate = (orders) => {
        const { currentPage, ordersPerPage } = this.state;
        const startIndex = (currentPage - 1) * ordersPerPage;
        return orders.slice(startIndex, startIndex + ordersPerPage);
    };

    changePage = (newPage) => {
        this.setState({ currentPage: newPage });
    };

    renderPagination = (totalOrders) => {
        const { currentPage, ordersPerPage } = this.state;
        const totalPages = Math.ceil(totalOrders / ordersPerPage);
        if (totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <PaginationItem key={i} active={i === currentPage}>
                    <PaginationLink onClick={() => this.changePage(i)}>{i}</PaginationLink>
                </PaginationItem>
            );
        }

        return (
            <Pagination className="justify-content-center">
                <PaginationItem disabled={currentPage <= 1}>
                    <PaginationLink previous onClick={() => this.changePage(currentPage - 1)} />
                </PaginationItem>
                {pages}
                <PaginationItem disabled={currentPage >= totalPages}>
                    <PaginationLink next onClick={() => this.changePage(currentPage + 1)} />
                </PaginationItem>
            </Pagination>
        );
    };

    render() {
        const {
            filteredOrders, loading, updatingId, searchQuery,
            statusFilter, dateFrom, dateTo
        } = this.state;

        if (loading) return <div className="text-center mt-5"><Spinner /></div>;

        const statusOptions = ['All', 'Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
        const paginatedOrders = this.paginate(filteredOrders);

        return (
            <div className="container mt-4">
                <h3>All Orders</h3>

                <Row className="mb-3">
                    <Col md="4">
                        <Input
                            type="text"
                            placeholder="Search by Order ID, Name, or Email"
                            value={searchQuery}
                            onChange={(e) => this.setState({ searchQuery: e.target.value }, this.handleFilterChange)}
                        />
                    </Col>
                    <Col md="2">
                        <Input
                            type="select"
                            value={statusFilter}
                            onChange={(e) => this.setState({ statusFilter: e.target.value }, this.handleFilterChange)}
                        >
                            {statusOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </Input>
                    </Col>
                    <Col md="3">
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => this.setState({ dateFrom: e.target.value }, this.handleFilterChange)}
                        />
                        <Label>From</Label>
                    </Col>
                    <Col md="3">
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => this.setState({ dateTo: e.target.value }, this.handleFilterChange)}
                        />
                        <Label>To</Label>
                    </Col>
                    <Col md="2" className="d-flex justify-content-start">
                        <button
                            className="btn btn-secondary"
                            onClick={this.clearFilters}
                            style={{ height: '38px', marginBottom: '4px' }}
                        >
                            Clear Filters
                        </button>
                    </Col>
                </Row>

                <Table striped responsive>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User Name</th>
                            <th>Email ID</th>
                            <th>Placed At</th>
                            <th>Products Ordered</th>
                            <th>Cancelled</th>
                            <th>Status</th>
                            <th>Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">No orders found</td>
                            </tr>
                        ) : (
                            paginatedOrders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.userId.fullName}</td>
                                    <td>{order.userId.email}</td>
                                    <td>{new Date(order.placedAt).toLocaleString()}</td>
                                    <td>
                                        {order.items?.length > 0 ? (
                                            order.items.map((item, idx) => (
                                                <div key={idx}>{item.product.name} x{item.quantity}</div>
                                            ))
                                        ) : (
                                            <em>No items</em>
                                        )}
                                    </td>
                                    <td>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx}>
                                                {item.cancelled
                                                    ? <span style={{ color: 'red', fontWeight: 'bold' }}>Cancelled</span>
                                                    : <span>Active</span>}
                                            </div>
                                        ))}
                                    </td>
                                    <td>{order.status}</td>
                                    <td>
                                        <FormGroup className="d-flex">
                                            <Input
                                                type="select"
                                                value={order.status}
                                                onChange={(e) => this.handleStatusChange(order._id, e.target.value)}
                                                disabled={['Cancelled', 'Delivered'].includes(order.status) || updatingId === order._id}
                                            >
                                                {statusOptions.filter(s => s !== 'All').map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </Input>
                                            {updatingId === order._id && <Spinner size="sm" className="ms-2" />}
                                        </FormGroup>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>

                {this.renderPagination(filteredOrders.length)}
            </div>
        );
    }
}

export default AllOrdersTable;
