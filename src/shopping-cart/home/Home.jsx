import React from 'react';
import { Button, Container, Row, Col, Input, Card, CardBody, CardTitle, Spinner, CardFooter, Toast, ToastBody, ToastHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FcFilledFilter } from "react-icons/fc";
import api from '../utils/Api';
import ProductFilters from './ProductFilters';
import { toast } from 'react-toastify';
import HomeHelper from './HomeHelper';
import { connect } from 'react-redux';
import { addToCart, toggleLike, fetchLikedProducts } from '../../redux/actions/productActions';
import '../../styles/Home.css';
import RatingDisplay from '../components/RatingSummary';
import ProductCard from '../components/ProductCard';

class Home extends HomeHelper {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            renderLayout: 0,
            products: [],
            filteredProducts: [],
            searchQuery: '',
            categories: [],
            name: '',
            description: '',
            offerPrice: '',
            price: '',
            brand: '',
            category: '',
            stock: '',
            imageFiles: [],
            existingImages: [],
            removedImageIndexes: [],
            imagePreview: null,
            editingProductId: null,
            isDeleteModalOpen: false,
            productIdToDelete: null,
            deleteConfirmationText: '',
            showFilters: false,
            isSubmitting: false,
            toastVisible: false,
            toastMessage: '',
            toastColor: 'success',
            variantImages: {},
            customRam: '',
            customRom: '',
            customRamUsed: false,
            customRomUsed: false,
            ram: '',
            rom: '',
            processor: '',
            sizes: '',
            colors: ''
        };
    }

    componentDidMount() {
        this.fetchProducts();
        const verifyUser = sessionStorage.getItem('userId');
        if (verifyUser) {
            this.props.fetchLikedProducts();
        }
    }

    componentWillUnmount() {
        this.state.imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
    }

    fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            const categories = [...new Set(response.data.map(product => product.category))];
            this.setState({
                products: response.data,
                filteredProducts: response.data,
                categories,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    handleFilterChange = (filters) => {
        const { products } = this.state;
        let filtered = [...products];

        if (filters.selectedCategory && filters.selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === filters.selectedCategory);
        }

        if (filters.selectedBrands && filters.selectedBrands.length > 0) {
            filtered = filtered.filter(p => filters.selectedBrands.includes(p.brand));
        }

        if (filters.minPrice) {
            filtered = filtered.filter(p => parseFloat(p.price) >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(p => parseFloat(p.price) <= parseFloat(filters.maxPrice));
        }

        if (filters.inStockOnly === true) {
            filtered = filtered.filter(p => p.stock > 0);
        }

        this.setState({ filteredProducts: filtered });
    };

    addProducts = () => {
        this.setState({ renderLayout: 1 });
    };

    editProducts = (product) => {
        const variantImages = {};
        const perColorRamRom = {};
        const variants = product.variants && product.variants.length > 0 ? product.variants : [product];
        const stockState = {};
        const sizeState = {};
        const idMap = {};

        const defaultRamOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
        const defaultRomOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];

        const isElectronics = ['phone', 'laptop', 'tablet', 'smartwatch'].includes(product.category?.toLowerCase());
        const isFashion = ['clothing', 'shoes'].includes(product.category?.toLowerCase());
        const isMain = product.variants && product.variants.length > 0;
        const isVariant = !isMain;

        if (isMain) {
            variants.forEach(variant => {
                const color = variant.color || '';
                const ram = variant.ram || '';
                const rom = variant.rom || '';
                const key = isElectronics ? `${color}_${ram}_${rom}` : color;

                idMap[key] = variant._id;

                // Images
                if (Array.isArray(variant.thumbnails)) {
                    variantImages[key] = variant.thumbnails.map(url => ({
                        previewUrl: url,
                        file: null,
                        originalname: url.split('/').pop()
                    }));
                }

                if (isFashion && color) {
                    stockState[`stock_${color}`] = variant.stock || '';
                    sizeState[`sizes_${color}`] = (variant.sizes || []).join(', ');
                    stockState[`price_${color}`] = variant.price || '';
                    stockState[`offer_${color}`] = variant.offerPrice || '';
                }

                if (isElectronics && color) {
                    if (!perColorRamRom[color]) {
                        perColorRamRom[color] = {
                            ramRaw: [],
                            ramOtherInput: '',
                            romRaw: [],
                            romOtherInput: '',
                            ram: [],
                            rom: []
                        };
                    }

                    // RAM
                    if (ram) {
                        if (defaultRamOptions.includes(ram)) {
                            if (!perColorRamRom[color].ramRaw.includes(ram)) {
                                perColorRamRom[color].ramRaw.push(ram);
                            }
                        } else {
                            const existingOthers = perColorRamRom[color].ramOtherInput
                                ? perColorRamRom[color].ramOtherInput.split(',').map(r => r.trim())
                                : [];
                            if (!existingOthers.includes(ram)) {
                                existingOthers.push(ram);
                                perColorRamRom[color].ramOtherInput = existingOthers.join(', ');
                            }
                        }
                    }

                    // ROM
                    if (rom) {
                        if (defaultRomOptions.includes(rom)) {
                            if (!perColorRamRom[color].romRaw.includes(rom)) {
                                perColorRamRom[color].romRaw.push(rom);
                            }
                        } else {
                            const existingOthers = perColorRamRom[color].romOtherInput
                                ? perColorRamRom[color].romOtherInput.split(',').map(r => r.trim())
                                : [];
                            if (!existingOthers.includes(rom)) {
                                existingOthers.push(rom);
                                perColorRamRom[color].romOtherInput = existingOthers.join(', ');
                            }
                        }
                    }

                    // Combine for form fields
                    const allRams = [
                        ...perColorRamRom[color].ramRaw,
                        ...(perColorRamRom[color].ramOtherInput
                            ? perColorRamRom[color].ramOtherInput.split(',').map(r => r.trim())
                            : [])
                    ];
                    const allRoms = [
                        ...perColorRamRom[color].romRaw,
                        ...(perColorRamRom[color].romOtherInput
                            ? perColorRamRom[color].romOtherInput.split(',').map(r => r.trim())
                            : [])
                    ];
                    perColorRamRom[color].ram = [...new Set(allRams)].filter(Boolean);
                    perColorRamRom[color].rom = [...new Set(allRoms)].filter(Boolean);

                    const variantKey = `${color}_${ram}_${rom}`;
                    stockState[`stock_${variantKey}`] = variant.stock || '';
                    stockState[`price_${variantKey}`] = variant.price || '';
                    stockState[`offer_${variantKey}`] = variant.offerPrice || '';
                }
            });
        }

        if (isVariant) {
            const color = Array.isArray(product.colors) ? product.colors[0] : product.color || '';
            const ram = product.ram || '';
            const rom = product.rom || '';
            const key = isElectronics ? `${color}_${ram}_${rom}` : color;

            perColorRamRom[color] = {
                ramRaw: [],
                ramOtherInput: '',
                romRaw: [],
                romOtherInput: '',
                ram: [],
                rom: []
            };

            if (defaultRamOptions.includes(ram)) {
                perColorRamRom[color].ramRaw.push(ram);
            } else if (ram) {
                perColorRamRom[color].ramOtherInput = ram;
            }

            if (defaultRomOptions.includes(rom)) {
                perColorRamRom[color].romRaw.push(rom);
            } else if (rom) {
                perColorRamRom[color].romOtherInput = rom;
            }

            const allRams = [
                ...perColorRamRom[color].ramRaw,
                ...(perColorRamRom[color].ramOtherInput ? perColorRamRom[color].ramOtherInput.split(',').map(r => r.trim()) : [])
            ];
            const allRoms = [
                ...perColorRamRom[color].romRaw,
                ...(perColorRamRom[color].romOtherInput ? perColorRamRom[color].romOtherInput.split(',').map(r => r.trim()) : [])
            ];
            perColorRamRom[color].ram = [...new Set(allRams)].filter(Boolean);
            perColorRamRom[color].rom = [...new Set(allRoms)].filter(Boolean);

            stockState[`stock_${key}`] = product.stock || '';
            stockState[`price_${key}`] = product.price || '';
            stockState[`offer_${key}`] = product.offerPrice || '';

            if (isFashion && color) {
                sizeState[`sizes_${color}`] = (product.sizes || []).join(', ');
            }

            if (Array.isArray(product.productImages)) {
                variantImages[key] = product.productImages.map(img => {
                    const url = typeof img === 'string' ? img : img.url;
                    return {
                        previewUrl: url,
                        file: null,
                        originalname: url.split('/').pop()
                    };
                });
            }

            idMap[key] = product._id;
        }

        this.setState({
            renderLayout: 2,
            editingProductId: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            brand: product.brand || '',
            offerPrice: product.offerPrice || '',
            category: product.category,
            stock: product.stock || 0,
            existingImages: product.productImages || [],
            removedImageIndexes: [],
            imageFiles: [],
            ram: product.ram || '',
            rom: product.rom || '',
            processor: product?.processor || '',
            colors: product.colors?.length ? product.colors.join(', ') : product.color || '',
            sizes: product.sizes?.length ? product.sizes.join(', ') : '',
            variantImages,
            perColorRamRom,
            variantIdMap: idMap,
            ...stockState,
            ...sizeState,
            isMainProduct: isMain
        });
    };

    closeModal = () => {
        this.setState({
            renderLayout: 0,
            name: '',
            description: '',
            price: '',
            category: '',
            imageFiles: [],
            imagePreviews: [],
            stock: '',
            brand: '',
            ram: '',
            rom: '',
            processor: '',
            sizes: '',
            colors: '',
            editingProductId: null
        });
    };

    openDeleteModal = (productId) => {
        this.setState({
            isDeleteModalOpen: true,
            productIdToDelete: productId,
            deleteConfirmationText: '',
        });
    };

    closeDeleteModal = () => {
        this.setState({
            isDeleteModalOpen: false,
            productIdToDelete: null,
            deleteConfirmationText: '',
        });
    };

    handleDeleteConfirmationChange = (e) => {
        this.setState({ deleteConfirmationText: e.target.value });
    };

    handleSearch = () => {
        const { searchQuery, products } = this.state;
        const query = searchQuery.toLowerCase().trim();

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

        this.setState({ filteredProducts: filtered });
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, () => {
            if (e.target.name === 'searchQuery') {
                this.handleSearch();
            }
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const {
            name, description, price, category, offerPrice, brand,
            processor, colors, variantImages = {}, perColorRamRom = {}
        } = this.state;

        if (!name || !brand || !description || !category || !brand) {
            toast.error("All fields are required!");
            return;
        }

        this.setState({ isSubmitting: true });

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        // formData.append('price', price);
        formData.append('category', category);
        // formData.append('offerPrice', offerPrice || ''); 
        formData.append('brand', brand);
        formData.append('colors', colors || '');
        formData.append('specifications', JSON.stringify({ processor: processor || '' }));

        const lowerCategory = category.toLowerCase();
        const colorArr = (colors || '').split(',').map(c => c.trim()).filter(Boolean);
        const variants = [];

        // FASHION PRODUCTS: clothing/shoes
        if (['shoes', 'clothing'].includes(lowerCategory)) {
            for (let color of colorArr) {
                const sizes = this.state[`sizes_${color}`] || '';
                const sizeArr = Array.isArray(sizes) ? sizes : (sizes || '').split(',').map(s => s.trim()).filter(Boolean);
                const stockVal = this.state[`stock_${color}`] || '';
                const images = variantImages[color] || [];
                const variantPrice = this.state[`price_${color}`] || '';
                const variantOffer = this.state[`offer_${color}`] || '';

                if (!images.length) {
                    toast.warn(`Please upload images for color: ${color}`);
                    this.setState({ isSubmitting: false });
                    return;
                }

                images.forEach(imgObj => {
                    formData.append('variantImages', imgObj.file);
                });

                variants.push({
                    name: color,
                    color,
                    stock: stockVal,
                    sizes: sizeArr,
                    price: variantPrice,
                    offerPrice: variantOffer,
                    thumbnails: images
                        .filter(img => img.file?.name)
                        .map(img => img.file.name),
                });
            }
        }

        // ELECTRONICS PRODUCTS
        if (['phone', 'laptop', 'tablet', 'smartwatch'].includes(lowerCategory)) {
            for (let color of colorArr) {
                console.log('perColorRamRom', perColorRamRom, color)
                const ramList = Array.isArray(perColorRamRom[color]?.ram)
                    ? perColorRamRom[color].ram
                    : (perColorRamRom[color]?.ram || '').split(',').map(r => r.trim()).filter(Boolean);
                const ramOther = perColorRamRom[color]?.ramOther?.trim();
                const ramArr = [...ramList, ...(ramOther ? [ramOther] : [])];

                const romList = Array.isArray(perColorRamRom[color]?.rom)
                    ? perColorRamRom[color].rom
                    : (perColorRamRom[color]?.rom || '').split(',').map(r => r.trim()).filter(Boolean);
                const romOther = perColorRamRom[color]?.romOther?.trim();
                const romArr = [...romList, ...(romOther ? [romOther] : [])];

                for (let ram of ramArr) {
                    for (let rom of romArr) {
                        const key = `${color}_${ram}_${rom}`;
                        const stockVal = this.state[`stock_${key}`] || '';
                        const images = variantImages[key] || [];
                        const variantPrice = this.state[`price_${key}`] || '';
                        const variantOffer = this.state[`offer_${key}`] || '';

                        if (!images.length) {
                            toast.warn(`Please upload images for variant: ${ram} + ${rom} - ${color}`);
                            this.setState({ isSubmitting: false });
                            return;
                        }

                        images.forEach(imgObj => {
                            formData.append('variantImages', imgObj.file);
                        });
                        console.log('stockVal', stockVal, 'ram', ram, 'rom', rom, 'color', color, 'images', images);
                        variants.push({
                            name: `${ram} + ${rom} - ${color}`,
                            color,
                            ram,
                            rom,
                            stock: stockVal,
                            price: variantPrice,
                            offerPrice: variantOffer,
                            thumbnails: images
                                .filter(img => img.file?.name)
                                .map(img => img.file.name),
                        });
                    }
                }
            }
        }

        // Send the variant array
        formData.append('variants', JSON.stringify(variants));

        try {
            await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Product added successfully!");
            this.fetchProducts();
            this.closeModal();
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error("Failed to add product.");
        } finally {
            this.setState({ isSubmitting: false });
        }
    };

    handleUpdate = async (e) => {
        e.preventDefault();
        this.setState({ isSubmitting: true });
        const {
            name, description, brand, category, price, offerPrice, processor,
            colors, perColorRamRom, variantImages, editingProductId, isMainProduct,
            variantIdMap = {}
        } = this.state;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('brand', brand || '');
        formData.append('category', category);
        // formData.append('price', price);
        // if (offerPrice) formData.append('offerPrice', offerPrice);

        const isElectronics = ['phone', 'laptop', 'tablet', 'smartwatch'].includes(category?.toLowerCase());
        const isFashion = ['clothing', 'shoes'].includes(category?.toLowerCase());
        const parsedColors = (colors || '').split(',').map(c => c.trim()).filter(Boolean);

        if (isMainProduct) {
            if (isElectronics && processor) {
                formData.append('specifications', JSON.stringify({ processor }));
            }

            const variantList = [];

            if (isFashion) {
                for (let color of parsedColors) {
                    const stock = this.state[`stock_${color}`] || 0;
                    const sizesRaw = this.state[`sizes_${color}`] || '';
                    const sizes = Array.isArray(sizesRaw) ? sizesRaw : (sizesRaw || '').split(',').map(s => s.trim()).filter(Boolean);
                    const thumbnails = (variantImages[color] || [])
                        .map(img => img.originalname || img.file?.name)
                        .filter(Boolean);

                    const variantData = { color, stock, sizes, thumbnails };
                    if (variantIdMap[color]) {
                        variantData._id = variantIdMap[color];
                    }

                    variantList.push(variantData);

                    (variantImages[color] || []).forEach(img => {
                        if (img.file) formData.append('variantImages', img.file, img.originalname);
                    });
                }
            } else if (isElectronics) {
                for (let color of parsedColors) {
                    const ramList = (perColorRamRom[color]?.ram || '').split(',').map(r => r.trim()).filter(Boolean);
                    const romList = (perColorRamRom[color]?.rom || '').split(',').map(r => r.trim()).filter(Boolean);

                    for (let ram of ramList) {
                        for (let rom of romList) {
                            const key = `${color}_${ram}_${rom}`;
                            const stock = this.state[`stock_${key}`] || 0;
                            const thumbnails = (variantImages[color] || [])
                                .map(img => img.originalname || img.file?.name)
                                .filter(Boolean);
                            console.log('variantImages', variantImages, key, thumbnails);
                            const variantData = { color, ram, rom, stock, thumbnails };
                            if (variantIdMap[key]) {
                                variantData._id = variantIdMap[key];
                            }

                            variantList.push(variantData);

                            (variantImages[key] || []).forEach(img => {
                                if (img.file) formData.append('variantImages', img.file, img.originalname);
                            });
                        }
                    }
                }
            }

            formData.append('colors', colors);
            formData.append('variants', JSON.stringify(variantList));

            try {
                const res = await api.put(`/products/${editingProductId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                this.fetchProducts()
                toast.success(res.data.message || 'Product updated successfully');
                this.setState({ renderLayout: 0 });
            } catch (err) {
                console.error(err);
                toast.error('Failed to update product');
            }
        } else {
            // ✅ Variant update
            const parsedColorList = (colors || '').split(',').map(c => c.trim()).filter(Boolean);
            const color = parsedColorList[0] || '';
            const ram = this.state.ram || '';
            const rom = this.state.rom || '';
            const sizesRaw = this.state[`sizes_${color}`] || '';
            const sizes = Array.isArray(sizesRaw) ? sizesRaw : (sizesRaw || '').split(',').map(s => s.trim()).filter(Boolean);
            const key = isElectronics ? `${color}_${ram}_${rom}` : color;

            const stock = this.state[`stock_${key}`] || this.state.stock || 0;
            const thumbnails = (variantImages[key] || []).map(img => img.originalname);

            formData.append('color', color);
            if (ram) formData.append('ram', ram);
            if (rom) formData.append('rom', rom);
            formData.append('stock', stock);
            if (sizes.length > 0) {
                formData.append('sizes', JSON.stringify(sizes));
            }
            formData.append('thumbnails', JSON.stringify(thumbnails));

            (variantImages[key] || []).forEach(img => {
                if (img.file) {
                    formData.append('variantImages', img.file, img.originalname);
                }
            });

            try {
                const res = await api.put(`/variants/${editingProductId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                this.fetchProducts()
                toast.success(res.data.message || 'Variant updated successfully');
                this.setState({ renderLayout: 0 });
            } catch (err) {
                console.error(err);
                toast.error('Failed to update variant');
            }
        }

        this.setState({ isSubmitting: false });
    };

    handleLikeToggle = (product) => {
        const userID = sessionStorage.getItem('token')
        if (!userID) {
            this.showToast('please login to Wishlist the product', 'danger')
            return;
        }
        if (!product || !product._id) {
            this.showToast("Invalid product.", "danger");
            return;
        }

        const { likedProducts, toggleLike } = this.props;
        const isCurrentlyLiked = likedProducts.includes(product._id);

        toggleLike(product._id, isCurrentlyLiked)
            .then((newLikedStatus) => {
                this.props.fetchLikedProducts();
                this.showToast(newLikedStatus ? "Product liked" : "Product unliked");
            })
            .catch((err) => {
                this.showToast(err.message, 'danger');
            });
    };

    showToast = (message, color = 'success', duration = 1000) => {
        this.setState({ toastVisible: true, toastMessage: message, toastColor: color });
        setTimeout(() => {
            this.setState({ toastVisible: false });
        }, duration);
    };


    confirmDelete = async () => {
        const { productIdToDelete } = this.state;
        try {
            await api.delete(`/products/${productIdToDelete}`);
            toast.success("Product deleted successfully!");
            this.fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error("Failed to delete product.");
        } finally {
            this.closeDeleteModal();
        }
    };

    toggleFilters = () => {
        this.setState({ showFilters: !this.state.showFilters });
    }

    render() {
        const { products, filteredProducts, renderLayout, loading, searchQuery, categories, toastColor, toastMessage, toastVisible } = this.state;
        const { role, likedProducts } = this.props;

        if (!products) return <Container className="mt-5"><h4>Product not found.</h4></Container>;

        return (
            <section className="home-container">
                {loading && <Spinner color="primary" className='text-center' style={{ width: '3rem', height: '3rem' }} />}
                {!loading && renderLayout === 0 && (
                    <Row>
                        <Col xs="12" className="d-md-none mb-3 d-flex justify-content-end">
                            <Button className='bg-transparent' onClick={this.toggleFilters}>
                                <FcFilledFilter size={24} />
                            </Button>
                        </Col>
                        {(this.state.showFilters || window.innerWidth >= 768) && (
                            <Col lg="2" xs="12" md="2" className="mb-4 d-md-block d-print-none">
                                <ProductFilters
                                    product={products}
                                    categories={categories}
                                    onFilterChange={this.handleFilterChange}
                                />
                            </Col>
                        )}
                        <Col className="mb-4">
                            <Row className='mb-4'>
                                <Col lg='12' xs='12' md='8'>
                                    <Input
                                        type="text"
                                        name="searchQuery"
                                        value={searchQuery}
                                        onChange={this.handleChange}
                                        placeholder="Search products by name or category..."
                                    />
                                </Col>
                                {(role === 'admin' || role === 'superadmin') && (
                                    <Col lg='12' xs='12' md='4'>
                                        <Button color="primary" onClick={this.addProducts}>Add Product</Button>
                                    </Col>
                                )}
                            </Row>
                            <Row>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <Col key={product._id} sm="6" md="4" lg="3" className="mb-4">
                                            <Card className="h-100 product-card shadow-sm border-0">
                                                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <div className="product-image-wrapper position-relative">
                                                        {(role === 'admin' || role === 'superadmin') && (
                                                            <Row className="admin-icon-row">
                                                                <Col xs="6" className="text-start">
                                                                    <RiDeleteBin6Line
                                                                        className="admin-icon delete"
                                                                        title="Delete Product"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            this.openDeleteModal(product._id);
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col xs="6" className="text-end">
                                                                    <FaEdit
                                                                        className="admin-icon edit"
                                                                        title="Edit Product"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            this.editProducts(product);
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        )}

                                                        <img
                                                            src={product.productImages[0]}
                                                            alt={product.name}
                                                            className="img-fluid product-image"
                                                        />

                                                        {/* Hover Like Icon */}
                                                        <div className="wishlist-overlay">
                                                            <button
                                                                className="wishlist-bar-btn"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    this.handleLikeToggle(product);
                                                                }}
                                                            >
                                                                {likedProducts && likedProducts.includes(product._id) ? (
                                                                    <FaHeart size={14} className="me-2 text-danger" />
                                                                ) : (
                                                                    <FaRegHeart size={14} className="me-2 text-dark" />
                                                                )}
                                                                <span className="wishlist-text">WISHLIST</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <CardBody className="text-center">
                                                        <CardTitle tag="h5" className="product-title fw-bold">{product.name}</CardTitle>
                                                        <RatingDisplay productId={product._id} />

                                                        {!isNaN(parseFloat(product.price)) ? (
                                                            product.offerPrice ? (
                                                                <Row className="mb-1">
                                                                    <Col className="text-success fw-semibold mb-0">₹{product.offerPrice}</Col>
                                                                    <Col className="text-muted mb-1" style={{ textDecoration: 'line-through' }}>
                                                                        ₹{product.price}
                                                                    </Col>
                                                                    <Col className="text-danger small mb-0">
                                                                        ({Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF)
                                                                    </Col>
                                                                </Row>
                                                            ) : (
                                                                <p className="text-success fw-semibold mb-1">₹{product.price}</p>
                                                            )
                                                        ) : (
                                                            <p className="text-muted fw-semibold mb-1 bg-body-secondary">{product.price}</p>
                                                        )}

                                                        <p className="text-muted small mb-0">{product.category}</p>
                                                    </CardBody>
                                                </Link>
                                            </Card>
                                        </Col>
                                    ))
                                ) : (
                                    <Col>
                                        <p>No products found for "<strong>{searchQuery}</strong>".</p>
                                    </Col>
                                )}
                            </Row>
                        </Col>
                    </Row>
                )
                }

                {renderLayout === 1 && this.renderProductFormInline()}
                {renderLayout === 2 && this.renderProductFormInline(true)}
                {this.renderDeleteModal()}
                <div className="custom-toast">
                    <Toast isOpen={toastVisible} className={`bg-${toastColor} text-white`} fade={false}>
                        <ToastHeader toggle={() => this.setState({ toastVisible: false })}>
                            {toastColor === 'success' ? 'Success' : 'Error'}
                        </ToastHeader>
                        <ToastBody>{toastMessage}</ToastBody>
                    </Toast>
                </div>
            </section >
        );
    }
}

const mapStateToProps = (state) => ({
    role: state.auth.role,
    likedProducts: state.products.likedProducts,
});


const mapDispatchToProps = {
    addToCart,
    toggleLike,
    fetchLikedProducts,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);