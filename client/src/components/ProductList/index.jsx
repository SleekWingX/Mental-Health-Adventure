import { useEffect } from 'react';
import ProductItem from '../ProductItem';
import { useStoreContext } from '../../utils/GlobalState';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import { useQuery } from '@apollo/client';
import { QUERY_PRODUCTS } from '../../utils/queries';
import { idbPromise } from '../../utils/helpers';
import spinner from '../../assets/spinner.gif';

function ProductList() {
  const [state, dispatch] = useStoreContext();

  const { currentCategory, currentLocation, products } = state;

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  useEffect(() => {
    if (data) {
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products,
      });
      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });
    } else if (!loading) {
      idbPromise('products', 'get').then((products) => {
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products,
        });
      });
    }
  }, [data, loading, dispatch]);

  function filterProducts() {
    if (!currentCategory) {
      return products;
    }

    return products.filter(
      (product) => product.category._id === currentCategory
    );
  }

  function getMostRecommendedProduct() {
    // Assuming products have a `location` and `recommendationScore` field
    if (!currentLocation) {
      return null;
    }

    const locationProducts = products.filter(
      (product) => product.location && product.location === currentLocation.name
    );

    if (locationProducts.length) {
      return locationProducts.reduce((max, product) => 
        max.recommendationScore > product.recommendationScore ? max : product
      );
    }

    return null;
  }

  const mostRecommendedProduct = getMostRecommendedProduct();

  return (
    <div className="my-2">
      <h2>Most Recommended Product:</h2>

      {mostRecommendedProduct && (
        <div>
          <h3>Most Recommended Product for {currentLocation.name}:</h3>
          <ProductItem
            key={mostRecommendedProduct._id}
            _id={mostRecommendedProduct._id}
            image={mostRecommendedProduct.image}
            name={mostRecommendedProduct.name}
            price={mostRecommendedProduct.price}
            quantity={mostRecommendedProduct.quantity}
          />
        </div>
      )}

      {products.length ? (
        <div className="flex-row">
          {filterProducts().map((product) => (
            <ProductItem
              key={product._id}
              _id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      {loading ? <img src={spinner} alt="loading" /> : null}
    </div>
  );
}

export default ProductList;
