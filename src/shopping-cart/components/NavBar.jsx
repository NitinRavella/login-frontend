import React from "react";
import { Navbar, Nav, NavItem, NavLink, Button } from "reactstrap";
import { FaRegHeart, FaRegUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { LiaShoppingCartSolid } from "react-icons/lia";
import { logoutUser } from "../../redux/reducers/authActions";
import { connect } from "react-redux";
import api from "../utils/Api";
import { toast } from "react-toastify";
import withRouter from "./WithRoute";

class NavBar extends React.Component {
    handleLogout = async () => {
        try {
            await api.post("/logout");
            this.props.dispatch(logoutUser());
            this.props.navigate('/home');
            toast.success("Logged out successfully!");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    render() {
        const { isAuthenticated } = this.props;
        return (
            <>
                <Navbar color="light" light expand="md">
                    <Link to="/home" className="navbar-brand">MyApp</Link>
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
                                    <NavLink tag={Link} to="/cart">
                                        <LiaShoppingCartSolid size={30} />
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

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(withRouter(NavBar));
