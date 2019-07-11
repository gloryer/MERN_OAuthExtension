import React, {Fragment} from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import Container from "reactstrap/es/Container";
import 'bootstrap/dist/css/bootstrap.min.css';
import RegisterModal from "./RegisterModal";
import Logout from "./Logout"
import Login from "./Login"
import {connect} from "react-redux"



 class AppNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: true
        };
    }

    toggleNavbar=()=> {
        this.setState({
            isOpen: !this.state.isOpen
        });
    };
    render() {
        const{isAuthenticated, user}=this.props.auth;

        const authLinks=(
            <Fragment>
                <NavItem>
                    <span className="navbar-text mr-3">
                        <strong>{user? 'Welcome '+ user.name:''}</strong>
                    </span>
                </NavItem>
                <NavItem>
                    <Logout/>
                </NavItem>
            </Fragment>

        );

        const guestLinks=(
            <Fragment>
                <NavItem>
                    <RegisterModal/>
                </NavItem>
                <NavItem>
                    <Login/>
                </NavItem>
            </Fragment>

        )

        return (
            <div>
                <Navbar color="dark" dark expand="sm" className="mb-5">
                    <Container>
                        <NavbarBrand href="/" >User Management</NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} />
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="ml-auto" navbar>
                                {isAuthenticated==="authorized"? authLinks:guestLinks}
                            </Nav>


                        </Collapse>
                    </Container>
                </Navbar>
            </div>
        );
    }
}

const mapStateToProps=state=>({
    auth:state.auth
})
export default connect(mapStateToProps,null)(AppNav)