import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Dashboard = () => {
  const navigate = useNavigate(); // Use this to redirect users
  const [username, setUsername] = useState("User");

  // TODO: Implement the checkStatus function.
  // This function should check if the user is logged in.
  // If not logged in, redirect to the login page.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here to check login status
      // If logged in, then use setUsername to display
      // the username
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

        const data = await response.json();
        if (!response.ok) {
          return navigate("/login");
        }
        else{
          setUsername(data.username);
        }
      } catch (error) {
        console.error(error);
      }   
    };
    checkStatus();
  }, []);


  return (
    <div>
      <Navbar />
      <h1>Hi {username}!</h1>
      <div>Welcome to the Ecommerce App</div>
    </div>
  );
};

export default Dashboard;
