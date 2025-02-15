import React, { useState, useEffect, use } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Cart.css";

const Cart = () => {
	const navigate = useNavigate();
	// TODO: Implement the checkStatus function
	// If the user is already logged in, fetch the cart.
	// If not, redirect to the login page.
	useEffect(() => {
		const checkStatus = async () => {
			// Implement your logic to check if the user is logged in
			// If logged in, fetch the cart data, otherwise navigate to /login
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
				if (response.ok) {
					fetchCart();
				}
				else {
					return navigate('/login');
				}
			} catch (error) {
				console.error(error);
				return navigate('/notfound');
			}
		};
		checkStatus();
	}, []);

	// TODO: Manage cart state with useState
	// cart: Stores the items in the cart
	const [cart, setCart] = useState([]);
	// totalPrice: Stores the total price of all cart items
	const [totalPrice, setTotalPrice] = useState(0);
	// error: Stores any error messages (if any)
	const [error, setError] = useState(null);
	// message: Stores success or info messages
	const [message, setMessage] = useState(null);

	const [errors,seterrors] = useState({});
	const [formData, setFormData] = useState({
		pincode: "",
		state: "",
		city: "",
		street: "",
	  });
	const [formerror, setformerror] = useState(null);

	// TODO: Implement the fetchCart function
	// This function should fetch the user's cart data and update the state variables
	const fetchCart = async () => {
		// Implement your logic to fetch the cart data
		// Use the API endpoint to get the user's cart
		try {
			const response = await fetch(`${apiUrl}/display-cart`,{
				method : "GET",
				credentials : "include",
				headers: {
					"Content-Type" : "application/json"
				}
			});
			const data = await response.json();
			if(response.ok){
				setTotalPrice(data.totalPrice);
				setCart(data.cart);
				setError(null);
			}else{
				setError(data.message);
			}
			setMessage(data.message);
		}catch(error){
			console.log(error);
			return navigate('/notfound');
		}
  };

	// TODO: Implement the updateQuantity function
	// This function should handle increasing or decreasing item quantities
	// based on user input. Make sure it doesn't exceed stock limits.
	const updateQuantity = async (productId, change, currentQuantity, stockQuantity) => {
		// Implement your logic for quantity update
		// Validate quantity bounds and update the cart via API
		if(currentQuantity + change > stockQuantity){
			seterrors((preverrors)=>({...preverrors,[productId]:"Exceeds stock quantity"}));
		}
		else{
			seterrors((preverrors)=>({...preverrors,[productId]:null}));
			try{
				const response = await fetch(`${apiUrl}/update-cart`,{
					method : "POST" ,
					credentials : "include",
					headers : {
						"Content-Type" : "application/json"
					},
					body: JSON.stringify({
						product_id : productId,
						quantity : change 
					})
				});
				const data = await response.json();
				if(!response.ok){
					setError(data.message);
				}
				else{
					setError(null);
					fetchCart();
				}
				
			}catch(error){
				console.log(error);
				return navigate("/notfound");
			}

		}
	};

	// TODO: Implement the removeFromCart function
	// This function should remove an item from the cart when the "Remove" button is clicked
	const removeFromCart = async (productId) => {
		// Implement your logic to remove an item from the cart
		// Use the appropriate API call to handle this
		try{
			const response = await fetch(`${apiUrl}/remove-from-cart`,{
				method : "POST",
				credentials : "include",
				headers: {
					"Content-Type" : "application/json"
				},
				body: JSON.stringify({
					product_id : productId
				})
			});
			const data = await response.json();
			if(!response.ok){
				console.log(data.message);
				setError(data.message);
			}
			else{
				setError(null);
				fetchCart();
			}
		}catch(error){
			console.log(error);
			return navigate("/notfound");
		}
	};

	// TODO: Implement the handleCheckout function
	// This function should handle the checkout process and validate the address fields
	// If the user is ready to checkout, place the order and navigate to order confirmation
	const handleCheckout = async () => {
		// Implement your logic for checkout, validate address and place order
		// Make sure to clear the cart after successful checkout
		try{
			const response = await fetch(`${apiUrl}/place-order`,{
				method : "POST",
				credentials : "include",
				headers : {
					"Content-Type" : "application/json"
				}
			});

			const data = await response.json();

			if(response.ok){
				return navigate("/order-confirmation");
			}	
			else{
				setError(data.message);
			}
		}catch(error){
			console.log(error);
			navigate("/notfound");
		}
	};

	// TODO: Implement the handlePinCodeChange function
	// This function should fetch the city and state based on pincode entered by the user
	const handlePinCodeChange = async (e) => {
		// Implement the logic to fetch city and state by pincode
		// Update the city and state fields accordingly
		setFormData({...formData,pincode: e.target.value});
		try{
			const response = await fetch(`${apiUrl}/fetch-pincode?pincode=${e.target.value}`,{
				method: "GET",
				credentials: "include",
				headers : {
					"Content-Type" : "application/json"
				}
			});
			
			const data = await response.json();

			if(response.ok){
				setFormData({...formData,state: data.state, city: data.name});
				setformerror(null);
			}
			else{
				setformerror("Invalid PINCODE");
			}
		}catch(error){
			console.log(error);
			return navigate("/notfound");
		}
	};

	// TODO: Display error messages if any error occurs
	if (error) {
		return (
			<>
			<Navbar />
			<div className="cart-error">{error}</div>
			</>
		);
	}

	return (
		<>	<Navbar />
			<div className="cart-container">
				<h1>Your Cart</h1>

				{/* TODO: Display the success or info message */}
				{message && <div className="cart-message">{message}</div>}

				{/* TODO: Implement the cart table UI */}
				{/* If cart is empty, display an empty cart message */}
				{cart.length === 0 ? (
					<p className="empty-cart-message">Your cart is empty</p>
				) : (
					<>
						<table className="cart-table">
							<thead>
								<tr>
									<th>Product</th>
									<th>Price</th>
									<th>Stock Available</th>
									<th>Quantity</th>
									<th>Total</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{/* TODO: Render cart items dynamically */}
								{/* Use map() to render each cart item */}
								{cart.map((item) => (
									<tr key={item.item_id}>
										{/* TODO: Render product details here */}
										{/* Display item name, price, stock, quantity, and total */}
										<td>{item.name}</td><td>{item.price}</td><td>{item.stock_quantity}</td>
										<td>
											<button onClick={()=>updateQuantity(item.item_id,1,item.quantity,item.stock_quantity)}>+</button>
											{item.quantity}
											<button onClick={()=>updateQuantity(item.item_id,-1,item.quantity,item.stock_quantity)}>-</button>
											{errors[item.item_id] && <p>{errors[item.item_id]}</p>}
										</td>
										<td>{item.total_price}</td><td><button onClick={()=>(removeFromCart(item.item_id))}>Remove</button></td>
									</tr>
								))}
							</tbody>
						</table>

						{/* TODO: Implement the address form */}
						{/* Allow users to input pincode, street, city, and state */}
						<form>
							{/* Implement address fields */}
							<label>Pincode:</label><input type="text" name="pincode" onBlur={handlePinCodeChange} placeholder="Enter pincode"/><br/>
							{formerror && <p>{formerror}</p>}
							<label>Street:</label><input type="text" name="street" onChange={(e)=>setFormData({...formData,[e.target.name]:e.target.value})} placeholder="Enter street"/><br/>
							<label>City:</label><input type="text" name="city" value={formData.city} placeholder="Enter city" readOnly/><br/>
							<label>State:</label><input type="text" name="state" value={formData.state} placeholder="Enter state" readOnly/><br/>
						</form>

						{/* TODO: Display total price and the checkout button */}
						<div className="cart-total">
							{/* Display the total price */}
							<h3>Total: ${totalPrice}</h3>
							{/* Checkout button should be enabled only if there are items in the cart */}
							{cart.length > 0 ? <button onClick={handleCheckout} disabled={cart.length === 0}>Proceed to Checkout</button>:""}
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default Cart;
