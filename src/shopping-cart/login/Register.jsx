import React, { Component } from 'react';
import {
    Button, Form, FormGroup, Label, Input, Alert, InputGroup, InputGroupText
} from 'reactstrap';
import { Navigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Avatar from 'react-avatar';
import api from '../utils/Api';
import withRouter from '../components/WithRoute';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            avatarFile: null,
            avatarPreview: '',
            error: '',
            success: false,
            showPassword: false,
        };
    }

    handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

    handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            this.setState({
                avatarFile: file,
                avatarPreview: URL.createObjectURL(file),
            });
        }
    };

    togglePasswordVisibility = () =>
        this.setState((prevState) => ({ showPassword: !prevState.showPassword }));

    handleSubmit = async (e) => {
        e.preventDefault();
        const { fullName, email, password, confirmPassword, avatarFile } = this.state;

        if (password !== confirmPassword) {
            return this.setState({ error: 'Passwords do not match.' });
        }

        try {
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('password', password);
            if (avatarFile) formData.append('avatar', avatarFile);

            await api.post('/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            this.props.navigate(`/verify-email?email=${encodeURIComponent(email)}`)

            this.setState({ success: true });
        } catch (err) {
            this.setState({ error: err.response?.data?.message || 'Registration failed' });
        }
    };

    render() {
        const {
            fullName, email, password, confirmPassword,
            avatarPreview, error, success, showPassword
        } = this.state;

        if (success) return <Navigate to="/login" />;

        return (
            <div className="auth-wrapper">
                <div className="auth-card">
                    <h3 className="text-center mb-4">Create New Account</h3>
                    {error && <Alert color="danger">{error}</Alert>}
                    <Form onSubmit={this.handleSubmit}>
                        {/* Avatar Preview & Upload */}
                        <FormGroup className="text-center">
                            <Label htmlFor='avatarPreview'>Avatar</Label>
                            <div className="mb-2">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        height={100}
                                        className="rounded-circle border"
                                    />
                                ) : (
                                    <Avatar
                                        name={fullName || 'User'}
                                        size="100"
                                        round={true}
                                    />
                                )}
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={this.handleAvatarChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="name">Full Name</Label>
                            <InputGroup>
                                <InputGroupText><FaUser /></InputGroupText>
                                <Input
                                    type="text"
                                    name="fullName"
                                    value={fullName}
                                    onChange={this.handleChange}
                                    required
                                    placeholder="Enter your name"
                                />
                            </InputGroup>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="email">Email</Label>
                            <InputGroup>
                                <InputGroupText><FaEnvelope /></InputGroupText>
                                <Input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={this.handleChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </InputGroup>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="password">Password</Label>
                            <InputGroup>
                                <InputGroupText><FaLock /></InputGroupText>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={password}
                                    onChange={this.handleChange}
                                    required
                                    placeholder="Enter your password"
                                />
                            </InputGroup>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <InputGroup>
                                <InputGroupText><FaLock /></InputGroupText>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={this.handleChange}
                                    required
                                    placeholder="Confirm your password"
                                />
                                <InputGroupText
                                    style={{ cursor: 'pointer' }}
                                    onClick={this.togglePasswordVisibility}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </InputGroupText>
                            </InputGroup>
                        </FormGroup>
                        <Button color="success" block>Create Account</Button>
                        <p className="text-center mt-3">
                            Already have an account? <span onClick={this.props.onFlip} style={{ cursor: 'pointer', color: 'blue' }}>Login here</span>
                        </p>
                    </Form>
                </div>
            </div>
        );
    }
}

export default withRouter(Register);
