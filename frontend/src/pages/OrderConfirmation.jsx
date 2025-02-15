import React from "react";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/OrderConfirmation.css";

const OrderConfirmation = () => {
	const navigate = useNavigate(); // Use this to redirect users
	// TODO: Implement the checkStatus function
	// If the user is logged in, fetch order details.
	// If not logged in, redirect the user to the login page.
	useEffect(() => {
		const checkStatus = async () => {
			// Implement logic here to check if the user is logged in
			// If not, navigate to /login
			// Otherwise, call the fetchOrderConfirmation function
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
				else {
					await fetchOrderConfirmation();
				}
			} catch (error) {
				console.error(error);
				return navigate('/notfound');
			}
		};
		checkStatus();
	}, []);

	// TODO: Use useState to manage the orderDetails and error state
	const [error,setError] = useState(null);
	const [order,setorder] = useState({
		order_id : "",
		user_id : "",
		order_date : "",
		total_amount : ""
	});

	const [orderitems,setorderitems] = useState([]);

	// TODO: Implement the fetchOrderConfirmation function
	// This function should fetch order details from the API and set the state
	const fetchOrderConfirmation = async () => {
		// Implement your API call to fetch order details
		// Update the orderDetails state with the response data
		// Show appropriate error messages if any.
		try {
			const response = await fetch(`${apiUrl}/order-confirmation`,{
				method : "GET",
				credentials : "include",
				headers: {
					"Content-Type" : "application/json"
				}
			});

			const data = await response.json();

			if(response.ok){
				console.log(data.orderItems);
				setorder(data.order);
				setorderitems(data.orderItems);
			}else{
				setError(data.message);
			}
		} catch (error) {
			console.log(error);
			return navigate("/notfound");
		}
	};

	if (error) {
		return (
			<>
			<Navbar />
			<div>{error}</div>
			</>
		);
	}

	return (
		<>
			{/* Implement the JSX for the order-confirmation page as described in the assignment. */}
			<div className="container">
				<h2>Order Confirmation</h2>
				<p>Thank you for your order! Your order has been successfully placed.</p>

				<h3>Order Details</h3>
				<p><strong>Order ID:</strong> { order.order_id }</p>
				<p><strong>Order Date:</strong> { order.order_date }</p>
				<p><strong>Total Amount:</strong> { order.total_amount }</p>

				<h3>Items in Your Order:</h3>
				<table>
					<thead>
						<tr>
							<th>Product ID</th>
							<th>Product Name</th>
							<th>Quantity</th>
							<th>Price per Item</th>
							<th>Total Price</th>
						</tr>
					</thead>
					<tbody>
						{orderitems.map((item) => (
							<tr>
								{/* TODO: Render product details here */}
								{/* Display item name, price, stock, quantity, and total */}
								<td>{item.product_id}</td><td>{item.name}</td><td>{item.quantity}</td><td>{item.price}</td><td>{item.total_price}</td>
							</tr>
						))}
					</tbody>
				</table>
				<div className="button-container">
					<button onClick={()=>(navigate("/products"))}>Continue Shopping...</button>
				</div>
			</div>
		</>
	);
};

export default OrderConfirmation;
