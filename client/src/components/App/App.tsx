import React, { Component, MouseEvent } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import uniqBy from 'lodash/uniqBy';
import View360 from '../View360/View360';

interface Item {
  id: string,
  title: string,
  description: string
}

interface InputEvent {
  target: {
    name: string,
    value: string,
  }
}

export default class App extends Component {
  state = {
    data: [],
    title: '',
    description: ''
  };

  getItems = () => {
    firebase
      .firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({
            data: uniqBy([...this.state.data, {...doc.data(), id: doc.id}], 'id')
          });
        });
      });
  };

  componentDidMount() {
    this.getItems();
  }

  dataIndex = () => {
    return this.state.data.map((item: Item) => {
      return (
        <div key={item.id}>
          <strong>Title: </strong>
          {item.title} <strong>Description: </strong> {item.description}
        </div>
      );
    });
  };

  handleSubmit = async (event: MouseEvent) => {
    event.preventDefault();

    // Add a new document with a generated id.
    try {
      await firebase
        .firestore()
        .collection('items')
        .add({
          title: this.state.title,
          description: this.state.description
        })


      this.setState({
        title: '',
        description: ''
      })

      this.getItems()

    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  handleChange = (event: InputEvent) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  dataForm = () => {
    return (
      <form>
        <input
          type='text'
          name='title'
          placeholder='New Item'
          value={this.state.title}
          onChange={this.handleChange}
        />
        <input
          type='text'
          name='description'
          placeholder='Item Description'
          value={this.state.description}
          onChange={this.handleChange}
        />
        <button type='submit' onClick={this.handleSubmit}>
          Submit
        </button>
      </form>
    );
  };

  render() {
    return (
      <div className='App'>
        <View360 />
      </div>
    );
  }
}
