import axios from 'axios';
import {GET_ITEMS,ADD_ITEMS,DELETE_ITEMS,ITEMS_LOADING} from './type';

export const getItems =()=>dispatch=>{
  dispatch(setItemsLoading());
  axios.get('/api/items')
      .then(res=>
      dispatch({
          type:GET_ITEMS,
          payload:res.data
      }))
};

export const deleteItem =(id)=>dispatch=>{
    const url =('/api/items/'+id);
    axios.delete(url)
        .then(res=>
        dispatch({
            type:DELETE_ITEMS,
            payload:id
        }));
};


export const addItem =(item)=>dispatch=>{
    axios.post('/api/items',item)
        .then(res=>
            dispatch({
                type:ADD_ITEMS,
                payload:res.data
            })
        )
}

export const setItemsLoading =()=>{
    return{
        type:ITEMS_LOADING
    }
}



/*
export const getItems =()=>dispatch=>{
    return{
        type:GET_ITEMS
    }
}

export const deleteItem =(id)=>{
    return{
        type:DELETE_ITEMS,
        payload:id
    }
}

export const addItem =(item)=>{
    return{
        type:ADD_ITEMS,
        payload:item
    }
}

export const setItemsLoading =()=>{
    return{
        type:ITEMS_LOADING
    }
}
*/
