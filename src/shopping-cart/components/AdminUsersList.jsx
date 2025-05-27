import React, { Component } from 'react';
import { Container, Table, Spinner, Alert } from 'reactstrap';
import api from '../utils/Api';

class AdminUsersList extends Component {
    state = {
        users: [],
        loading: true,
        error: null,
    };

    componentDidMount() {
        api.get('/all')
            .then(res => {
                this.setState({ users: res.data, loading: false });
            })
            .catch(err => {
                const msg = err.response?.data?.message || 'Unauthorized or failed to fetch users';
                this.setState({ error: msg, loading: false });
            });
    }

    render() {
        const { users, loading, error } = this.state;

        return (
            <Container className="mt-4">
                <h3>All Users (Admin View)</h3>

                {loading && <Spinner color="primary" />}
                {error && <Alert color="danger">{error}</Alert>}

                {!loading && !error && (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Created-At</th>
                                <th>Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="avatar"
                                                style={{ width: 40, height: 40, borderRadius: '50%' }}
                                            />
                                        ) : (
                                            <div className="default-avatar">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>{user.isAdmin ? '✅' : '❌'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Container>
        );
    }
}

export default AdminUsersList;
