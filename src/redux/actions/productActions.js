import api from '../../shopping-cart/utils/Api';
import {
    ADD_TO_CART_REQUEST,
    ADD_TO_CART_SUCCESS,
    ADD_TO_CART_FAILURE,
    TOGGLE_LIKE_REQUEST,
    TOGGLE_LIKE_SUCCESS,
    TOGGLE_LIKE_FAILURE,
    FETCH_CART_SUCCESS,
    FETCH_CART_REQUEST,
    FETCH_CART_FAILURE,
    FETCH_LIKED_PRODUCTS_REQUEST,
    FETCH_LIKED_PRODUCTS_SUCCESS,
    FETCH_LIKED_PRODUCTS_FAILURE,
    UPDATE_CART_FAILURE,
    UPDATE_CART_SUCCESS,
    UPDATE_CART_REQUEST,
    CLEAR_LIKED_PRODUCTS,
    CLEAR_CART
} from './actionTypes';

export const fetchCart = () => {
    return async (dispatch) => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;

        dispatch({ type: FETCH_CART_REQUEST });

        try {
            const response = await api.get(`/${userId}/cart`);
            dispatch({
                type: FETCH_CART_SUCCESS,
                payload: response.data || [],
            });
        } catch (error) {
            dispatch({
                type: FETCH_CART_FAILURE,
                payload: error.message || 'Failed to fetch cart',
            });
        }
    };
};

export const addToCart = (product) => {
    return async (dispatch) => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            return Promise.reject(new Error("You must be logged in to add products to cart."));
        }

        dispatch({ type: ADD_TO_CART_REQUEST });

        try {
            await api.post(`/${userId}/cart`, {
                productID: product.productID,
                quantity: 1,
                selectedSize: product.selectedSize || null,
                selectedColor: product.selectedColor || null,
                selectedRam: product.selectedRam || null,
                selectedRom: product.selectedRom || null
            });

            await dispatch(fetchCart());
            dispatch({ type: ADD_TO_CART_SUCCESS });

            return Promise.resolve();
        } catch (error) {
            dispatch({
                type: ADD_TO_CART_FAILURE,
                payload: error.message || 'Failed to add to cart'
            });
            return Promise.reject(error);
        }
    };
};

export const updateCartQuantity = (productId, quantity, selectedSize, selectedColor, selectedRam, selectedRom) => {
    return async (dispatch) => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            return Promise.reject(new Error("You must be logged in to update the cart."));
        }

        dispatch({ type: UPDATE_CART_REQUEST });

        try {
            const res = await api.put(`/${userId}/cart/update`, {
                productId,
                quantity,
                selectedSize: selectedSize || null,
                selectedColor: selectedColor || null,
                selectedRam: selectedRam || null,
                selectedRom: selectedRom || null
            });

            dispatch({
                type: UPDATE_CART_SUCCESS,
                payload: res.data
            });

            return Promise.resolve();
        } catch (error) {
            dispatch({
                type: UPDATE_CART_FAILURE,
                payload: error.message || 'Failed to update cart quantity'
            });

            return Promise.reject(error);
        }
    };
};


export const toggleLike = (productId, variantId, currentlyLiked) => {
    return async (dispatch) => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            return Promise.reject(new Error("You must be logged in to like products."));
        }

        dispatch({ type: TOGGLE_LIKE_REQUEST });

        try {
            if (!currentlyLiked) {
                // Like (add to wishlist)
                await api.post(`/wishlist/toggle/${userId}/${productId}`, { variantId });
            } else {
                // Unlike (remove from wishlist)
                await api.delete(`/wishlist/remove/${userId}/${productId}`, {
                    data: { variantId }  // DELETE requests need data like this
                });
            }

            dispatch({
                type: TOGGLE_LIKE_SUCCESS,
                payload: { productId, variantId, liked: !currentlyLiked },
            });

            return Promise.resolve(!currentlyLiked);
        } catch (error) {
            dispatch({
                type: TOGGLE_LIKE_FAILURE,
                payload: error.message || "Failed to update like",
            });
            return Promise.reject(error);
        }
    };
};

// In your productActions.js
export const fetchLikedProducts = () => {
    return async (dispatch) => {
        const userId = sessionStorage.getItem('userId');

        if (!userId) {
            dispatch({
                type: FETCH_LIKED_PRODUCTS_FAILURE,
                payload: 'User not logged in',
            });
            return Promise.reject(new Error('User not logged in'));
        }

        dispatch({ type: FETCH_LIKED_PRODUCTS_REQUEST });

        try {
            const response = await api.get(`/wishlist/${userId}`);
            dispatch({
                type: FETCH_LIKED_PRODUCTS_SUCCESS,
                payload: response.data.wishlist || [],  // Must be [{ productId, variantId }]
            });
            return Promise.resolve();
        } catch (error) {
            dispatch({
                type: FETCH_LIKED_PRODUCTS_FAILURE,
                payload: error.message || 'Failed to fetch wishlist',
            });
            return Promise.reject(error);
        }
    };
};


export const clearLikedProducts = () => {
    return {
        type: CLEAR_LIKED_PRODUCTS,
    };
};

export const clearCart = () => {
    return {
        type: CLEAR_CART,
    };
};
