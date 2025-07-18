import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../utils/Api';
import { notifyError } from '../utils/toastUtils';

class OrderStatusPieChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [],
            options: this.getChartOptions([]),
            loading: true
        };
    }

    componentDidMount() {
        this.fetchStatusData();
    }

    fetchStatusData = async () => {
        try {
            const response = await api.get('/order-status-stats');
            const data = response.data;

            const labels = data.map(item => item._id);
            const series = data.map(item => item.count);
            const colors = labels.map(status => this.getStatusColor(status));

            this.setState({
                series,
                options: this.getChartOptions(labels, colors),
                loading: false
            });
        } catch (error) {
            console.error('Error fetching order status stats:', error);
            notifyError('Error fetching order status stats')
            this.setState({ loading: false });
        }
    };

    getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#28a745';       // Green
            case 'Cancelled': return '#dc3545';       // Red
            case 'Shipped': return '#17a2b8';         // Cyan
            case 'Confirmed': return '#ffc107';       // Yellow
            case 'Out for Delivery': return '#6f42c1';// Purple
            case 'Placed': default: return '#007bff'; // Default Blue
        }
    };

    getChartOptions = (labels, colors = []) => ({
        chart: {
            type: 'pie',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 400
            }
        },
        labels: labels,
        legend: {
            position: 'bottom',
            fontSize: '13px',
            fontWeight: 500
        },
        title: {
            text: 'Order Status Distribution',
            align: 'center',
            style: {
                fontSize: '16px',
                fontWeight: 600
            }
        },
        colors: colors,
        tooltip: {
            fillSeriesColor: false,
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: { width: 280 },
                legend: { position: 'bottom' }
            }
        }]
    });

    render() {
        const { series, options, loading } = this.state;

        return (
            <div className="bg-white p-3 shadow rounded mt-4">
                {loading ? (
                    <div className="text-center py-5">Loading chart...</div>
                ) : (
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="pie"
                        height={360}
                    />
                )}
            </div>
        );
    }
}

export default OrderStatusPieChart;
