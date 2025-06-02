import React, { Component } from 'react';
import { Container, Card, CardBody, Button } from 'reactstrap';
import { FaRegCheckCircle } from "react-icons/fa";
import withRouter from '../components/WithRoute';

class OrderConfirmation extends Component {
    handleBackToHome = () => {
        this.props.navigate('/');
    };

    render() {
        return (
            <Container className="mt-5 text-center">
                <Card className="shadow-sm rounded-4 p-4">
                    <CardBody>
                        <FaRegCheckCircle size={72} className="text-success mb-3" />
                        <h2 className="mb-3">Order Confirmed!</h2>
                        <p className="lead">Thank you for your purchase. Your order has been placed successfully.</p>
                        <p className="text-muted">You will receive an email confirmation shortly.</p>
                        <Button color="primary" className="mt-4" onClick={this.handleBackToHome}>
                            Back to Home
                        </Button>
                    </CardBody>
                </Card>
            </Container>
        );
    }
}

export default withRouter(OrderConfirmation);
