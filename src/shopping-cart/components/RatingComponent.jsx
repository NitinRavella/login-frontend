import React, { Component } from 'react';
import { FaStar, FaRegStar, FaImage } from 'react-icons/fa';
import Picker from 'emoji-picker-react';
import { Button, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import withRouter from './WithRoute';
import api from '../utils/Api';
import { toast } from 'react-toastify';

class ReviewForm extends Component {
    state = {
        rating: 0,
        comment: '',
        showEmojiPicker: false,
        images: [],
        isSubmitting: false,
    };

    handleRatingClick = (index) => {
        this.setState({ rating: index + 1 });
    };

    handleCommentChange = (e) => {
        this.setState({ comment: e.target.value });
    };

    toggleEmojiPicker = () => {
        this.setState((prevState) => ({ showEmojiPicker: !prevState.showEmojiPicker }));
    };

    onEmojiClick = (emojiData) => {
        this.setState((prevState) => ({
            comment: prevState.comment + emojiData.emoji,
            showEmojiPicker: false,
        }));
    };

    handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imagePreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        this.setState({ images: [...this.state.images, ...imagePreviews] });
    };

    removeImage = (index) => {
        const images = [...this.state.images];
        URL.revokeObjectURL(images[index].preview);
        images.splice(index, 1);
        this.setState({ images });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { rating, comment, images } = this.state;
        const userId = sessionStorage.getItem('userId');
        const { id } = this.props.params;

        if (!userId) {
            toast.error("You must be logged in to leave a review.");
            return;
        }

        if (!rating || rating < 1 || rating > 5) {
            toast.error("Please provide a rating between 1 and 5.");
            return;
        }

        this.setState({ isSubmitting: true });

        const formData = new FormData();
        formData.append('rating', rating);
        formData.append('comment', comment);
        images.forEach(img => {
            formData.append('reviewImages', img.file);
        });
        formData.append('path', 'ratings');
        try {
            const response = await api.post(`/product/${id}/rating`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(response.data.message || 'Review submitted!');
            this.setState({ rating: 0, comment: '', showEmojiPicker: false, images: [] });
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit review.");
        } finally {
            this.setState({ isSubmitting: false });
        }
    };

    renderStars = () => {
        const { rating } = this.state;
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                onClick={() => this.handleRatingClick(index)}
                style={{ cursor: 'pointer', fontSize: '1.5rem' }}
            >
                {index < rating ? <FaStar color="#ffc107" /> : <FaRegStar color="#ccc" />}
            </span>
        ));
    };

    render() {
        const { comment, showEmojiPicker, images, isSubmitting } = this.state;

        return (
            <div className="container mt-5 p-4 rounded shadow-sm bg-white" style={{ maxWidth: '600px' }}>
                <h4 className="mb-3">Leave a Review</h4>
                <Form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Label>Rating</Label>
                        <div>{this.renderStars()}</div>
                    </FormGroup>

                    <FormGroup>
                        <Label>Comment</Label>
                        <div className="d-flex align-items-center mb-2">
                            <Button size="sm" color="light" onClick={this.toggleEmojiPicker}>
                                😊 Emoji
                            </Button>
                        </div>
                        {showEmojiPicker && (
                            <div className="mb-2" style={{ zIndex: 10 }}>
                                <Picker onEmojiClick={this.onEmojiClick} />
                            </div>
                        )}
                        <Input
                            type="textarea"
                            rows="4"
                            value={comment}
                            onChange={this.handleCommentChange}
                            placeholder="Write your comment here..."
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label for="imageUpload" className="d-block">
                            <FaImage /> Add Images
                        </Label>
                        <Input type="file" id="imageUpload" multiple onChange={this.handleImageChange} />
                        <div className="mt-2 d-flex flex-wrap gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="position-relative">
                                    <img
                                        src={img.preview}
                                        alt={`preview-${index}`}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '5px'
                                        }}
                                    />
                                    <Button
                                        close
                                        onClick={() => this.removeImage(index)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 2,
                                            background: 'white'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </FormGroup>

                    <Button
                        type="submit"
                        color="primary"
                        className="mt-3"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner size="sm" /> Submitting...
                            </>
                        ) : 'Submit Review'}
                    </Button>
                </Form>
            </div>
        );
    }
}

export default withRouter(ReviewForm);
