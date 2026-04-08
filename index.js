import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import path from "path"


const app = express();
const publicPaht = path.resolve('public')
app.use(express.static(publicPaht))
app.set("view engine",'ejs')


const dbname ="projectTodo";
const collectionName="todo";
const url ="mongodb://localhost:27017"
const client = new MongoClient(url)

const connection =async()=>{
    const connect = await client.connect();
    return  await connect.db(dbname)
}

app.use(express.urlencoded({extended:false}));
app.get("/",async(req,resp)=>{
    const db = await connection();
    const collection = db.collection(collectionName);
    const result  =  await collection.find().toArray();
    
    resp.render("list",{result})
});

app.get("/add",(req,resp)=>{
    resp.render("add")
});

app.get("/update",(req,resp)=>{
    resp.render("update")
});

app.post("/update",(req,resp)=>{
    resp.redirect("/")
});


app.post("/add",async(req,resp)=>{
    const db = await connection();
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(req.body);
    if(result){
         resp.redirect("/")
    }else{
         resp.redirect("/add")
    } 
});


app.get("/delete/:id", async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({
        _id: new ObjectId(req.params.id)   
    });
console.log("ID:", req.params.id);
    if (result) {
        resp.redirect("/");
    } else {
        resp.send("/error");
    }
});

app.get("/update/:id", async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);

    const data = await collection.findOne({
        _id: new ObjectId(req.params.id)
    });

    resp.render("update", { data });   
});

app.post("/update/:id", async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);

    await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        {
            $set: {
                title: req.body.title,
                description: req.body.description
            }
        }
    );

    resp.redirect("/");
});

app.post("/multi-delete", async (req, resp) => {
    try {
        const ids = req.body["selectedTask[]"];   // ✅ FIX

        if (!ids) {
            return resp.redirect("/");
        }

        const idArray = Array.isArray(ids) ? ids : [ids];

        const db = await connection();
        const collection = db.collection(collectionName);

        await collection.deleteMany({
            _id: {
                $in: idArray.map(id => new ObjectId(id))
            }
        });

        resp.redirect("/");
    } catch (err) {
        console.log(err);
        resp.send("Error deleting tasks");
    }
});

app.listen(4800)