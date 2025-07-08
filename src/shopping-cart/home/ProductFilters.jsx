import React from 'react';
import { Button } from 'reactstrap';
import '../../styles/ProductFilters.css';

class ProductFilters extends React.Component {
    constructor(props) {
        super(props);

        const prices = this.getAllPrices(props.product);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        this.state = {
            selectedCategory: '',
            selectedBrands: [],
            selectedColors: [],
            selectedRams: [],
            selectedRoms: [],
            selectedSizes: [],
            inStockOnly: false,
            priceRange: [min, max],
            minPrice: min,
            maxPrice: max,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.product !== this.props.product) {
            const prices = this.getAllPrices(this.props.product);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            this.setState({
                priceRange: [min, max],
                minPrice: min,
                maxPrice: max
            }, () => {
                this.props.onFilterChange(this.state);
            });
        }
    }

    getAllPrices = (products) => {
        return (products || [])
            .flatMap(p => p.variants?.map(v => parseFloat(v.price)) || [])
            .filter(p => !isNaN(p));
    };

    handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        this.setState({ [name]: newValue }, () => {
            this.props.onFilterChange(this.state);
        });
    };

    toggleMultiSelect = (field, value) => {
        const current = this.state[field] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        this.setState({ [field]: updated }, () => {
            this.props.onFilterChange(this.state);
        });
    };

    handlePriceChange = (value, index) => {
        let newRange = [...this.state.priceRange];
        newRange[index] = parseInt(value);

        if (newRange[0] > newRange[1]) {
            newRange = index === 0 ? [newRange[1], newRange[1]] : [newRange[0], newRange[0]];
        }

        this.setState({ priceRange: newRange }, () => {
            this.props.onFilterChange(this.state);
        });
    };

    handleReset = () => {
        const prices = this.getAllPrices(this.props.product);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        const resetState = {
            selectedCategory: '',
            selectedBrands: [],
            selectedColors: [],
            selectedRams: [],
            selectedRoms: [],
            selectedSizes: [],
            inStockOnly: false,
            priceRange: [min, max],
            minPrice: min,
            maxPrice: max
        };

        this.setState(resetState, () => {
            this.props.onFilterChange(resetState);
        });
    };

    renderCheckboxGroup(label, field, options) {
        return (
            <div className="filter-group">
                <h6>{label}</h6>
                <div className="checkbox-group">
                    {options.map((opt, idx) => (
                        <label key={idx} className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={this.state[field].includes(opt)}
                                onChange={() => this.toggleMultiSelect(field, opt)}
                            />
                            <span className="checkmark"></span>
                            {opt}
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    render() {
        const { categories, product } = this.props;
        const {
            selectedCategory, inStockOnly, priceRange, minPrice, maxPrice
        } = this.state;

        const brands = [...new Set(product?.map(p => p.brand))];
        const colors = [...new Set(product?.flatMap(p => p.variants?.map(v => v.color)).filter(Boolean))];
        const rams = [...new Set(product?.flatMap(p => p.variants?.map(v => v.ram)).filter(Boolean))];
        const roms = [...new Set(product?.flatMap(p => p.variants?.map(v => v.rom)).filter(Boolean))];
        const sizes = [...new Set(product?.flatMap(p =>
            p.variants?.flatMap(v => v.sizeStock?.map(s => s.size) || [])
        ).filter(Boolean))];

        return (
            <div className="product-filters p-3">
                <h5 className="mb-3">Filters</h5>

                {/* Category */}
                <div className="filter-group mb-3">
                    <h6>Category</h6>
                    <select
                        name="selectedCategory"
                        className="form-select"
                        value={selectedCategory}
                        onChange={this.handleChange}
                    >
                        <option value="">All</option>
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                {/* Price Range */}
                <div className="filter-group mb-4">
                    <h6>Price Range</h6>
                    <div className="price-range-values d-flex justify-content-between mb-1">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                    </div>
                    <div className="price-slider-container">
                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange[0]}
                            onChange={(e) => this.handlePriceChange(e.target.value, 0)}
                        />
                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={(e) => this.handlePriceChange(e.target.value, 1)}
                        />
                    </div>
                </div>

                {this.renderCheckboxGroup('Brands', 'selectedBrands', brands)}
                {this.renderCheckboxGroup('Colors', 'selectedColors', colors)}
                {this.renderCheckboxGroup('RAM', 'selectedRams', rams)}
                {this.renderCheckboxGroup('ROM', 'selectedRoms', roms)}
                {this.renderCheckboxGroup('Sizes', 'selectedSizes', sizes)}

                <div className="filter-group mt-3 mb-3">
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            name="inStockOnly"
                            checked={inStockOnly}
                            onChange={this.handleChange}
                        />
                        <span className="checkmark"></span>
                        In Stock Only
                    </label>
                </div>

                <Button color="secondary" block onClick={this.handleReset}>
                    Reset Filters
                </Button>
            </div>
        );
    }
}

export default ProductFilters;
