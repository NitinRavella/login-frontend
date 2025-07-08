import React, { Component } from 'react';
import {
    Form, FormGroup, Label, Input, Button, Row, Col
} from 'reactstrap';
import { FaPlusCircle, FaTrash } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import api from '../utils/Api';
import ImagePreviewList from '../utils/ImagePreviewList';

const CATEGORY_OPTIONS = [
    { value: '', label: 'Select Category' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'phone', label: 'Phone' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'smartwatch', label: 'Smartwatch' }
];

const RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB', '16GB', '24GB'];
const ROM_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

class ProductForm extends Component {
    constructor(props) {
        super(props);
        const initialData = props.initialData || {};
        const isElectronics = ['phone', 'laptop', 'tablet', 'smartwatch'].includes(
            (initialData.category || '').toLowerCase()
        );

        const mainImagePreviews = (initialData.mainImages || []).map(url => ({ url }));
        const variants = (initialData.variants || []).map(v => ({
            color: v.color || '',
            price: v.price || '',
            offerPrice: v.offerPrice || '',
            ram: v.ram || '',
            rom: v.rom || '',
            stock: v.stock || '',
            sizeStock: v.sizeStock?.length ? v.sizeStock : [{ size: '', stock: '' }],
            thumbnails: [], // actual File objects (if uploading new)
            thumbnailPreviews: Array.isArray(v.images) ? v.images.map(url => ({ url })) : []
        }));
        this.state = {
            name: initialData.name || '',
            description: initialData.description || '',
            brand: initialData.brand || '',
            category: initialData.category || '',
            mainImages: [], // actual file objects (for upload)
            mainImagePreviews, // for display only
            variants,
            specList: Object.entries(initialData.specifications || {}).map(([key, value]) => ({ key, value })) || [{ key: '', value: '' }],
            isElectronics,
            errors: {},
            customSizeInputs: {}
        };

    }

