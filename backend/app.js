const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;
const saltRounds = 10;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'tanish',
  host: 'localhost',
  database: 'ecommerce',
  password: '235711',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code

function isLoggedIn(req,res,next){
  if(!req.session.userId){
    next();
  }
  else{
    res.status(400).json({message: "Already logged in"});
  }
}

function isAuthenticated(req, res, next) {
  if(req.session.userId) {
    next();
  }else{
    res.status(400).json({message: "Unauthorized"});
  }
}

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', isLoggedIn, async (req, res) => {
  try{
    var statement = "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)";
    
    // salt, hash, and store
    bcrypt.hash(req.body['password'], saltRounds, function(_, hash) {
      let values = [req.body['username'], req.body['email'],hash]; // query values
      // store hash in database
      pool.query(statement, values,async function(err,_) {
        if (err) {
          console.log("Email already registered");
          res.status(400).json({ message: "Error: Email is already registered."});
        }
        else {
            const result = await pool.query('SELECT user_id from users where email = $1',[req.body['email']]);
            req.session.userId = result.rows[0]['user_id'];
            req.session.save();
            res.status(200).json({message: "User Registered Successfully"});
        }
      });
    });
  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Error signing up"});
  }
  
});

// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  try{
    const result = await pool.query('select user_id,password_hash from users where email = $1',[req.body['email']]);
    tobe = null;
    if(result.rowCount > 0) tobe = result.rows[0]['password_hash'];
    
    bcrypt.compare(req.body['password'], tobe, function(err, matched) {
        if(matched){
          req.session.userId = result.rows[0]['user_id'];
          req.session.save();
          res.status(200).json({message:"Login successful"});
        }
        else res.status(400).json({message:"Invalid credentials"});
    });
  }catch(error){
    console.error(error);
    res.status(500).json({message:"Error logging in"});
  }
});


// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  if(req.session.userId){
    const result = await pool.query("select username from users where user_id = $1",[req.session.userId]);
    res.status(200).json({message: "Logged in", username: result.rows[0]['username']});
  }else{
    res.status(400).json({message: "Not logged in"});
  }
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({message: "Failed to log out"});
    } else{
      res.status(200).json({message : "Logged out successfully"});
    }
  });
});

////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database
app.get("/list-products", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT product_id,name,price,stock_quantity FROM products order by product_id');
    res.status(200).json({message: "Products fetched successfully", products: result.rows});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error listing products"});
  }
});

// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products where product_id = $1',[req.body['product_id']]);
    const result2 = await pool.query('SELECT * FROM cart where user_id = $1 and item_id = $2',[req.session.userId, req.body['product_id']]);

    let qty = "0";
    if(result2.rowCount > 0){
      qty = result2.rows[0]['quantity'];
    }

    if(result.rowCount == 0){
      res.status(400).json({message: "Invalid product ID"});
    }
    else if(parseInt(req.body['quantity'],10) + parseInt(qty,10) > parseInt(result.rows[0]['stock_quantity'],10)){
      res.status(400).json({message: `Insufficient stock for ${result.rows[0]["name"]}.`});
    }
    else if(parseInt(req.body['quantity'],10) + parseInt(qty,10) <= 0){
      pool.query("delete from cart where item_id = $1 and user_id = $2",[req.body['product_id'],req.session.userId]);
      res.status(200).json({message: `Successfully added ${req.body['quantity']} of ${result.rows[0]["name"]} to your cart.`});
    }
    else if(result2.rowCount == 0){
      pool.query("insert into cart values ($1,$2,$3)",[req.session.userId,req.body['product_id'],parseInt(req.body['quantity'],10)]);
      res.status(200).json({message: `Successfully added ${req.body['quantity']} of ${result.rows[0]["name"]} to your cart.`});
    }
    else{
      pool.query("update cart set quantity = quantity + $1 where user_id = $2 and item_id = $3",[req.body['quantity'],req.session.userId,req.body['product_id']]);
    
      res.status(200).json({message: `Successfully added ${req.body['quantity']} of ${result.rows[0]["name"]} to your cart.`});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error adding to cart"});
  }
});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query("SELECT *,price*quantity as total_price FROM products join cart on item_id = product_id where user_id = $1 order by product_id",[req.session.userId]);
    const result2 = await pool.query("select sum(price*quantity) as total_price from products join cart on item_id = product_id where user_id = $1",[req.session.userId]);

    if(result.rowCount == 0) res.status(200).json({message: "No items in cart.", cart: [], totalPrice: 0});
    else res.status(200).json({message: "Cart fetched successfully.", cart: result.rows, totalPrice: result2.rows[0]['total_price']});

  } catch (error) {
    console.error(error);
    res.status(500).json({message:"Error fetching cart"});
  }
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products where product_id = $1',[req.body['product_id']]);
    const result2 = await pool.query('SELECT * FROM cart where user_id = $1 and item_id = $2',[req.session.userId, req.body['product_id']]);

    if(result.rowCount == 0){
      res.status(400).json({message: "Invalid Product ID"});
    }
    else if(result2.rowCount == 0){
      res.status(400).json({message: "Item not present in your cart."});
    }
    else{
      pool.query("delete from cart where user_id = $1 and item_id = $2",[req.session.userId,req.body['product_id']]);
      res.status(200).json({message: "Item removed from your cart successfully."});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error removing item from cart"});
  }  
});
// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products where product_id = $1',[req.body['product_id']]);
    const result2 = await pool.query('SELECT * FROM cart where user_id = $1 and item_id = $2',[req.session.userId, req.body['product_id']]);
    
    let qty = "0";
    if(result2.rowCount > 0){
      qty = result2.rows[0]['quantity'];
    }

    if(result.rowCount == 0){
      res.status(400).json({message: "Invalid product ID"});
    }
    else if(parseInt(req.body['quantity'],10) + parseInt(qty,10) > parseInt(result.rows[0]['stock_quantity'],10)){
      res.status(400).json({message: `Requested quantity exceeds available stock`});
    }
    else if(parseInt(req.body['quantity'],10) + parseInt(qty,10) <= 0){
      pool.query("delete from cart where item_id = $1 and user_id = $2",[req.body['product_id'],req.session.userId]);
      res.status(200).json({message: "Cart updated successfully"});
    }
    else if(result2.rowCount == 0){
      pool.query("insert into cart values ($1,$2,$3)",[req.session.userId,req.body['product_id'],req.body['quantity']]);
      res.status(200).json({message: "Cart updated successfully"});
    }
    else{
      pool.query("update cart set quantity = quantity + $1 where user_id = $2 and item_id = $3",[req.body['quantity'],req.session.userId,req.body['product_id']]);
    
      res.status(200).json({message: "Cart updated successfully"});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error updating cart"});
  }
});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {
  try{
    const result = await pool.query("SELECT item_id,name, quantity, stock_quantity FROM cart JOIN products ON item_id = product_id WHERE user_id = $1 and quantity > stock_quantity",[req.session.userId]);
    const result2 = await pool.query("SELECT sum(quantity*price) as total_amount from cart join products on item_id = product_id WHERE user_id = $1",[req.session.userId]);
    const result3 = await pool.query("select coalesce(max(order_id)+1,1) as order_id from orders");
    const result4 = await pool.query("select * from cart join products on item_id = product_id where user_id = $1",[req.session.userId]);
    
    if (result.rowCount>0) {
      res.status(400).json({message: `Insufficient stock for ${result.rows[0]['name']}`});
    } 
    else if(result4.rowCount==0){
      res.status(400).json({message: "Cart is empty"});
    }
    else{
      pool.query("INSERT INTO orders(user_id,order_date,total_amount) VALUES ($1,NOW(),$2)", [req.session.userId,result2.rows[0]['total_amount']]);
      
      for(const row of result4.rows){
        pool.query("insert into orderitems values($1,$2,$3,$4)",[result3.rows[0]['order_id'],row['item_id'],row['quantity'],row['price']]);
      }
          
      res.status(200).json({message: "Order placed successfully"});  
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: "Error placing order"});
  }
});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {
  try{
    const result = await pool.query("select max(order_id) as s from orders where user_id = $1",[req.session.userId]);

    if(result.rowCount==0){
      return res.status(400).json({message: "Order not found"});
    }
  
    const result3 = await pool.query("select * from orders where order_id = $1",[result.rows[0]['s']]);
    const result2 = await pool.query("SELECT *,name FROM orderitems JOIN products ON item_id = product_id WHERE order_id = $1",[req.session.userId]);
    // order_id, product_id, quantity, price, product_name
    for (const row of result2.rows){
      pool.query("update products set stock_quantity = stock_quantity - $1 where product_id = $2",[row['quantity'],row['product_id']]);
    }
    pool.query("delete from cart where user_id = $1",[req.session.userId]);

    res.status(200).json({message: "Order fetch successfully", order: result3.rows[0], orderItems: result2.rows});

  } catch(error){
    console.error(error);
    res.status(500).json({message: "Error fetching order details"});
  }
});

app.get("/fetch-pincode", isAuthenticated, async (req, res) => {
  try{
    const response = await fetch(`https://api.postalpincode.in/pincode/${req.query.pincode}`,{
      method: "GET",
      headers: {
        "Content-Type" : "application/json"
      }
    });

    const data = await response.json();
    if(!response.ok){
      res.status(400).json({message: "Invalid PINCODE"});
    }
    else{
      res.status(200).json({state: data[0].PostOffice[0].State, name: data[0].PostOffice[0].Name});
    }
  }catch(error){
    console.log(error);
    res.status(500).json({message:"Failed to fetch pincode"});
  }
});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

