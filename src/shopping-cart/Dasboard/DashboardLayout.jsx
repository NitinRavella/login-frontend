import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Container, Row, Col } from 'reactstrap';
import OrderStatusPieChart from './OrderStatusPieChart';
import MonthlyOrdersBarChart from './MonthlyOrdersBarChart';

class DashboardLayout extends Component {
    render() {
        return (
            <div className="mt-5 pt-4 border-top">
                <h4 className="mb-4">Dashboard Insights</h4>
                <Container fluid>
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="shadow-sm">
                                <CardBody>
                                    <CardTitle tag="h5" className="mb-3">Order Status Overview</CardTitle>
                                    <OrderStatusPieChart />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card className="shadow-sm">
                                <CardBody>
                                    <CardTitle tag="h5" className="mb-3">Monthly Orders</CardTitle>
                                    <MonthlyOrdersBarChart />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default DashboardLayout;