    componentDidMount() {
        const { isEdit, initialData } = this.props;
        if (isEdit && initialData) {
            this.prefillForm(initialData);
        }
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.initialData &&
            this.props.initialData._id !== prevProps.initialData?._id
        ) {
            const initialData = this.props.initialData;
            const isElectronics = ['phone', 'laptop', 'tablet', 'smartwatch'].includes(
                (initialData.category || '').toLowerCase()
            );

            this.setState({
                name: initialData.name || '',
                description: initialData.description || '',
                brand: initialData.brand || '',
                category: initialData.category || '',
                mainImages: [],
                mainImagePreviews: [],
                variants: initialData.variants || [
                    {
                        color: '',
                        price: '',
                        offerPrice: '',
                        thumbnails: [],
                        thumbnailPreviews: [],
                        sizeStock: [{ size: '', stock: '' }],
                        ram: '',
                        ramOther: '',
                        rom: '',
                        romOther: '',
                        stock: ''
                    }
                ],
                specList: Object.entries(initialData.specifications || {}).map(([key, value]) => ({ key, value })) || [{ key: '', value: '' }],
                isElectronics,
                errors: {},
                customSizeInputs: {}
            });
        }
    }

    prefillForm = (data) => {
        console.log('data', data);

        const isElectronics = ['phone', 'laptop', 'tablet', 'smartwatch'].includes(data.category?.toLowerCase());
        const isFashion = ['clothing', 'shoes', 'apparel'].includes(data.category?.toLowerCase());

        this.setState({
            name: data.name || '',
            brand: data.brand || '',
            description: data.description || '',
            category: data.category || '',
            specList: Object.entries(data.specifications || {}).map(([key, value]) => ({ key, value })),
            mainImages: [], // browser cannot re-use file inputs
            isElectronics,

            variants: (data.variants || []).map(v => ({
                color: v.color || '',
                price: v.price ?? '',
                offerPrice: v.offerPrice ?? '',
                thumbnails: [], // will be re-uploaded
                thumbnailPreviews: Array.isArray(v.images) ? v.images.map(url => ({ url })) : [],

                // Fashion sizes
                sizeStock: isFashion ? v.sizeStock || [] : [],

                // Electronics ram/rom/stock
                ram: isElectronics ? v.ram || '' : '',
                rom: isElectronics ? v.rom || '' : '',
                stock: isElectronics ? v.stock || 0 : ''
            }))
        });
    };


    validate = () => {
        const errors = {};
        const { name, description, brand, category } = this.state;
        if (!name) errors.name = 'Product name is required';
        if (!description) errors.description = 'Description is required';
        if (!brand) errors.brand = 'Brand is required';
        if (!category) errors.category = 'Category is required';
        this.state.variants.forEach((variant, vIdx) => {
            if (!this.state.isElectronics) {
                variant.sizeStock.forEach((s, sIdx) => {
                    if (s.stock === '' || isNaN(s.stock) || Number(s.stock) < 0) {
                        errors[`variant-${vIdx}-size-${sIdx}`] = `Invalid stock for size ${s.size}`;
                    }
                });
            } else {
                if (variant.variantOptions === '' || isNaN(variant.variantOptions) || Number(variant.variantOptions) < 0) {
                    errors[`variant-${vIdx}-stock`] = 'Stock must be a non-negative number';
                }
            }
        });

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleCategoryChange = (e) => {
        const category = e.target.value;
        const isElectronics = ['phone', 'laptop', 'tablet', 'smartwatch'].includes(category.toLowerCase());
        this.setState({ category, isElectronics });
    };

    handleMainImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(file => ({
            url: URL.createObjectURL(file),
            file
        }));

        this.setState({
            mainImages: files,
            mainImagePreviews: previews
        });
    };



    handleVariantChange = (index, field, value) => {
        const variants = [...this.state.variants];
        variants[index][field] = value;
        this.setState({ variants });
    };

    handleCustomSizeChange = (index, value) => {
        const inputs = [...this.state.customSizeInputs];
        inputs[index] = value;
        this.setState({ customSizeInputs: inputs });
    };

    // addCustomSize = (index) => {
    //     const size = this.state.customSizeInputs[index]?.trim();
    //     if (!size) return;

    //     const variants = [...this.state.variants];
    //     const exists = variants[index].sizeStock.some(s => s.size === size);
    //     if (!exists) {
    //         variants[index].sizeStock.push({ size, stock: '' });
    //         const inputs = [...this.state.customSizeInputs];
    //         inputs[index] = '';
    //         this.setState({ variants, customSizeInputs: inputs });
    //     }
    // };

    handleSizeStockChange = (variantIndex, sizeIndex, field, value) => {
        const variants = [...this.state.variants];
        variants[variantIndex].sizeStock[sizeIndex][field] = value;
        this.setState({ variants });
    };

    addSizeStock = (variantIndex) => {
        const variants = [...this.state.variants];
        variants[variantIndex].sizeStock.push({ size: '', stock: '' });
        this.setState({ variants });
    };

    addSpec = () => {
        this.setState({ specList: [...this.state.specList, { key: '', value: '' }] });
    };

    removeSpec = (index) => {
        const specList = [...this.state.specList];
        specList.splice(index, 1);
        this.setState({ specList });
    };

    handleSpecChange = (index, field, value) => {
        const specList = [...this.state.specList];
        specList[index][field] = value;
        this.setState({ specList });
    };

    addVariant = () => {
        this.setState({
            variants: [
                ...this.state.variants,
                {
                    color: '',
                    price: '',
                    offerPrice: '',
                    thumbnails: [],
                    sizeStock: [{ size: '', stock: '' }],
                    ram: '',
                    ramOther: '',
                    rom: '',
                    romOther: '',
                    stock: ''
                }
            ]
        });
    };

    removeVariant = (index) => {
        const variants = [...this.state.variants];
        variants.splice(index, 1);
        this.setState({ variants });
    };

    handleVariantImageUpload = (e, index) => {
        const files = Array.from(e.target.files);
        const previews = files.map(file => ({
            url: URL.createObjectURL(file),
            file
        }));

        const updatedVariants = [...this.state.variants];
        updatedVariants[index].thumbnails = files;
        updatedVariants[index].thumbnailPreviews = previews;

        this.setState({ variants: updatedVariants });
    };


    handleRemoveVariantImage = (variantIndex, imageIndex) => {
        const variants = [...this.state.variants];
        const variant = { ...variants[variantIndex] };

        variant.thumbnailPreviews = [...variant.thumbnailPreviews];
        variant.thumbnailPreviews.splice(imageIndex, 1);

        if (variant.thumbnails) {
            variant.thumbnails = [...variant.thumbnails];
            variant.thumbnails.splice(imageIndex, 1);
        }

        variants[variantIndex] = variant;
        this.setState({ variants });
    };


    handleSizeSelect = (e, index) => {
        const selectedSizes = Array.from(e.target.selectedOptions).map(opt => opt.value);
        const currentStocks = this.state.variants[index].sizeStock;
        const updated = selectedSizes.map(size => {
            const existing = currentStocks.find(s => s.size === size);
            return { size, stock: existing?.stock || '' };
        });
        this.handleVariantChange(index, 'sizeStock', updated);
    };

    addVariantOption = (variantIndex) => {
        const variants = [...this.state.variants];
        const currentOptions = variants[variantIndex].variantOptions || [];
        currentOptions.push({ ram: '', rom: '', stock: '' });
        variants[variantIndex].variantOptions = currentOptions;
        this.setState({ variants });
    };

    removeVariantOption = (variantIndex, optionIndex) => {
        const variants = [...this.state.variants];
        variants[variantIndex].variantOptions.splice(optionIndex, 1);
        this.setState({ variants });
    };

    handleVariantOptionChange = (variantIndex, optionIndex, key, value) => {
        const variants = [...this.state.variants];
        if (!variants[variantIndex].variantOptions) {
            variants[variantIndex].variantOptions = [];
        }
        variants[variantIndex].variantOptions[optionIndex][key] = value;
        this.setState({ variants });
    };


    handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const { name, description, brand, category, specList, mainImages, variants, isElectronics } = this.state;

        formData.append('name', name);
        formData.append('description', description);
        formData.append('brand', brand);
        formData.append('category', category);

        const specifications = {};
        specList.forEach(spec => {
            if (spec.key?.trim() && spec.value?.trim()) {
                specifications[spec.key.trim()] = spec.value.trim();
            }
        });
        formData.append('specifications', JSON.stringify(specifications));

        // Upload main product images
        mainImages.forEach(img => {
            const file = img instanceof File ? img : img.file || null;
            if (file instanceof File) {
                formData.append('images', file);
            }
        });

        // Track uploaded image files to avoid duplicates
        const uploadedFilesSet = new Set();
        const variantsData = variants.map(v => {
            const thumbnails = [];

            (v.thumbnails || []).forEach(file => {
                let fileObj = null;

                if (file instanceof File) {
                    if (!uploadedFilesSet.has(file.name)) {
                        formData.append('variantImages', file);
                        uploadedFilesSet.add(file.name);
                    }
                    thumbnails.push(file.name);
                } else if (file?.url) {
                    // Preloaded image from server (edit mode), ignore re-upload, but preserve URL
                    thumbnails.push(file.url);
                }
            });

            const variantEntry = {
                _id: v._id || undefined,
                color: v.color,
                price: Number(v.price),
                offerPrice: v.offerPrice ? Number(v.offerPrice) : null,
                thumbnails
            };

            if (isElectronics) {
                variantEntry.ram = v.ram?.trim() || '';
                variantEntry.rom = v.rom?.trim() || '';
                variantEntry.stock = Number(v.stock) || 0;
            } else {
                variantEntry.sizeStock = (v.sizeStock || []).map(s => ({
                    size: s.size?.trim() || '',
                    stock: Number(s.stock) || 0
                })).filter(s => s.size);
            }
            return variantEntry;
        });

        formData.append('variants', JSON.stringify(variantsData));

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (this.props.initialData?._id) {
                await api.put(`/products/${this.props.initialData._id}`, formData, config);
            } else {
                await api.post('/products', formData, config);
            }

            alert('Product submitted successfully');
            if (this.props.onSuccess) this.props.onSuccess();
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit product');
        }
    };




    render() {
        const { isElectronics, name, description, brand, category, variants, mainImagePreviews, specList, customSizeInputs, errors } = this.state;
        const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const { isEdit, onCancel } = this.props;
        return (
            <Form onSubmit={this.handleSubmit} className="p-4 bg-white rounded shadow">
                <Row>
                    <Col>
                        <h4 className="mb-3">{isEdit ? 'Edit Product' : 'Add New Product'}</h4>
                    </Col>
                    <Col className="text-end">
                        {onCancel && (
                            <Button color="warning"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onCancel();
                                }}
                            >
                                <IoMdClose />
                            </Button>
                        )}
                    </Col>
                </Row>
                <FormGroup>
                    <Label>Name</Label>
                    <Input type="text" name="name" value={name || ''} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup>
                    <Label>Description</Label>
                    <Input type="textarea" name="description" value={description || ''} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup>
                    <Label>Brand</Label>
                    <Input type="text" name="brand" value={brand || ''} onChange={this.handleChange} />
                </FormGroup>

                <FormGroup>
                    <Label>Category</Label>
                    <Input type="select" name="category" value={category || ''} onChange={this.handleCategoryChange}>
                        {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Input>
                </FormGroup>

                <h5>Specifications</h5>
                {specList.map((spec, index) => (
                    <Row key={index} className="mb-2">
                        <Col md={5}>
                            <Input
                                type="text"
                                placeholder="Key"
                                value={spec.key || ''}
                                onChange={(e) => this.handleSpecChange(index, 'key', e.target.value)}
                            />
                        </Col>
                        <Col md={5}>
                            <Input
                                type="text"
                                placeholder="Value"
                                value={spec.value || ''}
                                onChange={(e) => this.handleSpecChange(index, 'value', e.target.value)}
                            />
                        </Col>
                        <Col md={2}>
                            <Button color="danger" onClick={() => this.removeSpec(index)}>🗑</Button>
                        </Col>
                    </Row>
                ))}
                <Button color="success" size="sm" onClick={this.addSpec}>+ Add Spec</Button>

                <FormGroup>
                    <Label>Main Images</Label>
                    <Input
                        type="file"
                        multiple
                        onChange={this.handleMainImageUpload}
                        accept="image/*"
                    />
                    <span className='help-text'>Don't add the same name file</span>
                    <ImagePreviewList
                        label={false}
                        images={mainImagePreviews}
                        onChange={(newPreviews) => {
                            this.setState({
                                mainImagePreviews: newPreviews,
                                mainImages: newPreviews.map(p =>
                                    p instanceof File ? p : p.file || null
                                ).filter(Boolean)
                            });
                        }}
                    />
                </FormGroup>
                <hr />
                <h5>Variants</h5>
                {variants.map((variant, index) => (
                    <div key={index} className="p-3 mb-3 border rounded bg-light">
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label>Color</Label>
                                    <Input type="text" value={variant.color || ''} onChange={e => this.handleVariantChange(index, 'color', e.target.value)} />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label>Price</Label>
                                    <Input type="number" value={variant.price ?? ''} onChange={e => this.handleVariantChange(index, 'price', e.target.value)} />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label>Offer Price</Label>
                                    <Input type="number" value={variant.offerPrice} onChange={e => this.handleVariantChange(index, 'offerPrice', e.target.value)} />
                                </FormGroup>
                            </Col>
                        </Row>

                        <div key={index} className="mb-3">
                            <FormGroup>
                                <Label>Variant Images</Label>
                                <Input
                                    type="file"
                                    multiple
                                    onChange={(e) => this.handleVariantImageUpload(e, index)}
                                />
                                <span className='help-text'>Don't add the same name file</span>
                                <ImagePreviewList
                                    label={false}
                                    images={variant.thumbnailPreviews}
                                    onChange={(newPreviews) => {
                                        const updatedVariants = [...this.state.variants];
                                        updatedVariants[index].thumbnailPreviews = newPreviews;
                                        updatedVariants[index].thumbnails = newPreviews.map(p =>
                                            p instanceof File ? p : p.file || null
                                        ).filter(Boolean);
                                        this.setState({ variants: updatedVariants });
                                    }}
                                />
                            </FormGroup>
                        </div>

                        {!isElectronics && (
                            <>
                                <FormGroup>
                                    <Label>Sizes</Label>
                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                        {SIZE_OPTIONS.map((size) => {
                                            const isSelected = variant.sizeStock.some(s => s.size === size);
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
                                                            const updated = [...variant.sizeStock];
                                                            if (e.target.checked) {
                                                                updated.push({ size, stock: '' });
                                                            } else {
                                                                const indexToRemove = updated.findIndex(s => s.size === size);
                                                                if (indexToRemove !== -1) updated.splice(indexToRemove, 1);
                                                            }
                                                            this.handleVariantChange(index, 'sizeStock', updated);
                                                        }}
                                                    />
                                                    {size}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </FormGroup>
                                {variant.sizeStock.map((item, sIndex) => {
                                    if (!item.size || item.size.trim() === '') return null;
                                    return (
                                        <FormGroup key={sIndex}>
                                            <Label>{item.size} Stock</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.stock}
                                                onChange={e => this.handleSizeStockChange(index, sIndex, 'stock', e.target.value)}
                                            />
                                        </FormGroup>
                                    );
                                })}

                                {/* Optional: Add custom size */}
                                <Row className="align-items-center">
                                    <Col md={8}>
                                        <Input
                                            type="text"
                                            placeholder="Custom size"
                                            value={customSizeInputs[index] || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                this.setState((prev) => ({
                                                    customSizeInputs: { ...prev.customSizeInputs, [index]: value }
                                                }));
                                            }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Button
                                            size="sm"
                                            color="secondary"
                                            onClick={() => {
                                                const newSize = customSizeInputs[index]?.trim();
                                                if (newSize) {
                                                    const updated = [...variant.sizeStock];
                                                    if (!updated.find(s => s.size === newSize)) {
                                                        updated.push({ size: newSize, stock: '' });
                                                        this.handleVariantChange(index, 'sizeStock', updated);
                                                        this.setState((prev) => ({
                                                            customSizeInputs: { ...prev.customSizeInputs, [index]: '' }
                                                        }));
                                                    }
                                                }
                                            }}
                                        >
                                            + Add Size
                                        </Button>
                                    </Col>
                                </Row>
                            </>
                        )}
                        {isElectronics && (
                            <Row>
                                {/* RAM */}
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>RAM</Label>
                                        <div className="d-flex flex-wrap gap-2 mt-1">
                                            {RAM_OPTIONS.map((option, i) => (
                                                <label
                                                    key={i}
                                                    className={`btn btn-sm btn-outline-primary ${variant.ram === option ? 'active' : ''}`}
                                                    style={{ borderRadius: '20px', padding: '4px 12px' }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`ram-${index}`}
                                                        value={option}
                                                        checked={variant.ram === option}
                                                        onChange={() => this.handleVariantChange(index, 'ram', option)}
                                                        style={{ display: 'none' }}
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                            {/* Custom RAM Option */}
                                            <label
                                                className={`btn btn-sm btn-outline-secondary ${!RAM_OPTIONS.includes(variant.ram) ? 'active' : ''}`}
                                                style={{ borderRadius: '20px', padding: '4px 12px' }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`ram-${index}`}
                                                    checked={!RAM_OPTIONS.includes(variant.ram)}
                                                    onChange={() => this.handleVariantChange(index, 'ram', '')}
                                                    style={{ display: 'none' }}
                                                />
                                                Custom
                                            </label>
                                            {!RAM_OPTIONS.includes(variant.ram) && (
                                                <Input
                                                    type="text"
                                                    value={variant.ram || ''}
                                                    onChange={e => this.handleVariantChange(index, 'ram', e.target.value)}
                                                    className="mt-2"
                                                    placeholder="Enter custom RAM"
                                                />
                                            )}
                                        </div>
                                    </FormGroup>
                                </Col>

                                {/* ROM */}
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>ROM</Label>
                                        <div className="d-flex flex-wrap gap-2 mt-1">
                                            {ROM_OPTIONS.map((option, i) => (
                                                <label
                                                    key={i}
                                                    className={`btn btn-sm btn-outline-primary ${variant.rom === option ? 'active' : ''}`}
                                                    style={{ borderRadius: '20px', padding: '4px 12px' }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`rom-${index}`}
                                                        value={option}
                                                        checked={variant.rom === option}
                                                        onChange={() => this.handleVariantChange(index, 'rom', option)}
                                                        style={{ display: 'none' }}
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                            {/* Custom ROM Option */}
                                            <label
                                                className={`btn btn-sm btn-outline-secondary ${!ROM_OPTIONS.includes(variant.rom) ? 'active' : ''}`}
                                                style={{ borderRadius: '20px', padding: '4px 12px' }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`rom-${index}`}
                                                    checked={!ROM_OPTIONS.includes(variant.rom)}
                                                    onChange={() => this.handleVariantChange(index, 'rom', '')}
                                                    style={{ display: 'none' }}
                                                />
                                                Custom
                                            </label>
                                            {!ROM_OPTIONS.includes(variant.rom) && (
                                                <Input
                                                    type="text"
                                                    value={variant.rom || ''}
                                                    onChange={e => this.handleVariantChange(index, 'rom', e.target.value)}
                                                    className="mt-2"
                                                    placeholder="Enter custom ROM"
                                                />
                                            )}
                                        </div>
                                    </FormGroup>
                                </Col>

                                {/* STOCK */}
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Stock</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={variant.stock || ''}
                                            onChange={e => this.handleVariantChange(index, 'stock', e.target.value)}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        )}


                        <Button color="danger" size="sm" onClick={() => this.removeVariant(index)}>
                            <FaTrash /> Remove Variant
                        </Button>
                    </div>
                ))}

                <Button color="primary" onClick={this.addVariant} className="mt-3">
                    <FaPlusCircle /> Add Variant
                </Button>

                <hr />
                <Button color={isEdit ? 'warning' : 'success'}>
                    {isEdit ? 'Update Product' : 'Create Product'}
                </Button>
            </Form>
        );
    }
}

export default ProductForm;
