import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux'
import {logout} from '../actions/authActions'
import {NavLink} from 'reactstrap'

class Logout extends Component {
    render() {
        return (
            <Fragment>
                <NavLink onClick={this.props.logout} href="#">
                    Log out
                </NavLink>
            </Fragment>
        );
    }
}



export default connect(null, {logout})(Logout);
