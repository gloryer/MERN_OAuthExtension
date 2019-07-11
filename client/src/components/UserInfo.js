import React, {Component,Fragment} from 'react';

import {
    Collapse, Button, CardBody, Card, ListGroup, ListGroupItem
} from 'reactstrap';
import {connect} from 'react-redux';
import {getUser} from "../actions/authActions"


class UserInfo extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {collapse: false};
    }

    toggle() {
        this.setState(state => ({collapse: !state.collapse}));
    }


    render() {
        const {user, isAuthenticated} = this.props;
        return (
            <div>
                {isAuthenticated==="authorized" ?
                    <Fragment>
                        <Button color="primary" onClick={() => {
                            this.toggle();
                            getUser()
                        }} style={{marginBottom: '1rem'}}>Get User Info</Button>
                        <Collapse isOpen={this.state.collapse}>
                            <Card>
                                <CardBody>
                                    <ListGroup>
                                        <ListGroupItem>Name: {user.name}</ListGroupItem>
                                        <ListGroupItem>Email: {user.email}</ListGroupItem>
                                        <ListGroupItem>Password hash: {user.password}</ListGroupItem>
                                        <ListGroupItem>Label: {user.label}</ListGroupItem>
                                    </ListGroup>
                                </CardBody>
                            </Card>
                        </Collapse>
                    </Fragment> : null}
            </div>
        );
    }
}

const mapStateToProps=state=>({
    user:state.auth.user,
    isAuthenticated: state.auth.isAuthenticated

});

export default connect(mapStateToProps,{getUser}) (UserInfo) ;
