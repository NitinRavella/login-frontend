import React, { Component } from 'react';
import { ReactSortable } from 'react-sortablejs';

class ImagePreviewList extends Component {
    handleRemoveImage = (index) => {
        const { images, onChange } = this.props;
        const updated = images.filter((_, i) => i !== index);
        onChange(updated);
    };

    render() {
        const { images = [], onChange, label } = this.props;
        return (
            <div className="mt-2">
                {label && <label className="form-label">{label}</label>}

                <ReactSortable
                    list={images}
                    setList={(newList) => onChange(newList)}
                    className="d-flex flex-wrap"
                    animation={150}
                >
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className="position-relative me-2 mb-2 text-center"
                            style={{ cursor: 'move' }}
                        >
                            <img
                                src={img instanceof File ? URL.createObjectURL(img) : img.url || img}
                                alt={`Preview ${i}`}
                                className="img-thumbnail"
                                width={100}
                                height={100}
                            />
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger d-block w-100 mt-1"
                                onClick={() => {
                                    const updated = images.filter((_, index) => index !== i);
                                    onChange(updated);
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </ReactSortable>
            </div>
        );
    }

}

export default ImagePreviewList;
