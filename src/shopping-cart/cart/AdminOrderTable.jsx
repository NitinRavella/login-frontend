import React from 'react';
import {
    Table, Badge, Button
} from 'reactstrap';
import { FaPrint } from 'react-icons/fa';

const AdminOrderTable = ({ orders, onPackingSlipClick }) => {
    return (
        <div className="table-responsive">
            <Table bordered hover responsive>
                <thead className="table-light">
                    <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Products</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center">No orders found</td>
                        </tr>
                    ) : (
                        orders.map(order => (
                            <tr key={order._id}>
                                <td className="text-break small">{order._id}</td>
                                <td>
                                    {order.userId.fullName}
                                    <br />
                                    <small>{order.userId.email}</small>
                                </td>
                                <td>
                                    {order.items.map(item => (
                                        <div key={item._id} className="small mb-1">
                                            {item.name} x{item.quantity}
                                            {item.cancelled && (
                                                <span className="text-danger ms-1">❌</span>
                                            )}
                                        </div>
                                    ))}
                                </td>
                                <td className="small">
                                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    <br />
                                    📞 {order.shippingAddress.phone}
                                </td>
                                <td>
                                    <Badge className={`status-badge status-${order.status.replace(/\s/g, '')}`}>
                                        {order.status}
                                    </Badge>
                                </td>
                                <td>
                                    <Button
                                        size="sm"
                                        color="primary"
                                        onClick={() => onPackingSlipClick(order)}
                                    >
                                        <FaPrint className="me-1" />
                                        Slip
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default AdminOrderTable;
