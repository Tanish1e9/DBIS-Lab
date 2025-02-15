import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

// Use the API you implemented earlier, 
// to check if the user is logged in or not
// if yes, navigate to the dashboard
// else to the login page

// use the React Hooks useNavigate and useEffect
// to implement this component

const Home = () => {
  const navigate = useNavigate(); // Use this to redirect users

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            }
          }
        );
        const data = await response.json();

        if (!response.ok) {
          return navigate('/login');
        }
        else{
          return navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
        return navigate('/notfound');
      }    
    };
    checkStatus();
  }, []);
  return <div>checking</div>;
};

export default Home;

