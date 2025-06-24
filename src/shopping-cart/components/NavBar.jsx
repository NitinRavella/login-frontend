import React from "react";
import { Navbar, Nav, NavItem, NavLink, Button } from "reactstrap";
import { FaRegHeart, FaRegUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { LiaShoppingCartSolid } from "react-icons/lia";
import { logoutUser } from "../../redux/reducers/authActions";
import { clearLikedProducts, clearCart } from "../../redux/actions/productActions";
import { connect } from "react-redux";
import api from "../utils/Api";
import { toast } from "react-toastify";
import withRouter from "./WithRoute";
import { fetchCart } from "../../redux/actions/productActions";

class NavBar extends React.Component {

    componentDidMount() {
        const { dispatch, isAuthenticated } = this.props;
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }


    handleLogout = async () => {
        try {
            await api.post("/logout");
            this.props.dispatch(logoutUser());
            this.props.dispatch(clearLikedProducts())
            this.props.dispatch(clearCart())
            this.props.navigate('/home');
            toast.success("Logged out successfully!");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    render() {
        const { isAuthenticated, cartCount } = this.props;
        return (
            <>
                <Navbar color="light" light expand="md">
                    <Link to="/home" className="navbar-brand">N Shop</Link>
                    <Nav className="ms-auto" navbar>
                        {isAuthenticated ? (
                            <>
                                <NavItem>
                                    <NavLink tag={Link} to='/liked-products'>
                                        <FaRegHeart size={23} />
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} to="/profile">
                                        <FaRegUser size={20} />
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} to="/cart" className="position-relative">
                                        <LiaShoppingCartSolid size={30} />
                                        {cartCount >= 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '0px',
                                                right: '0px',
                                                background: 'red',
                                                color: 'white',
                                                borderRadius: '50%',
                                                padding: '2px 6px',
                                                fontSize: '12px',
                                                lineHeight: '1'
                                            }}>
                                                {cartCount}
                                            </span>
                                        )}
                                    </NavLink>
                                </NavItem>

                                <NavItem>
                                    <Button color="link" className="nav-link" onClick={this.handleLogout}>
                                        <FiLogOut size={20} />
                                    </Button>
                                </NavItem>
                            </>
                        ) :
                            <NavItem>
                                <NavLink tag={Link} to="/login">Login</NavLink>
                            </NavItem>
                        }
                    </Nav>
                </Navbar>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    const cartItems = state.products?.cart || [];
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return {
        isAuthenticated: state.auth?.isAuthenticated,
        cartCount,
        clearLikedProducts,
        clearCart
    };
};


export default connect(mapStateToProps)(withRouter(NavBar));
