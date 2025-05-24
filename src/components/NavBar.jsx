import React from "react";
import { Navbar, Nav, NavItem, NavLink, Button } from "reactstrap";
import { FaRegUser } from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";
import { logout, isAuthenticated } from "../utils/Auth";
import { FiLogOut } from "react-icons/fi";

export default class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToLogin: false
        };
    }

    handleLogout = () => {
        logout();
        this.setState({ redirectToLogin: true });
    };

    render() {
        if (this.state.redirectToLogin) {
            return <Navigate to="/login" />;
        }

        return (
            <Navbar color="light" light expand="md">
                <Link to="/home" className="navbar-brand">MyApp</Link>
                <Nav className="ml-auto" navbar>
                    <NavItem>
                        <NavLink tag={Link} to="/profile">
                            <FaRegUser />
                        </NavLink>
                    </NavItem>
                    {isAuthenticated() && (
                        <NavItem>
                            <Button color="link" className="nav-link" onClick={this.handleLogout}>
                                <FiLogOut />
                            </Button>
                        </NavItem>
                    )}
                </Nav>
            </Navbar>
        );
    }
}
