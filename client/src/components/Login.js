import React, {Component} from 'react';

import {
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    Form,
    FormGroup,
    Label,
    Input,
    NavLink,
    Alert
} from 'reactstrap';
import {connect} from 'react-redux';

import {login} from '../actions/authActions';

import {clearErrors} from "../actions/errorActions";

class LoginModal extends Component {
    state={
        modal:false,
        email:'',
        password:'',
        msg:null
    };
    componentDidUpdate(prevProps) {
        const {error,isAuthenticated} =this.props;
        if (error!== prevProps.error){
            if (error.id==='LOGIN_FAIL'){
                this.setState({msg:error.msg.msg.msg})
            }else{
                this.setState({msg:null});
            }
        }

        if(this.state.model){
            if(isAuthenticated==="authorized"){
                this.toggle();
            }
        }

    }

    toggle=()=>{
        this.props.clearErrors();
        this.setState({modal:!this.state.modal});
    };

    onSubmit=(e)=>{
        e.preventDefault();

        const { email, password}=this.state;
        const User={
            email,
            password
        };
        this.props.login(User);

    };
    onChange=(e)=>{
        this.setState({[e.target.name]:e.target.value});
    };
    render() {
        return (
            <div>
                <NavLink onClick={this.toggle} href= "#">
                    Login
                </NavLink>

                <Modal
                    isOpen={this.state.modal}
                    toggle={this.toggle}
                >
                    <ModalHeader>Log in </ModalHeader>
                    <ModalBody>
                        {this.state.msg?<Alert color ="danger">{this.state.msg}</Alert>:null}
                        <Form onSubmit={this.onSubmit}>
                            <FormGroup>

                                <Label for={"email"}>Email</Label>
                                <Input
                                    type ="email"
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    className= "mb-3"
                                    onChange={this.onChange}
                                />
                                <Label for={"password"}>Password</Label>
                                <Input
                                    type ="password"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    className= "mb-3"
                                    onChange={this.onChange}
                                />
                                <Button
                                    color="dark"
                                    style={{marginBottom:'2rem'}}
                                > Log in

                                </Button>

                            </FormGroup>
                        </Form>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}


const mapStateToProps=state=>({
    isAuthenticated:state.auth.isAuthenticated,
    error: state.error

});

export default connect(mapStateToProps,{login,clearErrors}) (LoginModal) ;
