import React, {Component} from 'react';
import {
    Container,
    Alert
} from 'reactstrap';


import {connect} from 'react-redux';
import'../App.css'



class TokenDisplay extends Component {

    render() {
        const {token,isAuthenticated} =this.props;
        if (isAuthenticated==="authorized"){
            return(
                <div className="divStyle">
                    <Alert color={"success"}> Access Token: {token}</Alert>
                </div>
            )
        }else if(isAuthenticated==="authenticated"){
            return(
                <div className="divStyle">
                    <Alert color={"success"}> Register success! Please log in to access user information.</Alert>
                </div>
                )
        }else{
            return(
                <div className="divStyle">
                    <Alert color={"success"}> Please log in to access user information.</Alert>
                </div>
            )
        }

    }
}
const mapStateToProps=(state)=>({
   token: state.auth.token,
   isAuthenticated:state.auth.isAuthenticated

});


export default connect(mapStateToProps, {})(TokenDisplay);

