import React, { Component, useState, MouseEvent } from 'react';

export function Search() {
  const [search, setSearch] = useState('');
  const baseUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

  const handleSubmit = async (event: MouseEvent) => {
    event.preventDefault();
    try {



      setSearch('');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  return (
    <form>
      <input
        type='text'
        name='search'
        placeholder='Search'
        value={search}
        onChange={event => setSearch(event.target.value)}
      />
      <button type='submit' onClick={handleSubmit}>
        Submit
        </button>
    </form>
  );
}