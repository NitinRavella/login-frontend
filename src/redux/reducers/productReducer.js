import {
    ADD_TO_CART_REQUEST,
    ADD_TO_CART_SUCCESS,
    ADD_TO_CART_FAILURE,
    TOGGLE_LIKE_REQUEST,
    TOGGLE_LIKE_SUCCESS,
    TOGGLE_LIKE_FAILURE,
    FETCH_LIKED_PRODUCTS_REQUEST,
    FETCH_LIKED_PRODUCTS_SUCCESS,
    FETCH_LIKED_PRODUCTS_FAILURE, // Fixed typo from FAILURE to FAILURE
} from '../actions/actionTypes';

const initialState = {
    cart: [],
    likedProducts: [],
    loading: false,
    loadingLikes: false, // Separate loading state for likes
    loadingCart: false,  // Separate loading state for cart
    error: null,
    cartError: null,     // Separate error state for cart
    likesError: null,    // Separate error state for likes
};

export default function productReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_TO_CART_REQUEST:
            return {
                ...state,
                loadingCart: true,
                cartError: null,
            };

        case TOGGLE_LIKE_REQUEST:
        case FETCH_LIKED_PRODUCTS_REQUEST:
            return {
                ...state,
                loadingLikes: true,
                likesError: null,
            };

        case ADD_TO_CART_SUCCESS:
            // Prevent duplicate items in cart
            const productExists = state.cart.some(item => item._id === action.payload._id);
            return {
                ...state,
                cart: productExists ? state.cart : [...state.cart, action.payload],
                loadingCart: false,
            };

        case ADD_TO_CART_FAILURE:
            return {
                ...state,
                loadingCart: false,
                cartError: action.payload,
            };

        case TOGGLE_LIKE_SUCCESS:
            const { productId, liked } = action.payload;
            return {
                ...state,
                likedProducts: liked
                    ? [...new Set([...state.likedProducts, productId])]
                    : state.likedProducts.filter(id => id !== productId),
                loadingLikes: false,
            };

        case FETCH_LIKED_PRODUCTS_SUCCESS:
            return {
                ...state,
                likedProducts: action.payload.map(p => p._id || p),
                loadingLikes: false,
            };

        case TOGGLE_LIKE_FAILURE:
        case FETCH_LIKED_PRODUCTS_FAILURE:
            return {
                ...state,
                loadingLikes: false,
                likesError: action.payload,
            };

        default:
            return state;
    }
}