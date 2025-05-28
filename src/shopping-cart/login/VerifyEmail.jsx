import React, { Component } from 'react';
import { Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import api from '../utils/Api';
import withRouter from '../components/WithRoute';
import { toast } from 'react-toastify';

class VerifyEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: '',
            error: '',
            email: '',
            success: false,
        };
    }

    componentDidMount() {
        const queryParams = new URLSearchParams(this.props.location.search);
        const email = queryParams.get('email');
        this.setState({ email });
    }

    handleChange = (e) => this.setState({ code: e.target.value });

    handleSubmit = async (e) => {
        e.preventDefault();
        const { code, email } = this.state;
        console.log('Verifying email:', email);

        try {
            await api.post('/verify-email', { email, code });
            toast.success('Email verified successfully!');
            this.props.navigate('/login')
            this.setState({ success: true, error: '' });
        } catch (err) {
            this.setState({
                error: err.response?.data?.message || 'Verification failed',
                success: false,
            });
        }
    };

    render() {
        const { code, error, success, email } = this.state;

        return (
            <div className="auth-wrapper">
                <div className='auth-card'>
                    <h4>Email Verification</h4>
                    {error && <Alert color="danger">{error}</Alert>}
                    {success && <Alert color="success">Email verified! You can now log in.</Alert>}
                    <Form onSubmit={this.handleSubmit}>
                        <FormGroup>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                name="email"
                                value={email}
                                readOnly
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Enter verification code sent to your email</Label>
                            <Input
                                type="text"
                                name="code"
                                value={code}
                                onChange={this.handleChange}
                                required
                            />
                        </FormGroup>
                        <Button color="primary">Verify</Button>
                    </Form>
                </div>
            </div>
        );
    }
}

export default withRouter(VerifyEmail);
