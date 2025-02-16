import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Login = () => {
  const navigate = useNavigate(); // Use this to redirect users


  // useEffect checks if the user is already logged in
  // if already loggedIn then it will simply navigate to the dashboard
  // TODO: Implement the checkStatus function.
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
  }, []);

  // Read about useState to manage form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errormessage,seterrormessage] = useState(null);

  // TODO: This function handles input field changes
  const handleChange = (e) => {
    // Implement your logic here
    const { name, value } = e.target;
    
    // Read about the spread operator (...) to understand this syntax
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // TODO: Implement the login operation
  // This function should send form data to the server
  // and handle login success/failure responses.
  // Use the API you made for handling this.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement the login logic here
    try{
      const response = await fetch(`${apiUrl}/login`,{
          method : "POST",
          credentials : "include",
          headers : {
              "Content-Type" : "application/json"
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
      });

      const data = await response.json();
      if(response.ok){
        return navigate('/dashboard');
      }
      else{
        console.log(data.message);
        seterrormessage(data.message);
      }
    } catch(error){
      console.log(error);
      return navigate('/notfound');
    }
  };

  // TODO: Use JSX to create a login form with input fields for:
  // - Email
  // - Password
  // - A submit button
  return (
    <div>   
      <h3>{errormessage}</h3>   
      <form onSubmit={handleSubmit}>
        <label>Email: <input type="email" id="email" name="email" required onChange={handleChange}/> </label><br/>
        <label>Password <input type="password" id="password" name="password" required onChange={handleChange}/> </label><br/>
        <button type="submit">Login</button>
        <button onClick={()=>navigate("/signup")}>Signup</button>
      </form>
    </div>
  );
};

export default Login;
