import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../utils/Api';
import { notifyError } from '../utils/toastUtils';

class OrderStatusChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartType: 'pie',
            rawData: [], // store raw api data
            series: [],
            options: {},
            loading: true,
        };
    }

    componentDidMount() {
        this.fetchStatusData();
    }

    fetchStatusData = async () => {
        try {
            const response = await api.get('/order-status-stats');
            const data = response.data;

            this.setState(
                { rawData: data, loading: false },
                () => this.updateChart(this.state.chartType)
            );
        } catch (error) {
            console.error('Error fetching data:', error);
            notifyError('Error fetching data')
            this.setState({ loading: false });
        }
    };

    getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#28a745';
            case 'Cancelled': return '#dc3545';
            case 'Shipped': return '#17a2b8';
            case 'Confirmed': return '#ffc107';
            case 'Out for Delivery': return '#6f42c1';
            case 'Placed':
            default:
                return '#007bff';
        }
    };

    updateChart = (type) => {
        const { rawData } = this.state;
        const labels = rawData.map(item => item._id);
        const colors = labels.map(this.getStatusColor);
        let series = [];
        let options = {};

        if (type === 'pie') {
            series = rawData.map(item => item.count);
            options = {
                chart: { type: 'pie', toolbar: { show: false } },
                labels,
                colors,
                legend: { position: 'bottom', fontSize: '13px' },
                title: { text: 'Order Status Distribution', align: 'center', style: { fontSize: '16px' } },
            };
        } else if (type === 'bar' || type === 'line') {
            series = [
                {
                    name: 'Count',
                    data: rawData.map(item => item.count)
                }
            ];
            options = {
                chart: { type, toolbar: { show: false } },
                colors,
                xaxis: { categories: labels },
                title: { text: `Order Status ${type.charAt(0).toUpperCase() + type.slice(1)}`, align: 'center', style: { fontSize: '16px' } },
                plotOptions: type === 'bar' ? { bar: { horizontal: false, columnWidth: '50%' } } : undefined,
                stroke: type === 'line' ? { curve: 'smooth' } : undefined,
                dataLabels: { enabled: type === 'bar' },
                legend: { show: false }
            };
        }

        this.setState({ chartType: type, series, options });
    };

    handleChartTypeChange = (type) => {
        this.updateChart(type);
    };

    render() {
        const { chartType, series, options, loading } = this.state;

        return (
            <div className="bg-white p-4 shadow rounded mt-4">
                <h5 className="text-center mb-3">Order Status Chart</h5>

                <div className="d-flex justify-content-center mb-3">
                    {['pie', 'bar', 'line'].map(type => (
                        <button
                            key={type}
                            onClick={() => this.handleChartTypeChange(type)}
                            className={`btn btn-sm me-2 ${chartType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-5">Loading chart...</div>
                ) : (
                    <ReactApexChart
                        options={options}
                        series={series}
                        type={chartType}
                        height={360}
                        width="100%"
                    />
                )}
            </div>
        );
    }
}

export default OrderStatusChart;
