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
    CLEAR_LIKED_PRODUCTS
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
                productID: product._id,
                quantity: 1,
            });

            // Await fetchCart to update the state fully
            await dispatch(fetchCart());

            // Dispatch success just to reset loading
            dispatch({ type: ADD_TO_CART_SUCCESS });
            return Promise.resolve();
        } catch (error) {
            dispatch({ type: ADD_TO_CART_FAILURE, payload: error.message || 'Failed to add to cart' });
            return Promise.reject(error);
        }
    };
};

export const updateCartQuantity = (productId, quantity) => {
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
            });

            dispatch({
                type: UPDATE_CART_SUCCESS,
                payload: res.data, // updated full cart from backend
            });

            return Promise.resolve();
        } catch (error) {
            dispatch({
                type: UPDATE_CART_FAILURE,
                payload: error.message || 'Failed to update cart quantity',
            });
            return Promise.reject(error);
        }
    };
};


export const toggleLike = (productId, currentlyLiked) => {
    return async (dispatch) => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            return Promise.reject(new Error("You must be logged in to like products."));
        }

        dispatch({ type: TOGGLE_LIKE_REQUEST });

        try {
            if (!currentlyLiked) {
                await api.post(`/${userId}/like/${productId}`);
            } else {
                await api.delete(`/${userId}/unlike/${productId}`);
            }

            dispatch({
                type: TOGGLE_LIKE_SUCCESS,
                payload: { productId, liked: !currentlyLiked },
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

        dispatch({ type: FETCH_LIKED_PRODUCTS_REQUEST });

        try {
            const response = await api.get(`/${userId}/liked-products`);
            dispatch({
                type: FETCH_LIKED_PRODUCTS_SUCCESS,
                payload: response.data.likedProductsIds || [],
            });
            return Promise.resolve();
        } catch (error) {
            dispatch({
                type: FETCH_LIKED_PRODUCTS_FAILURE,
                payload: error.message || 'Failed to fetch liked products',
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

