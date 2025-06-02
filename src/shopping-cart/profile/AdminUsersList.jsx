import React, { Component } from 'react';
import {
    Container,
    Table,
    Spinner,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledTooltip
} from 'reactstrap';
import { RiAdminFill, RiUserSettingsLine } from "react-icons/ri";
import { BiSolidUser } from "react-icons/bi";
import superAdmin from '../../assets/images/super-admin.png'
import api from '../utils/Api';
import withRouter from '../components/WithRoute';
import { toast } from 'react-toastify';
import '../../styles/AdminUsersList.css'

class AdminUsersList extends Component {
    state = {
        users: [],
        loading: true,
        error: null,
        success: null,
        dropdownOpenId: null,
    };

    componentDidMount() {
        this.fetchUsers();
    }

    fetchUsers = () => {
        const loggedInUserEmail = this.props.location?.state?.loggedInUserEmail;

        api.get('/all')
            .then(res => {
                let users = res.data;
                users = users.sort((a, b) => a.email.localeCompare(b.email));
                if (loggedInUserEmail) {
                    users = users.sort((a, b) =>
                        a.email === loggedInUserEmail ? -1 : b.email === loggedInUserEmail ? 1 : 0
                    );
                }

                this.setState({ users, loading: false, error: null });
            })
            .catch(err => {
                const msg = err.response?.data?.message || 'Unauthorized or failed to fetch users';
                this.setState({ error: msg, loading: false });
            });
    };

    toggleDropdown = (userId) => {
        this.setState(prevState => ({
            dropdownOpenId: prevState.dropdownOpenId === userId ? null : userId
        }));
    };

    handleRoleChange = (userId, role) => {
        api.put(`/users/role/${userId}`, { role })
            .then(res => {
                this.setState({ dropdownOpenId: null });
                this.fetchUsers();
                toast.success('Role updated successfully', res.data?.message);
            })
            .catch(err => {
                const msg = err.response?.data?.message || 'Failed to update role';
                this.setState({ error: msg });
                toast.error(msg);
            });
    };

    renderRoleIcon = (role) => {
        if (role === 'admin') {
            return <RiAdminFill size={32} color="#007bff" title="Admin" />;
        } else if (role === 'user') {
            return <BiSolidUser size={32} color="#0076ff" title="User" />;
        } else {
            return <img src={superAdmin} alt="Super Admin" style={{ width: 32, height: 32 }} title="Super Admin" />;
        }
    };

    render() {
        const { users, loading, dropdownOpenId } = this.state;

        return (
            <Container className="mt-4">
                <h3>All Users (Admin View)</h3>

                {loading && <Spinner color="primary" />}
                {!loading && (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Role</th>
                                <th>Action</th>
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
                                    <td>{new Date(user.updatedAt).toLocaleDateString()}</td>
                                    <td>{this.renderRoleIcon(user.role)}</td>
                                    <td>
                                        {user.role !== 'superadmin' && (
                                            <div>
                                                <Dropdown
                                                    isOpen={dropdownOpenId === user._id}
                                                    toggle={() => this.toggleDropdown(user._id)}
                                                >
                                                    <DropdownToggle
                                                        color="link"
                                                        id={`toggle-${user._id}`}
                                                        className="p-0"
                                                        style={{ border: 'none', cursor: 'pointer' }}
                                                    >
                                                        <RiUserSettingsLine size={32} />
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        <DropdownItem onClick={() => this.handleRoleChange(user._id, 'user')}>
                                                            Set as User
                                                        </DropdownItem>
                                                        <DropdownItem onClick={() => this.handleRoleChange(user._id, 'admin')}>
                                                            Set as Admin
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                                <UncontrolledTooltip
                                                    placement="top"
                                                    target={`toggle-${user._id}`}
                                                >
                                                    Change Role
                                                </UncontrolledTooltip>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Container>
        );
    }
}

export default withRouter(AdminUsersList);
