import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import Topic from "./models/Topic.js";
import LearningList from "./models/LearningList.js";
import connectDB from "./db.js";

const app=express();
const PORT=3000;

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"../frontend")));

connectDB();
// ===============================
// 🧠 ROUTES
// ===============================
// ✅ Seed route
app.post("/api/seed", async (req, res) => {
  try {
    await Topic.deleteMany({});
    await LearningList.deleteMany({});
    const data = [
      { name: "List Comprehension", difficulty: 10, language: "Python", category: "Data Structures", image: "images/python_list_comprehension.png" },
      { name: "Decorators", difficulty: 15, language: "Python", category: "Functions", image: "images/python_decorators.png" },
      { name: "Generators", difficulty: 12, language: "Python", category: "Iterators", image: "images/python_generators.png" },
      { name: "Inheritance", difficulty: 20, language: "Java", category: "OOP", image: "images/java_inheritance.png" },
      { name: "Interfaces", difficulty: 18, language: "Java", category: "OOP", image: "images/java_interfaces.png" },
      { name: "Streams API", difficulty: 25, language: "Java", category: "Collections", image: "images/java_streams_api.png" },
      { name: "Promises", difficulty: 10, language: "JavaScript", category: "Asynchronous", image: "images/js_promises.png" },
      { name: "Arrow Functions", difficulty: 8, language: "JavaScript", category: "Functions", image: "images/js_arrow_functions.png" },
      { name: "Event Loop", difficulty: 14, language: "JavaScript", category: "Runtime", image: "images/js_event_loop.png" }
    ];
    const seeded = await Topic.insertMany(data);
    res.json({ message: "✅ Seeded successfully", count: seeded.length });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to seed topics" });
  }
});

app.get("/api/topics",async(req,res)=>{
  const allTopics = await Topic.find({});
  res.json(allTopics);
});

app.get("/api/learning",async (req,res)=>{
  const allLearning = await LearningList.find({});
  res.json(allLearning);
});

app.post("/api/learning/add",async(req,res)=>{
  const { name, difficulty, image, language } = req.body;
  const current=await LearningList.findOne({name});
  if(current){
    current.quantity+=1;
    current.totalDifficulty=current.difficulty*current.quantity;
    await current.save();
  }
  else{
  const item=await Topic.findOne({name}); 
  const newLearning =new LearningList({
    name: item.name,
    difficulty: item.difficulty,
    image: item.image,
    language: item.language,
    totalDifficulty:item.difficulty
  });
  await newLearning.save();
  }
  const updatedLearningList = await LearningList.find({});
  res.json(updatedLearningList);
});

app.post("/api/learning/decrement",async(req,res)=>{
  const { name } =req.body;
  const item=await LearningList.findOne({name});
  if(!name) return res.json("not exising");
  item.quantity-=1;
  if(item.quantity<=0){
    await LearningList.deleteOne({name});
  }else{
    item.totalDifficulty=item.difficulty*item.quantity;
    await item.save();
  }

  const updatedLearningList = await LearningList.find({});
  res.json(updatedLearningList);
});


// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Programming Topics API is running smoothly!");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
