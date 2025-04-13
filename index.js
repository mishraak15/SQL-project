const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");

// CREATE CONNECTION WITH SQL-->
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "Akash15@#",
});

// // RUN A QUERY IN SQL-->
// try {
//   //Since it may cause an error so put it in a try block

//   connection.query("SHOW TABLES", (err, result) => {
//     //It will take a query and a call-back function
//     // More better way is to use a varible for query and use it here
//     if (err) {
//       //IF error arise in running Query then then throw error
//       throw err;
//     }

//     console.log(result);
//   });
// } catch (error) {
//   console.log(error);
// }

// // let q= "CREATE TABLE fake_data(id INT PRIMARY KEY, username VARCHAR(50) UNIQUE, email VARCHAR(20), password INT)";
// // try{

// //     connection.query(q,(err,result)=>{
// //         if(err){
// //             throw err;
// //         }

// //         console.log(result);
// //     });

// // }
// // catch(error){
// //     console.log(error);
// // }

// // INSERT multiple data at once.
// let q = "INSERT INTO fake_data(id, username, email, password) VALUES ?";
// // '?' acts as parameter which can take variable values..........^^^^^^^^

// // users is a array of array in which each element contain all the data of a single user.
// let users = [
//   [23, "new_user123", "new1@gamil.com", 4572],
//   [45, "new_user674", "new2@gamil.com", 1693],
// ];

// // try {
// //   connection.query(q, [users], (err, result) => {
// //     if (err) {
// //       throw err;
// //     }

// //     console.log(result);
// //   });
// // } catch (error) {
// //   console.log(error);
// // }

// // INSERT 100 fake data at once

function createRandomUser() {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
    // faker.image.avatar(),
    //   birthdate: faker.date.birthdate(),
    //   registeredAt: faker.date.past(),
  ];
}

// let data = [];

// for (let i = 1; i <= 100; i++) {
//   data.push(createRandomUser()); //Every single time the function is called a fake data is inserted into the array.
// }

// // Data array now have 100 fake data.
// let q1= "INSERT INTO user(id, username, email, password) VALUES ?";
// try {
//   connection.query(q1, [data], (err, result) => {
//     if (err) {
//       throw err;
//     }

//     console.log(result);
//   });
// } catch (error) {
//   console.log(error);
// }

// connection.end(); // AS the connection is created it will keep running to stop you should use it;

const express = require("express");
const path = require("path");
const app = express();
var methodOverride = require("method-override");
const {v4: uuid}=require("uuid");
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// HOME Route
app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM user";

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(result[0]["count(*)"]);
      res.render("home.ejs", { userCount: result[0]["count(*)"] });
    });
  } catch (error) {
    console.log(error);
    res.send("Error in fetching data");
  }
  // connection.end();   //If you end the connection you cannot add or edit any data in the DB, Even if added by work becnch it will not be visible to the UI
});

// SHOW ALL USERS Route
app.get("/users", (req, res) => {
  let q = "SELECT * FROM user";

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let users = result;
      res.render("users.ejs", { users });
    });
  } catch (error) {
    console.log(error);
    res.send("Error in fetching data");
  }
});

// EDIT a USER
app.get("/user/:id/edit", (req, res) => {
  const { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      console.log(user);
      res.render("edit.ejs", { user });
    });
  } catch (error) {
    console.log(error);
    res.send("Error in fetching data");
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username: newUsername, password: formPassword } = req.body;
  // console.log("Username: ", newUsername, "Password: ", formPassword);

  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;

      let user = result[0];

      if (user.password !== formPassword) {
        console.log("Incorrect Password!! Updation Failed");
        res.send(`<h2>Delete Unsuccessful!! Wrong Credentials</h2> <button><a href='/user/${id}/edit'>Back</a></button>`);
      } 
      
      else {
        let q = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;

        connection.query(q, (err, result) => {
          if (err) throw err;
          console.log(result);
          console.log("Updation Successful!!");
          res.redirect("/users");
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.send("Error in fetching data");
  }
});

// ADD a new User

app.get("/users/new", (req, res) => {
  res.render("newUser.ejs");
});

app.post("/users",(req,res)=>{
     let{username,email,password}=req.body;
     let id= uuid();
     let data=[id,username,email,password];
  
     let q=`INSERT INTO user (id,username,email,password) VALUES(?)`;
      try {
    connection.query(q,[data],(err, result) => {
      if (err) throw err;
      console.log(result);
      res.redirect("/users");
    });
  } catch (error) {
    console.log(error);
    res.send("Error in fetching data");
  }
});


// DELETE a USER

app.get("/user/:id/delete", (req, res) => {
  const { id } = req.params;
  res.render("delete.ejs",{id});
});


app.delete("/user/:id/delete",(req,res)=>{
    const {id}=req.params;
    let {email:formEmail,password:formPassword}=req.body;
    console.log({formEmail:formEmail,formPassword:formPassword});
    
    let q=`SELECT * FROM user WHERE id='${id}'`;

    try {
      connection.query(q,(err, result) => {
        if (err) throw err;
        let user=result[0];
        console.log(user);
        if(user.email==formEmail && user.password==formPassword){
          let q=`DELETE FROM user WHERE id='${id}'`;
          connection.query(q,(err,result)=>{
            console.log("Delete Successful!!");
            res.redirect("/users");
                
          });
        }
        else{
          res.send(`<h2>Delete Unsuccessful!! Wrong Credentials</h2> <button><a href='/user/${id}/delete'>Back</a></button>`);
        }
      });
    } catch (error) {
      console.log(error);
      res.send("Error in fetching data");
    }
});

app.listen(port, () => {
  console.log(`App is runnning at port: ${port}`);
});
