import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Signup = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the checkStatus function.
  // If the user is already logged in, make an API call 
  // to check their authentication status.
  // If logged in, redirect to the dashboard.
  useEffect(() => {
    const checkStatus = async () => {
        // Implement your logic here
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
              return navigate('/dashboard');
          }
        } catch (error) {
          console.error(error);
          return navigate('/notfound');
        }    
        
      };
      checkStatus();
  }, [navigate]);

  // Read about useState to understand how to manage component state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // This function handles input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Read about the spread operator (...) to understand this syntax
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // TODO: Implement the sign-up operation
  // This function should send form data to the server
  // and handle success/failure responses.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement the sign-up logic here
    try{
      const response = await fetch(`${apiUrl}/signup`,{
          method : "POST",
          credentials : "include",
          headers : {
              "Content-Type" : "application/json"
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
      });

      if(response.ok){
        return navigate('/dashboard');
      }
    } catch(error){
      console.log(error);
      return navigate('/notfound');
    }
    
  };

  // TODO: Use JSX to create a sign-up form with input fields for:
  // - Username
  // - Email
  // - Password
  // - A submit button
  return (
    <div>
      <form>
        <label>Username: <input type="text" id="username" name="username" required onChange={handleChange}/></label><br/>
        <label>Email: <input type="email" id="email" name="email" required onChange={handleChange}/> </label><br/>
        <label>Password <input type="password" id="password" name="password" required onChange={handleChange}/> </label><br/>
        <button type="submit" onClick={handleSubmit}>Signup</button>
      </form>
    </div>
  );
};

export default Signup;
