import React, {Component}from 'react';

import AppNav from "./components/AppNav"
import ShoppingList from "./components/ShoppingList"
import 'bootstrap/dist/css/bootstrap.min.css';
import ItemModal from "./components/ItemModal"
import './App.css'
import {Container} from "reactstrap"

//import {loadUser} from "./actions/authActions";
import TokenDisplay from "./components/TokenDisplay"
import UserInfo from "./components/UserInfo"


import {Provider} from 'react-redux';
import store from './store';


class App extends Component {

   /* componentDidMount() {
        store.dispatch(loadUser());
    }*/

    render() {
        return (
            <Provider store ={store}>
            <div className="App">
                <AppNav/>
                <Container>
                <TokenDisplay/>
                <UserInfo/>
                </Container>
            </div>
            </Provider>
        );
    }
}

export default App;
