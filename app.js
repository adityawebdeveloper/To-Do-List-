const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connect to the MongoDB database
// mongoose.connect("mongodb+srv://aditya:test123@cluster0.fkej20b.mongodb.net/?retryWrites=true&w=majority/todolistDB", {useNewUrlParser: true});
// mongoose.connect("mongodb+srv://aditya:test123@cluster0.fkej20b.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true,useUnifiedTopology: true}); //this will create its own DB
mongoose.connect("mongodb+srv://aditya:test123@cluster0.fkej20b.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true,useUnifiedTopology: true}); //this will create todolistDB





// Define the schema for individual items in the todo list
const itemsSchema = {
  name: String
};

// Create a model based on the itemsSchema
const Item = mongoose.model("Item", itemsSchema);

// Create default items
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// Define the schema for a todo list
const listSchema = {
  name: String,
  items: [itemsSchema]
};

// Create a model based on the listSchema
const List = mongoose.model("List", listSchema);

// Handle the root route
app.get("/", function(req, res) {
  // Find all items in the Item collection
  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      // If there are no items, insert the default items to the Item collection
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      // Render the list template with the foundItems
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

// Handle custom list routes
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  // Find a list with the given name in the List collection
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        // If the list doesn't exist, create a new list with default items
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Render the list template with the foundList items
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

// Handle the post request to the root route
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    // Save the new item to the Item collection
    item.save();
    res.redirect("/");
  } else {
    // Find the list with the given name and push the new item to its items array
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// Handle the post request to delete an item
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    // Remove the item from the Item collection
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    // Find the list with the given name and pull the item from its items array
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
});

// Handle the about page route
app.get("/about", function(req, res){
  res.render("about");
});

// Start the server
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

























// const express = require("express");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const _ = require("lodash");

// const app = express();

// app.set('view engine', 'ejs');

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

// const itemsSchema = {
//   name: String
// };

// const Item = mongoose.model("Item", itemsSchema);


// const item1 = new Item({
//   name: "Welcome to your todolist!"
// });

// const item2 = new Item({
//   name: "Hit the + button to add a new item."
// });

// const item3 = new Item({
//   name: "<-- Hit this to delete an item."
// });

// const defaultItems = [item1, item2, item3];

// const listSchema = {
//   name: String,
//   items: [itemsSchema]
// };

// const List = mongoose.model("List", listSchema);


// app.get("/", function(req, res) {

//   Item.find({}, function(err, foundItems){

//     if (foundItems.length === 0) {
//       Item.insertMany(defaultItems, function(err){
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Successfully savevd default items to DB.");
//         }
//       });
//       res.redirect("/");
//     } else {
//       res.render("list", {listTitle: "Today", newListItems: foundItems});
//     }
//   });

// });

// app.get("/:customListName", function(req, res){
//   const customListName = _.capitalize(req.params.customListName);

//   List.findOne({name: customListName}, function(err, foundList){
//     if (!err){
//       if (!foundList){
//         //Create a new list
//         const list = new List({
//           name: customListName,
//           items: defaultItems
//         });
//         list.save();
//         res.redirect("/" + customListName);
//       } else {
//         //Show an existing list

//         res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
//       }
//     }
//   });



// });

// app.post("/", function(req, res){

//   const itemName = req.body.newItem;
//   const listName = req.body.list;

//   const item = new Item({
//     name: itemName
//   });

//   if (listName === "Today"){
//     item.save();
//     res.redirect("/");
//   } else {
//     List.findOne({name: listName}, function(err, foundList){
//       foundList.items.push(item);
//       foundList.save();
//       res.redirect("/" + listName);
//     });
//   }
// });

// app.post("/delete", function(req, res){
//   const checkedItemId = req.body.checkbox;
//   const listName = req.body.listName;

//   if (listName === "Today") {
//     Item.findByIdAndRemove(checkedItemId, function(err){
//       if (!err) {
//         console.log("Successfully deleted checked item.");
//         res.redirect("/");
//       }
//     });
//   } else {
//     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
//       if (!err){
//         res.redirect("/" + listName);
//       }
//     });
//   }


// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });
