import api from '../../shopping-cart/utils/Api';
import {
    ADD_TO_CART_REQUEST,
    ADD_TO_CART_SUCCESS,
    ADD_TO_CART_FAILURE,
    TOGGLE_LIKE_REQUEST,
    TOGGLE_LIKE_SUCCESS,
    TOGGLE_LIKE_FAILURE,
    FETCH_LIKED_PRODUCTS_REQUEST,
    FETCH_LIKED_PRODUCTS_SUCCESS,
    FETCH_LIKED_PRODUCTS_FAILURE,
} from './actionTypes';

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
            dispatch({ type: ADD_TO_CART_SUCCESS, payload: product });
            return Promise.resolve();
        } catch (error) {
            dispatch({ type: ADD_TO_CART_FAILURE, payload: error.message || 'Failed to add to cart' });
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
            console.log('response', response.data)
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


