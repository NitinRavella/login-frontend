import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../utils/Api';
import { notifyError } from '../utils/toastUtils';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function formatMonth(monthString) {
    const [month, year] = monthString.split('/');
    const monthIndex = parseInt(month, 10) - 1;
    return monthIndex >= 0 && monthIndex < 12 ? `${monthNames[monthIndex]} ${year}` : monthString;
}

class MonthlyOrdersBarChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [],
            options: this.getChartOptions(),
            loading: true
        };
    }

    getChartOptions = () => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 500
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                endingShape: 'rounded'
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '12px'
            }
        },
        xaxis: {
            categories: [],
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                    fontWeight: 500
                }
            },
            title: {
                text: 'Orders',
                style: {
                    fontSize: '13px',
                    fontWeight: 600
                }
            }
        },
        legend: {
            position: 'top',
            fontSize: '12px',
            fontWeight: 500,
            horizontalAlign: 'center'
        },
        tooltip: {
            style: {
                fontSize: '12px'
            }
        },
        grid: {
            borderColor: '#e0e0e0',
            strokeDashArray: 4
        },
        colors: ['#007bff', '#28a745']
    });

    componentDidMount() {
        this.fetchMonthlyStats();
    }

    fetchMonthlyStats = async () => {
        try {
            const response = await api.get('/monthly-orders-stats');
            const data = response.data;

            const categories = data.map(item => formatMonth(item.month));
            const totalOrders = data.map(item => item.total);
            const deliveredOrders = data.map(item => item.delivered);

            this.setState(prevState => ({
                series: [
                    { name: 'Total Orders', data: totalOrders },
                    { name: 'Delivered Orders', data: deliveredOrders }
                ],
                options: {
                    ...prevState.options,
                    xaxis: { ...prevState.options.xaxis, categories }
                },
                loading: false
            }));
        } catch (error) {
            console.error('Error fetching monthly order stats:', error);
            notifyError('Error fetching monthly order stats')
            this.setState({ loading: false });
        }
    };

    render() {
        const { series, options, loading } = this.state;

        return (
            <div className="bg-white p-3 shadow rounded mt-4">
                <h5 className="text-center mb-3">Monthly Orders Overview</h5>
                {loading ? (
                    <div className="text-center py-5">Loading chart...</div>
                ) : (
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="bar"
                        height={360}
                    />
                )}
            </div>
        );
    }
}

export default MonthlyOrdersBarChart;
