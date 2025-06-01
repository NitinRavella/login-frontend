import React, { Component } from 'react';
import api from '../utils/Api';
import { Alert, Spinner, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import withRouter from '../components/WithRoute';

class Profile extends Component {
    state = {
        user: null,
        loading: true,
        error: '',
        editing: false,
        name: '',
        avatarFile: null,
        updating: false,
        success: '',
    };

    componentDidMount() {
        this.fetchProfile();
    }

    fetchProfile = async () => {
        try {
            const res = await api.get('/profile');
            this.setState({
                user: res.data.user,
                name: res.data.user.fullName,
                avatarFile: res.data.user.avatar,
                loading: false,
            });
        } catch (err) {
            this.setState({
                error: err.response?.data?.message || 'Failed to load profile.',
                loading: false,
            });
        }
    };

    handleEditToggle = () => {
        this.setState((prev) => ({ editing: !prev.editing, success: '', error: '' }));
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            this.setState({ avatarFile: file });
        }
    };

    handleUpdate = async (e) => {
        e.preventDefault();
        const { name, avatarFile } = this.state;

        const formData = new FormData();
        formData.append('fullName', name);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        this.setState({ updating: true });

        try {
            const res = await api.put('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            this.setState({
                user: res.data.user,
                editing: false,
                avatarFile: null,
                success: 'Profile updated successfully.',
                updating: false,
            });
        } catch (err) {
            this.setState({
                error: err.response?.data?.message || 'Update failed.',
                updating: false,
            });
        }
    };

    render() {
        const { user, loading, error, editing, name, updating, success, } = this.state;

        if (loading) return <div className="text-center mt-5"><Spinner color="primary" /></div>;

        if (error) return <Alert color="danger" className="mt-4">{error}</Alert>;

        return (
            <div className="container mt-4">
                <h2>Profile</h2>

                {success && <Alert color="success">{success}</Alert>}
                {error && <Alert color="danger">{error}</Alert>}

                <div className="mb-3 text-center">
                    {user?.avatar ? (
                        <img
                            src={user?.avatar}
                            alt="avatar"
                            className="rounded-circle border"
                            height={100}
                        />
                    ) : (
                        <div className="default-avatar">
                            {user.fullName?.charAt(0)}
                        </div>
                    )}
                </div>

                {!editing ? (
                    <>
                        <p><strong>Name:</strong> {user?.fullName}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        {user?.isAdmin && <p><strong>Role:</strong> Admin</p>}
                        <Button color="primary" onClick={this.handleEditToggle}>Edit Profile</Button>
                    </>
                ) : (
                    <Form onSubmit={this.handleUpdate}>
                        <FormGroup>
                            <Label>Full Name</Label>
                            <Input
                                type="text"
                                name="name"
                                value={name}
                                onChange={this.handleChange}
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Update Avatar</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={this.handleAvatarChange}
                            />
                        </FormGroup>

                        <Button color="success" disabled={updating}>
                            {updating ? 'Updating...' : 'Save Changes'}
                        </Button>{' '}
                        <Button color="secondary" onClick={this.handleEditToggle}>Cancel</Button>
                    </Form>
                )}
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <div className="mt-4">
                        <h5>Admin Actions</h5>
                        <Button color="danger" onClick={() => this.props.navigate('/admin/users', { state: { loggedInUserEmail: user.email } })}>
                            Manage Users
                        </Button>
                    </div>
                )}
                {user && (
                    <div className="mt-3">
                        <Button color="info" onClick={() => this.props.navigate('/order-history')}>
                            View Order History
                        </Button>
                    </div>
                )}

                {(user?.role === 'admin' || user?.role === 'superadmin') &&
                    <Button
                        color="dark"
                        className="mt-3"
                        onClick={() => this.props.navigate('/admin/orders')}
                    >
                        Manage All Orders
                    </Button>
                }

            </div>
        );
    }
}

export default withRouter(Profile);
