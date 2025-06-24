import React, { Component } from 'react';
import {
    Table, Spinner, Input, FormGroup, Pagination, PaginationItem, PaginationLink, Row, Col, Label
} from 'reactstrap';
import api from '../utils/Api';
import '../../styles/AllOrdersTable.css'

class AllOrdersTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
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
    }

    componentDidMount() {
        this.fetchAllOrders();
    }

    fetchAllOrders = async () => {
        try {
            const res = await api.get('/orders');
            const sortedOrders = res.data.orders.slice().sort(
                (a, b) => new Date(b.placedAt) - new Date(a.placedAt)
            );
            this.setState({
                orders: sortedOrders,
                filteredOrders: sortedOrders,
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

        const sortedFiltered = filtered.slice().sort(
            (a, b) => new Date(b.placedAt) - new Date(a.placedAt)
        );


        this.setState({ filteredOrders: sortedFiltered, currentPage: 1 });
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

    downloadInvoice = async (orderId) => {
        try {
            const token = sessionStorage.getItem('token'); // or wherever your token is stored
            const response = await api.get(`/order/${orderId}/invoice`, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Invoice download failed', err);
            alert('Failed to download invoice');
        }
    };


    render() {
        const {
            filteredOrders, loading, updatingId, searchQuery,
            statusFilter, dateFrom, dateTo
        } = this.state;

        const today = new Date().toISOString().split('T')[0];
        if (loading) return <div className="text-center mt-5"><Spinner /></div>;

        const statusOptions = ['All', 'Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
        const paginatedOrders = this.paginate(filteredOrders);

        return (
            <div className="container all-orders-container">
                <h3 className="mb-4">All Orders</h3>

                <Row className="filters-row d-flex align-items-end">
                    <Col className="filter-group">
                        <Label for="searchInput">Search</Label>
                        <Input
                            id="searchInput"
                            type="text"
                            placeholder="Order ID, Name, or Email"
                            value={searchQuery}
                            onChange={(e) => this.setState({ searchQuery: e.target.value }, this.handleFilterChange)}
                        />
                    </Col>

                    <Col className="filter-group">
                        <Label for="statusSelect">Status</Label>
                        <Input
                            id="statusSelect"
                            type="select"
                            value={statusFilter}
                            onChange={(e) => this.setState({ statusFilter: e.target.value }, this.handleFilterChange)}
                        >
                            {statusOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </Input>
                    </Col>

                    <Col className="filter-group">
                        <Label for="dateFrom">From Date</Label>
                        <Input
                            id="dateFrom"
                            type="date"
                            value={dateFrom}
                            max={today}
                            onChange={(e) => this.setState({ dateFrom: e.target.value }, this.handleFilterChange)}
                        />
                    </Col>

                    <Col className="filter-group">
                        <Label for="dateTo">To Date</Label>
                        <Input
                            id="dateTo"
                            type="date"
                            value={dateTo}
                            max={today}
                            onChange={(e) => this.setState({ dateTo: e.target.value }, this.handleFilterChange)}
                        />
                    </Col>

                    <Col xs="12" md="auto" className="d-flex justify-content-start mb-2 mb-md-0">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={this.clearFilters}
                            style={{ minWidth: '110px' }}
                        >
                            Clear Filters
                        </button>
                    </Col>
                </Row>

                <div className="table-responsive">
                    <Table striped>
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
                                <th>Invoice</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center">No orders found</td>
                                </tr>
                            ) : (
                                paginatedOrders.map(order => (
                                    <tr key={order._id}>
                                        <td className="text-break">{order._id}</td>
                                        <td>{order.userId.fullName}</td>
                                        <td>{order.userId.email}</td>
                                        <td>{new Date(order.placedAt).toLocaleString()}</td>
                                        <td className="text-start">
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
                                                    {item.cancelled ? (
                                                        <span className="cancelled-badge">Cancelled</span>
                                                    ) : (
                                                        <span>Active</span>
                                                    )}
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            <span className={`badge-status status-${order.status.replace(/\s/g, '')}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <FormGroup className="d-flex align-items-center gap-2">
                                                <Input
                                                    type="select"
                                                    value={order.status}
                                                    onChange={(e) => this.handleStatusChange(order._id, e.target.value)}
                                                    disabled={['Cancelled', 'Delivered'].includes(order.status) || updatingId === order._id}
                                                    style={{ minWidth: '130px' }}
                                                >
                                                    {statusOptions.filter(s => s !== 'All').map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </Input>
                                                {updatingId === order._id && <Spinner size="sm" />}
                                            </FormGroup>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => this.downloadInvoice(order._id)}
                                            >
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>

                {this.renderPagination(filteredOrders.length)}
            </div>


        );
    }
}

export default AllOrdersTable;
