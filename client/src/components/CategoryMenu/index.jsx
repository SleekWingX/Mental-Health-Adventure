import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { useStoreContext } from '../../utils/GlobalState';
import {
  UPDATE_CATEGORIES,
  UPDATE_CURRENT_CATEGORY,
  UPDATE_CURRENT_LOCATION
} from '../../utils/actions';
import { QUERY_CATEGORIES } from '../../utils/queries';
import { idbPromise } from '../../utils/helpers';

function CategoryMenu() {
  const [state, dispatch] = useStoreContext();
  const { categories } = state;

  const { loading, data: categoryData } = useQuery(QUERY_CATEGORIES);
  
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (categoryData) {
      dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories,
      });
      categoryData.categories.forEach((category) => {
        idbPromise('categories', 'put', category);
      });
    } else if (!loading) {
      idbPromise('categories', 'get').then((categories) => {
        dispatch({
          type: UPDATE_CATEGORIES,
          categories: categories,
        });
      });
    }
  }, [categoryData, loading, dispatch]);

  useEffect(() => {
    // Initialize the map
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.7392, lng: -104.9903 }, // Center map on Denver, Colorado
        zoom: 8,
        gestureHandling: 'auto', // Allow single-finger or mouse dragging
      });
      setMap(newMap);
    }
  }, [mapRef, map]);

  const handleSearch = useCallback(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps Places API not loaded properly.");
      return;
    }

    if (map && query) {
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        query: query,
        fields: ['name', 'geometry', 'photos'],
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results);
          setSuggestions(results.map(result => result.name));
        } else {
          setSuggestions([]);
          console.error("Search failed:", status);
        }
      });
    }
  }, [map, query]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), [handleSearch]);

  useEffect(() => {
    if (query) {
      debouncedSearch();
    } else {
      setSuggestions([]);
    }
  }, [query, debouncedSearch]);

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    
    const selected = searchResults.find(result => result.name === suggestion);
    if (selected) {
      setSelectedPlace(selected);
      map.setCenter(selected.geometry.location);
      new window.google.maps.Marker({
        map,
        position: selected.geometry.location,
      });

      // Dispatch the selected location to the global state
      dispatch({
        type: UPDATE_CURRENT_LOCATION,
        currentLocation: selected,
      });

      // Fetch up to 5 photos from the selected place
      const photos = selected.photos || [];
      const imageUrls = photos.slice(0, 5).map(photo => photo.getUrl({ maxWidth: 400, maxHeight: 300 }));
      setImages(imageUrls);
    }
  };

  return (
    <div>
      <h2>Search for Location:</h2>
      {categories.map((item) => (
        <button
          key={item._id}
          onClick={() => {
            dispatch({
              type: UPDATE_CURRENT_CATEGORY,
              currentCategory: item._id,
            });
          }}
        >
          {item.name}
        </button>
      ))}
      <button
        onClick={() => {
          dispatch({
            type: UPDATE_CURRENT_CATEGORY,
            currentCategory: '',
          });
        }}
      >
        All
      </button>
      
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search for places"
          style={{ width: '100%', padding: '10px' }}
        />
        {suggestions.length > 0 && (
          <ul 
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
              pointerEvents: 'auto',
            }}
          >
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div
        ref={mapRef}
        style={{ width: '100%', height: '400px', marginTop: '20px', pointerEvents: 'auto' }}
      ></div>

      <h3>Search Results:</h3>
      {images.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '20px' }}>
          {images.map((url, index) => (
            <img key={index} src={url} alt={`Place ${index + 1}`} style={{ width: '18%', marginBottom: '10px' }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryMenu;
