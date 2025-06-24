import {
    ADD_TO_CART_REQUEST,
    ADD_TO_CART_SUCCESS,
    ADD_TO_CART_FAILURE,
    TOGGLE_LIKE_REQUEST,
    TOGGLE_LIKE_SUCCESS,
    TOGGLE_LIKE_FAILURE,
    FETCH_CART_SUCCESS,
    FETCH_LIKED_PRODUCTS_REQUEST,
    FETCH_LIKED_PRODUCTS_SUCCESS,
    FETCH_LIKED_PRODUCTS_FAILURE,
    CLEAR_LIKED_PRODUCTS,
    UPDATE_CART_REQUEST,
    UPDATE_CART_SUCCESS,
    UPDATE_CART_FAILURE,
    CLEAR_CART
} from '../actions/actionTypes';

const initialState = {
    cart: [],            // Each item: { product, quantity, _id }
    likedProducts: [],
    loadingLikes: false,
    loadingCart: false,
    error: null,
    cartError: null,
    likesError: null,
};

export default function productReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_TO_CART_REQUEST:
            return {
                ...state,
                loadingCart: true,
                cartError: null,
            };

        case FETCH_CART_SUCCESS:
            return {
                ...state,
                cart: action.payload,  // payload is full cart array from backend
                loadingCart: false,
            };

        case ADD_TO_CART_SUCCESS:
            return {
                ...state,
                loadingCart: false,
            };

        case ADD_TO_CART_FAILURE:
            return {
                ...state,
                loadingCart: false,
                cartError: action.payload,
            };
        case UPDATE_CART_REQUEST:
            return {
                ...state,
                loadingCart: true,
                cartError: null,
            };

        case UPDATE_CART_SUCCESS:
            return {
                ...state,
                cart: action.payload,  // updated cart array from server
                loadingCart: false,
            };

        case UPDATE_CART_FAILURE:
            return {
                ...state,
                loadingCart: false,
                cartError: action.payload,
            };

        case TOGGLE_LIKE_REQUEST:
        case FETCH_LIKED_PRODUCTS_REQUEST:
            return {
                ...state,
                loadingLikes: true,
                likesError: null,
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
        case CLEAR_LIKED_PRODUCTS:
            return {
                ...state,
                likedProducts: [],
            };
        case CLEAR_CART:
            return {
                ...state,
                cart: [],
            };

        default:
            return state;
    }
}
