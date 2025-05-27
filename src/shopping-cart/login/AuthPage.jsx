import React, { Component } from 'react';
import Login from './Login';
import Register from './Register';
import '../../styles/AuthPage.css';

class AuthPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: true,
        };
    }
    toggleView = () => {
        this.setState({ showLogin: !this.state.showLogin });
    };

    render() {
        const { showLogin } = this.state;

        return (
            <div className="auth-container">
                <div className={`card-container ${showLogin ? '' : 'flipped'}`}>
                    <div className="card-front">
                        <Login onFlip={this.toggleView} />
                    </div>
                    <div className="card-back">
                        <Register onFlip={this.toggleView} />
                    </div>
                </div>
            </div>
        );
    }
}

export default AuthPage;
