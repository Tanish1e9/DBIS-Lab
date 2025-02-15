import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Products = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the checkStatus function.
  // This function should check if the user is logged in.
  // If not logged in, redirect to the login page.
  // if logged in, fetch the products
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
            return navigate('/login');
        }
        else{
            await fetchProducts();
        }
      } catch (error) {
        console.error(error);
        return navigate('/notfound');
      }  
    };
    checkStatus();
  }, []);

  // Read about useState to understand how to manage component state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setfilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setquantities] = useState({});
  const [errormessages, seterrormessages] = useState({});  
  const [cartmessages, setCartMessages] = useState({});

  // NOTE: You are free to add more states and/or handler functions
  // to implement the features that are required for this assignment

  // TODO: Fetch products from the APIx
  // This function should send a GET request to fetch products
  const fetchProducts = async () => {
    // Implement the API call here to fetch product data
    try{
      const response = await fetch(`${apiUrl}/list-products`,{
        method : "GET",
        credentials : "include",
        headers : {
          "Content-Type" : "application/json",
        },
      });
      const data = await response.json();

      if(response.ok){
        setProducts(data.products);
        setfilteredProducts(data.products);
      }
      else{
        return navigate('/notfound');
      }
    }catch(error){
      console.log(error);
      return navigate('/notfound');
    }
  };
  
  // TODO: Implement the product quantity change function
  // If the user clicks on plus (+), then increase the quantity by 1
  // If the user clicks on minus (-), then decrease the quantity by 1
  const handleQuantityChange = (productId, change, stock) => {
      setquantities((prevQuantities) => {
        const newQuantity =  (prevQuantities[productId] || 0) + change;
        if(newQuantity > stock){
          seterrormessages({...errormessages,[productId]:"Not enough stock"});
        }
        else{
          seterrormessages({...errormessages,[productId]:null});
        }
        return {...prevQuantities, [productId]: newQuantity}
    });
  }

  // TODO: Add the product with the given productId to the cart
  // the quantity of this product can be accessed by using a state
  // use the API you implemented earlier
  // display appropriate error messages if any
  const addToCart = async (productId) => {
    try{
      if(quantities[productId]===0){
        setCartMessages({
          ...cartmessages,
          [productId]: "Enter a non-zero quantity!",
        });
      }
      else{
        const response = await fetch(`${apiUrl}/add-to-cart`,{
          method : "POST",
          credentials : "include",
          headers: {
            "Content-Type" : "application/json"
          },
          body: JSON.stringify({
            product_id : productId,
            quantity : quantities[productId] || 0
          })
        });
        const data = await response.json();
        if(response.ok){
              setCartMessages({
                ...cartmessages,
                [productId]: (quantities[productId] || 0) > 0 ? "Added successfully!" : "Removed successfully!",
              });
        }
        else{
              console.log(data.message);
              setCartMessages({
                ...cartmessages,
                [productId]: "Failed to add!",
              });
        }
      }
      setTimeout(() => {
        setCartMessages({
          ...cartmessages,
          [productId]: null,
        });
      }, 3000);

      setquantities((prevQuantities)=>({
        ...prevQuantities,
        [productId]:0,
      }));
    }catch(error){
      console.log(error);
      return navigate('/notfound');
    }
  }

  // TODO: Implement the search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement the search logic here
    // use Array.prototype.filter to filter the products
    // that match with the searchTerm
    setfilteredProducts(products.filter(elem => elem.name === searchTerm || searchTerm === ""));
  };


  // TODO: Display products with a table
  // Display each product's details, such as ID, name, price, stock, etc.
  return (
    <>
      <Navbar />
      <div>
        <h1>Product List</h1>
        {/* Implement the search form */}
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" onClick = {handleSearch}>Search</button>
        </form>
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Stock Available</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length>0 ? (filteredProducts.map((product, index) => (
              <tr><td>{product.product_id}</td><td>{product.name}</td><td>{product.price}</td><td>{product.stock_quantity}</td>
              <td>
                <button onClick={() => handleQuantityChange(product.product_id,1,product.stock_quantity)}>+</button>
                {quantities[product.product_id] || 0}
                <button onClick={() => handleQuantityChange(product.product_id,-1,product.stock_quantity)}>-</button>
                {errormessages[product.product_id] && <p>{errormessages[product.product_id]}</p>}
              </td>
              <td>
                <button onClick={() => addToCart(product.product_id)}>Add to cart</button>
                {cartmessages[product.product_id] && <p>{cartmessages[product.product_id]}</p>}
              </td>
              </tr>
            ))) : <tr><td colSpan={6}>No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Products;
