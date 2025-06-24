import React, { Component } from 'react';
import api from '../utils/Api';
import { Alert, Spinner, Button, Form, FormGroup, Label, Input, Card, CardBody, CardTitle, CardSubtitle, Row, Col } from 'reactstrap';
import withRouter from '../components/WithRoute';
import DashboardLayout from '../Dasboard/DashboardLayout';
import '../../styles/Profile.css'; // Custom CSS file for styling

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
            const res = await api.put('/profile-update', formData, {
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
        const { user, loading, error, editing, name, updating, success } = this.state;

        if (loading) return <div className="text-center mt-5"><Spinner color="primary" /></div>;

        if (error) return <Alert color="danger" className="mt-4">{error}</Alert>;

        return (
            <div className="container mt-5 profile-container">
                <Card className="shadow-lg p-4 rounded profile-card">
                    <CardBody>
                        <CardTitle tag="h3" className="text-center mb-3">My Profile</CardTitle>
                        {success && <Alert color="success">{success}</Alert>}
                        {error && <Alert color="danger">{error}</Alert>}

                        <div className="text-center mb-4">
                            {user?.avatar ? (
                                <img
                                    src={user?.avatar}
                                    alt="avatar"
                                    className="profile-avatar"
                                />
                            ) : (
                                <div className="default-avatar">
                                    {user.fullName?.charAt(0)}
                                </div>
                            )}
                        </div>

                        {!editing ? (
                            <>
                                <CardSubtitle tag="h5" className="mb-2 text-muted text-center">
                                    {user?.fullName}
                                </CardSubtitle>
                                <p className="text-center mb-1"><strong>Email:</strong> {user?.email}</p>
                                <p className="text-center mb-4">
                                    <strong>Role:</strong> {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'User'}
                                </p>

                                <div className="text-center">
                                    <Button color="primary" onClick={this.handleEditToggle}>Edit Profile</Button>
                                </div>
                            </>
                        ) : (
                            <Form onSubmit={this.handleUpdate} className="px-3">
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

                                <div className="text-center">
                                    <Button color="success" disabled={updating}>
                                        {updating ? 'Updating...' : 'Save Changes'}
                                    </Button>{' '}
                                    <Button color="secondary" onClick={this.handleEditToggle}>Cancel</Button>
                                </div>
                            </Form>
                        )}

                        <hr className="my-4" />

                        <Row className="text-center">
                            <Col>
                                <Button
                                    color="info"
                                    onClick={() => this.props.navigate('/order-history')}
                                >
                                    View Orders
                                </Button>
                            </Col>

                            {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <Col>
                                    <Button
                                        color="danger"
                                        onClick={() => this.props.navigate('/admin/users', { state: { loggedInUserEmail: user.email } })}
                                    >
                                        Manage Users
                                    </Button>
                                </Col>
                            )}

                            {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <Col>
                                    <Button
                                        color="dark"
                                        onClick={() => this.props.navigate('/admin/orders')}
                                    >
                                        Manage Orders
                                    </Button>
                                </Col>
                            )}
                        </Row>

                        {user?.role === 'superadmin' && (
                            <div className="mt-5">
                                <DashboardLayout />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default withRouter(Profile);
