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
    MERGE_WISHLIST_REQUEST,
    MERGE_WISHLIST_SUCCESS,
    MERGE_WISHLIST_FAILURE,
    CLEAR_LIKED_PRODUCTS,
    UPDATE_CART_REQUEST,
    UPDATE_CART_SUCCESS,
    UPDATE_CART_FAILURE,
    CLEAR_CART
} from '../actions/actionTypes';

const initialState = {
    cart: [],
    likedProducts: [],  // [{ productId, variantId }]
    loadingLikes: false,
    loadingCart: false,
    error: null,
    cartError: null,
    likesError: null,
};

export default function productReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_TO_CART_REQUEST:
        case UPDATE_CART_REQUEST:
            return {
                ...state,
                loadingCart: true,
                cartError: null,
            };

        case ADD_TO_CART_SUCCESS:
        case UPDATE_CART_SUCCESS:
            return {
                ...state,
                cart: action.payload,
                loadingCart: false,
            };

        case FETCH_CART_SUCCESS:
            return {
                ...state,
                cart: action.payload,
                loadingCart: false,
            };

        case ADD_TO_CART_FAILURE:
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

        case TOGGLE_LIKE_SUCCESS: {
            const { productId, variantId, liked } = action.payload;
            const existing = state.likedProducts.some(
                item => item.productId === productId && item.variantId === variantId
            );

            return {
                ...state,
                likedProducts: liked
                    ? existing
                        ? state.likedProducts // already liked, do nothing
                        : [...state.likedProducts, { productId, variantId }]
                    : state.likedProducts.filter(
                        item =>
                            !(item.productId === productId && item.variantId === variantId)
                    ),
                loadingLikes: false,
            };
        }
        case MERGE_WISHLIST_REQUEST:
            return {
                ...state,
                loadingLikes: true,
                likesError: null,
            };

        case MERGE_WISHLIST_SUCCESS:
            return {
                ...state,
                loadingLikes: false,
            };

        case MERGE_WISHLIST_FAILURE:
            return {
                ...state,
                loadingLikes: false,
                likesError: action.payload,
            };

        case FETCH_LIKED_PRODUCTS_SUCCESS:
            return {
                ...state,
                likedProducts: action.payload.map(p => ({
                    productId: p.productId || p._id,
                    variantId: p.variantId
                })),
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
