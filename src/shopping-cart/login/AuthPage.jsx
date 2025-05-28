import React, { Component } from 'react';
import Login from './Login';
import Register from './Register';
import VerifyEmail from './VerifyEmail'; // Assume this component handles verification input
import '../../styles/AuthPage.css';

class AuthPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: true,
            showVerification: false,
            registeredEmail: '',
        };
    }

    toggleView = () => {
        this.setState({ showLogin: !this.state.showLogin });
    };

    handleVerificationStart = (email) => {
        this.setState({
            showVerification: true,
            registeredEmail: email,
        });
    };

    render() {
        const { showLogin, showVerification, registeredEmail } = this.state;

        return (
            <div className="auth-container">
                <div className={`card-container ${showLogin ? '' : 'flipped'}`}>
                    <div className="card-front">
                        {!showVerification ? (
                            <Login onFlip={this.toggleView} />
                        ) : (
                            <VerifyEmail email={registeredEmail} />
                        )}
                    </div>
                    <div className="card-back">
                        <Register
                            onFlip={this.toggleView}
                            onVerificationStart={this.handleVerificationStart}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default AuthPage;
