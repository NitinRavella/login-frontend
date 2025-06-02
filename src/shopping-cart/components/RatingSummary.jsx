import React, { Component } from 'react';
import { FaStar } from 'react-icons/fa';
import '../../styles/RatingSummary.css'
import api from '../utils/Api';

class RatingDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            averageRating: 0,
            ratingCounts: {},
            hovered: false,
            totalRatings: 0,
            totalReviews: 0,
        };
    }

    componentDidMount() {
        this.fetchRatings();
    }

    fetchRatings = async () => {
        try {
            const res = await api.get(`/products/${this.props.productId}/ratings-summary`);
            const data = res.data;
            this.setState({
                ratingCounts: data.ratings,
                averageRating: data.averageRating,
                totalRatings: data.totalRatings || Object.values(data.ratings).reduce((a, b) => a + b, 0),
                totalReviews: data.totalReviews || 0,
            });
        } catch (err) {
            console.error('Failed to fetch ratings:', err);
        }
    };

    renderStars() {
        const { averageRating } = this.state;
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    color={i <= Math.round(averageRating) ? '#f5c518' : '#ccc'}
                    size={20}
                />
            );
        }
        return stars;
    }

    renderBreakdown() {
        const { ratingCounts } = this.state;

        const colors = {
            5: '#4caf50',
            4: '#8bc34a',
            3: '#cddc39',
            2: '#ffc107',
            1: '#f44336',
        };

        return (
            <div className="rating-breakdown">
                {[5, 4, 3, 2, 1].map((star) => (
                    <div className="bar" key={star}>
                        <span className="label">{star} star</span>
                        <div className="range">
                            <div
                                className="filled"
                                style={{
                                    width: `${(ratingCounts[star] || 0) * 10}%`,
                                    backgroundColor: colors[star],
                                }}
                            ></div>
                        </div>
                        <span className="count">{ratingCounts[star] || 0}</span>
                    </div>
                ))}
            </div>
        );
    }

    renderAverageRatingBadge() {
        const { averageRating, totalRatings, totalReviews } = this.state;
        return (
            <div className="average-rating-wrapper">
                <div className="average-rating-badge">
                    <span className="rating-number">{averageRating}</span>
                    <FaStar className="rating-star" />
                </div>
                <div className="ratings-reviews-text">
                    {totalRatings.toLocaleString()} Ratings &amp; {totalReviews.toLocaleString()} Reviews
                </div>
            </div>
        );
    }

    render() {
        const { averageRating, hovered } = this.state;

        return (
            <div className="rating-container">
                <div
                    className="stars-wrapper"
                    onMouseEnter={() => this.setState({ hovered: true })}
                    onMouseLeave={() => this.setState({ hovered: false })}
                >
                    {hovered ? (
                        <div>
                            <div className="stars-wrapper">
                                {this.renderStars()}
                                <span className="average">{averageRating}</span>
                            </div>
                            {this.renderBreakdown()}
                        </div>
                    ) : (
                        this.renderAverageRatingBadge()
                    )}
                </div>
            </div>
        );
    }
}

export default RatingDisplay;
