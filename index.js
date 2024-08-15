const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const {v4:uuidv4} = require("uuid");
function generateUUID(){
  return uuidv4();
}

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = [];

app.route("/api/users")
.post(
  (req,res) =>{
    const uniqueID = generateUUID();
    const userName = req.body.username;
    const data = {_id:uniqueID,username:userName};
    users.push(data);
    res.json(data);
  }
)
.get(
  (req,res)=>{
    res.json(users);
  }
)

app.post("/api/users/:_id/exercises",
  (req,res)=>{
    const {description,duration} = req.body;
    const date = req.body.date?new Date( req.body.date).toDateString():new Date().toDateString();
    let user = users.find(user=>user._id == req.params._id);
    const d_int = parseInt(duration);
    const exercise = {duration:d_int,date,description};
    if(!user.exercises) user.exercises = [];
    user.exercises.push(exercise);
    res.json({_id:user._id,username:user.username,...exercise});
  }
)

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { to, from, limit } = req.query;
  
  // Convert to and from dates, or set to null if not provided
  const toDate = to ? new Date(to).getTime() : null;
  const fromDate = from ? new Date(from).getTime() : null;
  
  // Find the user by ID
  const user = users.find(user => user._id === userId);

  // Error handling for invalid user ID
  if (!user) {
    return res.json({ error: "invalid id" });
  }

  const { _id = "", exercises = [], username = "" } = user;
  
  let updateList = exercises;

  // Filter exercises by date range if both `from` and `to` are provided
  if (fromDate && toDate) {
    updateList = exercises.filter(exercise => {
      const exerciseDate = new Date(exercise.date).getTime();
      return exerciseDate >= fromDate && exerciseDate <= toDate;
    });
  }

  // Apply the limit if provided
  if (limit) {
    updateList = updateList.slice(0, parseInt(limit));
  }
  updateList = updateList.map(exercise => ({
    ...exercise,
    date: new Date(exercise.date).toDateString(),
    description:(exercise.description).toString()
  }));

  // Prepare the final response
  res.json({
    _id,
    count: updateList.length,
    username,
    log: updateList
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
