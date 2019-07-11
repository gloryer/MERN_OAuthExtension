import React, {Component} from 'react';
import {
    Container,

    Button
} from 'reactstrap';


import {connect} from 'react-redux';
import {getItems,deleteItem} from '../actions/itemActions';


 class ShoppingList extends Component {
     componentDidMount() {
        this.props.getItems();
     }
     onDeleteClick =(id)=>{
        this.props.deleteItem(id);
     };
     state={};
    render() {
        const {items} =this.props.item;
        return (
            <Container>
                <ul>
                    {items.map(({_id, name})=>(
                     <p key={_id}>
                         <Button
                             className= "remove-btn"
                             color="danger"
                             size="sm"
                             onClick={this.onDeleteClick.bind(this,_id)}>

                         </Button>
                         {_id} and {name}
                     </p>))}
                </ul>
            </Container>


        );
    }
}
const mapStateToProps=(state)=>({
    item: state.item,

});
export default connect(mapStateToProps, {getItems,deleteItem})(ShoppingList);

/*<ListGroup>
    <TransitionGroup className="shopping-list">
        {items.map(({id, name})=>(
            <CSSTransition key={id} timeout={500} classNames="fade">
                <ListGroupItem>
                    <Button
                        className= "remove-btn"
                        color="danger"
                        size="sm"
                        onClick={()=>{
                            this.setState(state=>({
                                items: state.items.filter(item => item.id!==id)
                            }))
                        }}>

                    </Button>
                    {name}
                </ListGroupItem>
            </CSSTransition>
        ))}
    </TransitionGroup>
</ListGroup>*/

/*                <Button
                    color="dark"
                    style={{marginBottom:'2rem'}}
                    onClick={()=>{
                        const name =prompt('Enter Item');
                        if(name){
                            this.setState(state=>({
                               items: [...this.state.items,{id:uuid(),name}]
                            }))
                        }

                    }}>Add Item
                </Button>*/
