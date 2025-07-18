import React from 'react';
import { Card, CardImg, Button } from 'reactstrap';
import { FaTimes } from 'react-icons/fa';
import '../../styles/WishlistCard.css'; // make sure this file has the styles mentioned below

const WishlistProductCard = ({ product, variant, onClick, onRemove, onMoveToBag }) => {
    const { name, category, mainImages } = product;
    const price = variant?.pricing?.price ?? variant?.price ?? 0;
    const offerPrice = variant?.pricing?.offerPrice ?? variant?.offerPrice ?? 0;
    const image = variant.images?.[0] || mainImages?.[0]?.url || variant.thumbnails?.[0];
    const outOfStock = category === 'clothing'
        ? variant.sizeStock.every(s => s.stock <= 0)
        : variant.stock <= 0;

    return (
        <Card className={`wishlist-myntra-card ${outOfStock ? 'wishlist-out-of-stock' : ''}`}>
            <div className="wishlist-img-wrapper" onClick={onClick}>
                <CardImg top src={image} alt={name} className="wishlist-img" />
                {outOfStock && <div className="wishlist-overlay-modal">OUT OF STOCK</div>}
                <Button
                    className="wishlist-remove-btn"
                    color="link"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <FaTimes />
                </Button>
            </div>
            <div className="wishlist-card-body" onClick={onClick}>
                <div className="wishlist-title">{name}</div>
                {offerPrice ? (
                    <div className="wishlist-price">
                        <span className="wishlist-price-offer">₹{offerPrice}</span>
                        <span className="wishlist-price-original">₹{price}</span>
                        <span className="wishlist-discount">
                            ({Math.round(((price - offerPrice) / price) * 100)}% OFF)
                        </span>
                    </div>
                ) : (
                    <div className="wishlist-price">₹{price}</div>
                )}
            </div>
            {!outOfStock && (
                <div className="wishlist-action">
                    <Button color="danger" block onClick={onMoveToBag}>
                        MOVE TO BAG
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default WishlistProductCard;
