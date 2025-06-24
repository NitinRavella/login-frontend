import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Button, InputGroup, InputGroupText, ModalFooter, Row, Col, Spinner } from 'reactstrap';
import { FaTag, FaInfoCircle, FaListAlt, FaBox, FaImage, FaTrash, FaTimes, FaMemory, FaHdd, FaRulerCombined, FaPalette, FaMicrochip, FaBoxOpen } from 'react-icons/fa';
import MultiSelectWithOther from '../utils/MultiSelector';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

export default class HomeHelper extends Component {

    handleRemoveImage = (index) => {
        this.setState(prevState => {
            const updatedFiles = [...prevState.imageFiles];
            URL.revokeObjectURL(updatedFiles[index].preview);
            updatedFiles.splice(index, 1);
            return { imageFiles: updatedFiles };
        });
    };

    handleRemoveExistingImage = (index) => {
        this.setState(prevState => {
            const updatedRemovedIndexes = [...prevState.removedImageIndexes, index];
            return { removedImageIndexes: updatedRemovedIndexes };
        });
    };

    removeVariantImage = (variantKey, index) => {
        this.setState(prev => {
            const existingImages = prev.variantImages[variantKey];
            if (!Array.isArray(existingImages) || existingImages.length === 0) return null;

            const updatedImages = [...existingImages];
            const [removedImage] = updatedImages.splice(index, 1);

            if (removedImage?.previewUrl) {
                URL.revokeObjectURL(removedImage.previewUrl);
            }

            return {
                variantImages: {
                    ...prev.variantImages,
                    [variantKey]: updatedImages,
                },
            };
        });
    };

    onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const imagePreviews = acceptedFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));

            this.setState((prevState) => ({
                imageFiles: [...prevState.imageFiles, ...imagePreviews]
            }));
        }
    };


    renderDropzone = () => {
        const { imageFiles } = this.state;

        const DropzoneArea = () => {
            const { getRootProps, getInputProps } = useDropzone({
                onDrop: this.onDrop,
                onDropRejected: (fileRejections) => {
                    fileRejections.forEach(rejection => {
                        const file = rejection.file;
                        if (file.size > 1048576) {
                            toast.error("File size exceeds 1MB limit!");
                        } else {
                            toast.error("Invalid file. Only image files are allowed.");
                        }
                    });
                },
                accept: { 'image/*': [] },
                multiple: true,
                maxSize: 1048576,
            });

            return (
                <div {...getRootProps()} className="dropzone-container">
                    <input {...getInputProps()} />
                    {imageFiles.length > 0 ? (
                        <div className="preview-container">
                            {imageFiles.map((img, index) => (
                                <div className="preview-wrapper" key={index}>
                                    <img
                                        src={img.preview}
                                        alt="Preview"
                                        className="preview-image"
                                    />
                                    <button
                                        type="button"
                                        className="remove-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.handleRemoveImage(index);
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="dropzone-message">Drag & drop images here, or click to select (Max size: 1MB each)</p>
                    )}
                </div>
            );
        };

        return <DropzoneArea />;
    };

    handleVariantImageUpload = (e, variantKey) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        const maxSizeMB = 3;
        const maxImagesPerVariant = 5;

        const newImages = files
            .filter(file => {
                if (!allowedTypes.includes(file.type)) {
                    toast.warning(`${file.name} is not a valid image type.`);
                    return false;
                }
                if (file.size > maxSizeMB * 1024 * 1024) {
                    toast.warning(`${file.name} exceeds ${maxSizeMB}MB size limit.`);
                    return false;
                }
                return true;
            })
            .map(file => ({
                file,
                previewUrl: URL.createObjectURL(file),
            }));

        this.setState(prev => {
            const existing = prev.variantImages[variantKey] || [];
            const total = [...existing, ...newImages];
            if (total.length > maxImagesPerVariant) {
                toast.warn(`Only ${maxImagesPerVariant} images allowed per variant.`);
                return {
                    variantImages: {
                        ...prev.variantImages,
                        [variantKey]: [...existing, ...newImages.slice(0, maxImagesPerVariant - existing.length)],
                    },
                };
            }

            return {
                variantImages: {
                    ...prev.variantImages,
                    [variantKey]: [...existing, ...newImages],
                },
            };
        });
    };

    renderProductFormInline = (isEdit) => {
        const {
            name, description, category, price, stock, offerPrice, brand,
            isSubmitting, processor, colors, variantImages = {}, perColorRamRom = {}
        } = this.state;

        const title = isEdit ? "Edit Product" : "Add Product";
        const buttonText = isEdit ? "Update" : "Add";
        const submitHandler = isEdit ? this.handleUpdate : this.handleSubmit;
        const isFormIncomplete = !name || !brand || !description || !category;
        const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
        const stockOptions = [0, 1, 2, 5, 10, 20, 50, 100];

        const parsedColors = (colors || '').split(',').map(c => c.trim()).filter(Boolean);
        // console.log('renderProductFormInline', variantImages)
        console.log('renderProductFormInline', perColorRamRom)
        return (
            <div className="p-3 border rounded bg-light">
                <Row>
                    <Col md='11'><h4>{title}</h4></Col>
                    <Col md='1' className="text-end">
                        <FaTimes style={{ cursor: 'pointer', color: '#dc3545' }} onClick={this.closeModal} />
                    </Col>
                </Row>
                <Form onSubmit={submitHandler}>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label>Product Name</Label>
                                <InputGroup>
                                    <InputGroupText><FaTag /></InputGroupText>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={this.handleChange}
                                        required
                                        placeholder="Enter product name"
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label>Brand</Label>
                                <InputGroup>
                                    <InputGroupText><FaTag /></InputGroupText>
                                    <Input
                                        type="text"
                                        name="brand"
                                        value={brand || ''}
                                        onChange={this.handleChange}
                                        required
                                    // placeholder="Optional"
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                    <FormGroup>
                        <Label>Description</Label>
                        <InputGroup>
                            <InputGroupText><FaInfoCircle /></InputGroupText>
                            <Input
                                type="textarea"
                                name="description"
                                value={description}
                                onChange={this.handleChange}
                                rows={3}
                                required
                            />
                        </InputGroup>
                    </FormGroup>
                    {/* <Row>
                        <Col md={4}>
                            <FormGroup>
                                <Label>Price</Label>
                                <InputGroup>
                                    <InputGroupText>₹</InputGroupText>
                                    <Input
                                        type="number"
                                        name="price"
                                        value={price}
                                        onChange={this.handleChange}
                                        min="0"
                                        required
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Label>Offer Price</Label>
                                <InputGroup>
                                    <InputGroupText>₹</InputGroupText>
                                    <Input
                                        type="number"
                                        name="offerPrice"
                                        value={offerPrice || ''}
                                        onChange={this.handleChange}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row> */}
                    <FormGroup>
                        <Label>Category</Label>
                        <InputGroup>
                            <InputGroupText><FaListAlt /></InputGroupText>
                            <Input
                                type="select"
                                name="category"
                                value={category}
                                onChange={this.handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="phone">Phone</option>
                                <option value="laptop">Laptop</option>
                                <option value="tablet">Tablet</option>
                                <option value="smartwatch">Smartwatch</option>
                                <option value="clothing">Clothing</option>
                                <option value="shoes">Shoes</option>
                                <option value="furniture">Furniture</option>
                                <option value="accessories">Accessories</option>
                            </Input>
                        </InputGroup>
                    </FormGroup>

                    {/* ---------- Fashion Variant Section ---------- */}
                    {['clothing', 'shoes'].includes(category?.toLowerCase()) && (
                        <>
                            <FormGroup>
                                <Label>Colors (comma separated)</Label>
                                <InputGroup>
                                    <InputGroupText><FaPalette /></InputGroupText>
                                    <Input
                                        type="text"
                                        name="colors"
                                        value={colors || ''}
                                        onChange={this.handleChange}
                                        placeholder="e.g., Red, Blue, Green"
                                    />
                                </InputGroup>
                            </FormGroup>
                            {parsedColors.map((color) => {
                                const stockKey = `stock_${color}`;
                                const sizesKey = `sizes_${color}`;
                                const priceKey = `price_${color}`;
                                const offerKey = `offer_${color}`;
                                const imageKey = color;
                                return (
                                    <div key={color} className="border p-3 mb-3 rounded">
                                        <h6>Color: {color}</h6>
                                        <Row>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for={`stock-${color}`}>Stock Quantity</Label>
                                                    <InputGroup>
                                                        <InputGroupText><FaBoxOpen /></InputGroupText>
                                                        <Input
                                                            id={`stock-${color}`}
                                                            type="select"
                                                            value={this.state[stockKey] || ''}
                                                            onChange={(e) => this.setState({ [stockKey]: e.target.value })}
                                                        >
                                                            <option value="">Select stock</option>
                                                            {stockOptions.map((count, idx) => (
                                                                <option key={idx} value={count}>{count}</option>
                                                            ))}
                                                        </Input>
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for={`price-${color}`}>Price</Label>
                                                    <InputGroup>
                                                        <InputGroupText>₹</InputGroupText>
                                                        <Input
                                                            id={`price-${color}`}
                                                            type="number"
                                                            value={this.state[priceKey] || ''}
                                                            onChange={(e) => this.setState({ [priceKey]: e.target.value })}
                                                        />
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for={`offer-${color}`}>Offer Price</Label>
                                                    <InputGroup>
                                                        <InputGroupText>₹</InputGroupText>
                                                        <Input
                                                            id={`offer-${color}`}
                                                            type="number"
                                                            value={this.state[offerKey] || ''}
                                                            onChange={(e) => this.setState({ [offerKey]: e.target.value })}
                                                        />
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <FormGroup>
                                            <Label>Sizes</Label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {sizeOptions.map((size) => {
                                                    const selectedSizes = this.state[sizesKey] || [];
                                                    const isSelected = selectedSizes.includes(size);
                                                    return (
                                                        <label
                                                            key={size}
                                                            className={`btn btn-outline-primary btn-sm ${isSelected ? 'active' : ''}`}
                                                            style={{ userSelect: 'none' }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="d-none"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    let updatedSizes = [...selectedSizes];
                                                                    if (e.target.checked) {
                                                                        updatedSizes.push(size);
                                                                    } else {
                                                                        updatedSizes = updatedSizes.filter(s => s !== size);
                                                                    }
                                                                    this.setState({ [sizesKey]: updatedSizes });
                                                                }}
                                                            />
                                                            {size}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>Images</Label>
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => this.handleVariantImageUpload(e, imageKey)}
                                            />
                                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                                                {(variantImages[imageKey] || []).map((img, i) => (
                                                    <div key={i} style={{ position: 'relative' }}>
                                                        <img src={img.previewUrl} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 5 }} />
                                                        <button
                                                            type="button"
                                                            onClick={() => this.removeVariantImage(imageKey, i)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0, right: 0,
                                                                background: 'rgba(0,0,0,0.6)',
                                                                color: 'white', border: 'none',
                                                                borderRadius: '50%', width: 20, height: 20
                                                            }}
                                                        >×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </FormGroup>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* ---------- Electronics Variant Section ---------- */}
                    {['phone', 'laptop', 'tablet', 'smartwatch'].includes(category?.toLowerCase()) && (
                        <>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Processor</Label>
                                        <InputGroup>
                                            <InputGroupText><FaMicrochip /></InputGroupText>
                                            <Input
                                                type="text"
                                                name="processor"
                                                value={processor || ''}
                                                onChange={this.handleChange}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Colors (comma separated)</Label>
                                        <InputGroup>
                                            <InputGroupText><FaPalette /></InputGroupText>
                                            <Input
                                                type="text"
                                                name="colors"
                                                value={colors || ''}
                                                onChange={this.handleChange}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                            </Row>
                            {parsedColors.map(color => {
                                const ramVal = perColorRamRom[color]?.ram || '';
                                const romVal = perColorRamRom[color]?.rom || '';
                                const ramArray = Array.isArray(ramVal)
                                    ? ramVal
                                    : (ramVal || '').split(',').map(r => r.trim()).filter(Boolean);

                                const romArray = Array.isArray(romVal)
                                    ? romVal
                                    : (romVal || '').split(',').map(r => r.trim()).filter(Boolean);
                                return (
                                    <div key={color} className="mb-4 p-3 border rounded">
                                        <h6>Color: {color}</h6>
                                        <Row>
                                            <Col>
                                                <MultiSelectWithOther
                                                    label="RAM Options"
                                                    icon={FaMemory}
                                                    name="ram"
                                                    options={['4GB', '6GB', '8GB', '12GB', '16GB']}
                                                    selectedValues={perColorRamRom[color]?.ramRaw || []}
                                                    otherInput={perColorRamRom[color]?.ramOtherInput || ''}
                                                    onChange={(vals) => {
                                                        this.setState({
                                                            perColorRamRom: {
                                                                ...perColorRamRom,
                                                                [color]: {
                                                                    ...(perColorRamRom[color] || {}),
                                                                    ramRaw: vals,
                                                                    ram: vals.filter(v => v !== 'Other')
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    onOtherInputChange={(val) => {
                                                        const customVals = val
                                                            .split(',')
                                                            .map(v => v.trim())
                                                            .filter(Boolean);

                                                        const baseVals = (perColorRamRom[color]?.ramRaw || []).filter(v => v !== 'Other');

                                                        this.setState({
                                                            perColorRamRom: {
                                                                ...perColorRamRom,
                                                                [color]: {
                                                                    ...(perColorRamRom[color] || {}),
                                                                    ramOtherInput: val,
                                                                    ram: [...baseVals, ...customVals]
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />

                                            </Col>
                                            <Col>
                                                <MultiSelectWithOther
                                                    label="ROM Options"
                                                    icon={FaHdd}
                                                    name="rom"
                                                    options={['64GB', '128GB', '256GB', '512GB', '1TB']}
                                                    selectedValues={perColorRamRom[color]?.romRaw || []}
                                                    otherInput={perColorRamRom[color]?.romOtherInput || ''}
                                                    onChange={(vals) => {
                                                        const filtered = vals.filter(v => v !== 'Other');
                                                        this.setState({
                                                            perColorRamRom: {
                                                                ...perColorRamRom,
                                                                [color]: {
                                                                    ...(perColorRamRom[color] || {}),
                                                                    romRaw: vals,
                                                                    rom: filtered
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    onOtherInputChange={(val) => {
                                                        const customVals = val.split(',').map(v => v.trim()).filter(Boolean);
                                                        const baseVals = (perColorRamRom[color]?.romRaw || []).filter(v => v !== 'Other');
                                                        this.setState({
                                                            perColorRamRom: {
                                                                ...perColorRamRom,
                                                                [color]: {
                                                                    ...(perColorRamRom[color] || {}),
                                                                    romOtherInput: val,
                                                                    rom: [...baseVals, ...customVals]
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        {/* RAM + ROM variant combinations */}
                                        {(ramArray || []).map(ram =>
                                            (romArray || []).map(rom => {
                                                const trimmedRam = ram.trim();
                                                const trimmedRom = rom.trim();
                                                const key = `${color}_${trimmedRam}_${trimmedRom}`;
                                                const images = variantImages[key] || [];
                                                const priceKey = `price_${key}`;
                                                const offerKey = `offer_${key}`;

                                                return (
                                                    <div key={key} className="mt-3 p-2 border rounded bg-light">
                                                        <h6>{trimmedRam} + {trimmedRom} - {color}</h6>
                                                        <Row>
                                                            <Col>
                                                                <FormGroup>
                                                                    <Label>Stock</Label>
                                                                    <InputGroup>
                                                                        <InputGroupText><FaBoxOpen /></InputGroupText>
                                                                        <Input
                                                                            type="number"
                                                                            value={this.state[`stock_${key}`] || ''}
                                                                            onChange={(e) =>
                                                                                this.setState({ [`stock_${key}`]: e.target.value })
                                                                            }
                                                                        />
                                                                    </InputGroup>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col>
                                                                <FormGroup>
                                                                    <Label>Price</Label>
                                                                    <InputGroup>
                                                                        <InputGroupText>₹</InputGroupText>
                                                                        <Input
                                                                            type="number"
                                                                            value={this.state[priceKey] || ''}
                                                                            onChange={(e) =>
                                                                                this.setState({ [priceKey]: e.target.value })
                                                                            }
                                                                        />
                                                                    </InputGroup>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col>
                                                                <FormGroup>
                                                                    <Label>Offer Price</Label>
                                                                    <InputGroup>
                                                                        <InputGroupText>₹</InputGroupText>
                                                                        <Input
                                                                            type="number"
                                                                            value={this.state[offerKey] || ''}
                                                                            onChange={(e) =>
                                                                                this.setState({ [offerKey]: e.target.value })
                                                                            }
                                                                        />
                                                                    </InputGroup>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>

                                                        <FormGroup>
                                                            <Label>Images</Label>
                                                            <Input
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                onChange={(e) => this.handleVariantImageUpload(e, key)}
                                                            />
                                                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                                                                {images.map((img, i) => (
                                                                    <div key={i} style={{ position: 'relative' }}>
                                                                        <img src={img.previewUrl} alt={`variant-${i}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 5 }} />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => this.removeVariantImage(key, i)}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                right: 0,
                                                                                background: 'rgba(0,0,0,0.6)',
                                                                                color: 'white',
                                                                                border: 'none',
                                                                                borderRadius: '50%',
                                                                                width: 20,
                                                                                height: 20
                                                                            }}
                                                                        >×</button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </FormGroup>
                                                    </div>
                                                );
                                            })
                                        )}

                                    </div>
                                );
                            })}
                        </>
                    )}

                    <Button type="submit" color="primary" disabled={isSubmitting || isFormIncomplete}>
                        {isSubmitting ? <Spinner size="sm" color="light" /> : buttonText}
                    </Button>

                    <Button type="button" color="secondary" className="ms-2" onClick={() => this.setState({ renderLayout: 0 })}>
                        Cancel
                    </Button>
                </Form>
            </div>
        );
    };

    renderDeleteModal() {
        const { isDeleteModalOpen, deleteConfirmationText } = this.state;
        const isConfirmed = deleteConfirmationText.toLowerCase() === 'yes';

        return (
            <Modal isOpen={isDeleteModalOpen} toggle={this.closeDeleteModal}>
                <ModalHeader toggle={this.closeDeleteModal}>Confirm Delete</ModalHeader>
                <ModalBody>
                    <p>Type <strong>yes</strong> to confirm deletion of this product.</p>
                    <InputGroup>
                        <InputGroupText><FaTrash /></InputGroupText>
                        <Input
                            type="text"
                            value={deleteConfirmationText}
                            onChange={this.handleDeleteConfirmationChange}
                            placeholder="Type yes to confirm"
                        />
                    </InputGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" disabled={!isConfirmed} onClick={this.confirmDelete}>Delete</Button>
                    <Button color="secondary" onClick={this.closeDeleteModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}
