import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, InputGroup, InputGroupText, Alert } from 'reactstrap';
import { Navigate } from 'react-router-dom';
import api from '../utils/Api';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
// import { GoogleLogin } from '@react-oauth/google';
import { connect } from 'react-redux';
import { loginSuccess } from '../../redux/reducers/authActions';
import { mergeGuestWishlistToUser } from '../../redux/actions/productActions';
import { fetchCart } from '../../redux/actions/productActions';
import { notifyError } from '../utils/toastUtils';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: '',
            redirect: false,
            showPassword: false,
        };
    }

    handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

    togglePasswordVisibility = () =>
        this.setState((prevState) => ({ showPassword: !prevState.showPassword }));

    handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = this.state;
        try {
            const res = await api.post('/login', { email, password });
            const { token, role, userId, name } = res.data;
            this.props.loginSuccess(token, role, userId, name, email);
            await this.props.mergeGuestWishlistToUser();
            this.props.fetchCart(userId);
            this.setState({ redirect: true });
        } catch (err) {
            notifyError('Login failed. Please check your credentials.');
            this.setState({ error: err.response?.data?.message || 'Login failed' });
        }
    };

    handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            const res = await api.post('/google-login', {
                token: credentialResponse.credential,
            });
            const { token, role } = res.data;
            this.props.loginSuccess(token, role);
            this.setState({ redirect: true });
        } catch (err) {
            notifyError('Google login failed.');
            console.error(err);
        }
    };

    render() {
        const { email, password, error, redirect, showPassword } = this.state;
        if (redirect) return <Navigate to="/home" />;

        return (
            <div className="auth-wrapper">
                <div className="auth-card">
                    <h3 className="text-center mb-4">Login to Your Account</h3>
                    {error && <Alert color="danger">{error}</Alert>}
                    <Form onSubmit={this.handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="username">Email</Label>
                            <InputGroup>
                                <InputGroupText><FaUser /></InputGroupText>
                                <Input
                                    type="text"
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
                                <InputGroupText
                                    style={{ cursor: 'pointer' }}
                                    onClick={this.togglePasswordVisibility}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </InputGroupText>
                            </InputGroup>
                        </FormGroup>
                        <Button color="primary" block>Login</Button>
                        <p className="text-center mt-3">
                            New user? <span onClick={this.props.onFlip} style={{ cursor: 'pointer', color: 'blue' }}>Register here</span>
                        </p>
                    </Form>
                    {/* <hr /> */}
                    {/* <p className="text-center">or</p>
                    <div className="d-flex justify-content-center">
                        <GoogleLogin
                            onSuccess={this.handleGoogleLoginSuccess}
                            onError={() => toast.error('Google Sign-In Failed')}
                        />
                    </div> */}
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    loginSuccess,
    fetchCart,
    mergeGuestWishlistToUser
};

export default connect(null, mapDispatchToProps)(Login);
