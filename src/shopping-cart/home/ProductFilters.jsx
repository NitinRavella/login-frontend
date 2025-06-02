import React from 'react';
import { Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';

class ProductFilters extends React.Component {
    constructor(props) {
        super(props);
        const prices = props.product && props.product.length > 0
            ? props.product.map(p => parseFloat(p.price)).filter(p => !isNaN(p))
            : [0];

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        this.state = {
            selectedCategory: '',
            selectedBrands: [],
            minPrice,
            maxPrice,
            inStockOnly: false,
            searchTerm: ''
        };
    }

    handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        this.setState({ [name]: newValue }, () => {
            this.props.onFilterChange(this.state);
        });
    };

    handleBrandCheckboxChange = (brand) => {
        const { selectedBrands } = this.state;
        const updatedBrands = selectedBrands.includes(brand)
            ? selectedBrands.filter(b => b !== brand)
            : [...selectedBrands, brand];

        this.setState({ selectedBrands: updatedBrands }, () => {
            this.props.onFilterChange(this.state);
        });
    };

    handleMinPriceChange = (e) => {
        const value = parseInt(e.target.value);
        this.setState({ minPrice: value }, () => {
            this.props.onFilterChange(this.state);
        });
    };

    handleMaxPriceChange = (e) => {
        const value = parseInt(e.target.value);
        const max = Math.max(...this.props.product.map(p => parseFloat(p.price)));
        const snapped = value >= max - 10 ? max : value;

        this.setState({ maxPrice: snapped }, () => {
            this.props.onFilterChange(this.state);
        });
    };

    handleReset = () => {
        const { product } = this.props;
        const prices = product && product.length > 0
            ? product.map(p => parseFloat(p.price)).filter(p => !isNaN(p))
            : [0];

        const resetState = {
            selectedCategory: '',
            selectedBrands: [],
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            inStockOnly: false,
            searchTerm: ''
        };
        this.setState(resetState, () => {
            this.props.onFilterChange(resetState);
        });
    };

    render() {
        const { categories, product } = this.props;
        const prices = (product || [])
            .map(p => parseFloat(p.price))
            .filter(p => !isNaN(p));

        const brands = [...new Set((product || []).map(p => p.brand))].filter(Boolean);

        const overallMinPrice = prices.length ? Math.min(...prices) : 0;
        const overallMaxPrice = prices.length ? Math.max(...prices) : 1000;

        const { minPrice, maxPrice, selectedBrands } = this.state;

        return (
            <Form>
                {/* Category Filter */}
                <FormGroup>
                    <Label htmlFor="selectedCategory">Category</Label>
                    <Input
                        type="select"
                        name="selectedCategory"
                        id="selectedCategory"
                        value={this.state.selectedCategory}
                        onChange={this.handleChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                        ))}
                    </Input>
                </FormGroup>

                {/* Brand Checkboxes */}
                <FormGroup>
                    <Label>Brands</Label>
                    {brands.map((brand, idx) => (
                        <FormGroup check key={idx}>
                            <Label check>
                                <Input
                                    type="checkbox"
                                    checked={selectedBrands.includes(brand)}
                                    onChange={() => this.handleBrandCheckboxChange(brand)}
                                />
                                {brand}
                            </Label>
                        </FormGroup>
                    ))}
                </FormGroup>

                {/* Price Range Filter */}
                <FormGroup>
                    <Label>Price Range: ₹{minPrice} - ₹{maxPrice}</Label>
                    <Row>
                        <Col xs="6">
                            <Input
                                type="range"
                                min={overallMinPrice}
                                max={overallMaxPrice}
                                step="1"
                                value={minPrice}
                                onChange={this.handleMinPriceChange}
                            />
                            <small className="text-muted">Min: ₹{minPrice}</small>
                        </Col>
                        <Col xs="6">
                            <Input
                                type="range"
                                min={overallMinPrice}
                                max={overallMaxPrice}
                                step="1"
                                value={maxPrice}
                                onChange={this.handleMaxPriceChange}
                            />
                            <small className="text-muted">Max: ₹{maxPrice}</small>
                        </Col>
                    </Row>
                </FormGroup>

                {/* In Stock Filter */}
                <FormGroup check className="mb-3">
                    <Input
                        type="checkbox"
                        name="inStockOnly"
                        id="inStockOnly"
                        checked={this.state.inStockOnly}
                        onChange={this.handleChange}
                    />
                    <Label htmlFor="inStockOnly" check>In Stock Only</Label>
                </FormGroup>

                {/* Reset Button */}
                <Button color="secondary" onClick={this.handleReset} block>
                    Reset Filters
                </Button>
            </Form>
        );
    }
}

export default ProductFilters;
