import api from '../../shopping-cart/utils/Api';
import {
    ADD_TO_CART_REQUEST,
    // ADD_TO_CART_SUCCESS,
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
    CLEAR_CART,
    MERGE_WISHLIST_REQUEST,
    MERGE_WISHLIST_SUCCESS,
    MERGE_WISHLIST_FAILURE
} from './actionTypes';

const getGuestWishlist = () => JSON.parse(localStorage.getItem('guestWishlist') || '[]');
// const saveGuestWishlist = (list) => localStorage.setItem('guestWishlist', JSON.stringify(list));

// ---------------- CART ACTIONS ---------------- //

export const fetchCart = () => async (dispatch) => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    dispatch({ type: FETCH_CART_REQUEST });

    try {
        const response = await api.get(`/${userId}/cart`);
        dispatch({ type: FETCH_CART_SUCCESS, payload: response.data || [] });
    } catch (error) {
        dispatch({
            type: FETCH_CART_FAILURE,
            payload: error.message || 'Failed to fetch cart',
        });
    }
};

export const addToCart = (product) => async (dispatch) => {
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
        })

        await dispatch(fetchCart());
        return Promise.resolve();
    } catch (error) {
        dispatch({
            type: ADD_TO_CART_FAILURE,
            payload: error.message || 'Failed to add to cart'
        });
        return Promise.reject(error);
    }
};

export const updateCartQuantity = (productId, quantity, selectedSize, selectedColor, selectedRam, selectedRom) => async (dispatch) => {
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

        dispatch({ type: UPDATE_CART_SUCCESS, payload: res.data });
        return Promise.resolve();
    } catch (error) {
        dispatch({
            type: UPDATE_CART_FAILURE,
            payload: error.message || 'Failed to update cart quantity'
        });
        return Promise.reject(error);
    }
};

// ---------------- WISHLIST (LIKE) ACTIONS ---------------- //

export const toggleLike = (productId, variantId, currentlyLiked) => {
    return async (dispatch) => {
        const userId = sessionStorage.getItem('userId');
        const userToken = sessionStorage.getItem('token');

        dispatch({ type: TOGGLE_LIKE_REQUEST });

        // 💡 Guest user: store in localStorage
        if (!userToken) {
            const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');

            const alreadyLiked = guestWishlist.some(
                item => item.productId === productId && item.variantId === variantId
            );

            let updatedWishlist;

            if (alreadyLiked) {
                updatedWishlist = guestWishlist.filter(
                    item => !(item.productId === productId && item.variantId === variantId)
                );
            } else {
                updatedWishlist = [...guestWishlist, { productId, variantId }];
            }

            localStorage.setItem('guestWishlist', JSON.stringify(updatedWishlist));

            dispatch({
                type: TOGGLE_LIKE_SUCCESS,
                payload: { productId, variantId, liked: !alreadyLiked },
            });

            return Promise.resolve(!alreadyLiked);
        }

        // ✅ Logged-in user: call backend
        try {
            if (!currentlyLiked) {
                await api.post(`/wishlist/toggle/${userId}/${productId}`, { variantId });
            } else {
                await api.delete(`/wishlist/remove/${userId}/${productId}`, {
                    data: { variantId }
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


export const fetchLikedProducts = () => async (dispatch) => {
    const userId = sessionStorage.getItem('userId');

    dispatch({ type: FETCH_LIKED_PRODUCTS_REQUEST });

    try {
        if (userId) {
            const response = await api.get(`/wishlist/${userId}`);
            dispatch({
                type: FETCH_LIKED_PRODUCTS_SUCCESS,
                payload: response.data.wishlist || [],
            });
        } else {
            const guestItems = getGuestWishlist();
            dispatch({
                type: FETCH_LIKED_PRODUCTS_SUCCESS,
                payload: guestItems,
            });
        }

        return Promise.resolve();
    } catch (error) {
        dispatch({
            type: FETCH_LIKED_PRODUCTS_FAILURE,
            payload: error.message || 'Failed to fetch wishlist',
        });
        return Promise.reject(error);
    }
};

// ---------------- GUEST WISHLIST MERGE AFTER LOGIN ---------------- //
export const mergeGuestWishlistToUser = () => async (dispatch) => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    const guestWishlist = getGuestWishlist();
    if (!guestWishlist.length) return;

    dispatch({ type: MERGE_WISHLIST_REQUEST });

    try {
        // 1. Fetch current user wishlist to prevent duplicates
        const response = await api.get(`/wishlist/${userId}`);
        const userWishlist = response.data.wishlist || [];

        const existingSet = new Set(
            userWishlist.map(item => `${item.productId}-${item.variantId}`)
        );

        const newItems = guestWishlist.filter(
            item => !existingSet.has(`${item.productId}-${item.variantId}`)
        );

        for (const item of newItems) {
            await api.post(`/wishlist/toggle/${userId}/${item.productId}`, {
                variantId: item.variantId
            });
        }

        localStorage.removeItem('guestWishlist');
        dispatch({ type: MERGE_WISHLIST_SUCCESS });

        dispatch(fetchLikedProducts());
    } catch (error) {
        dispatch({
            type: MERGE_WISHLIST_FAILURE,
            payload: error.message || 'Failed to merge wishlist',
        });
    }
};

// ---------------- CLEAR ACTIONS ---------------- //

export const clearLikedProducts = () => ({ type: CLEAR_LIKED_PRODUCTS });
export const clearCart = () => ({ type: CLEAR_CART });
