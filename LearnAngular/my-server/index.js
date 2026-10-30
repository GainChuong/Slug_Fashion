const express=require("express")
const app=express()
const port=3000
const morgan=require("morgan")
app.use(morgan("combined"))

const path=require("path")
const fs = require('fs');
app.use(express.static(path.join(__dirname,"public")))

const cors=require("cors")
app.use(cors())
const bodyParser=require("body-parser")
//app.use(bodyParser.json())
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

//create default API
app.get("/",(req,res)=>{
    res.send("Hello Restful API")    
})
app.listen(port,()=>{
    console.log(`My Server listening on port ${port}`)
})
let  database=[
    {"BookId":"b1","BookName":"Kỹ thuật lập trình cơ bản","Price":70,"Image":"b1.png"},
    {"BookId":"b2","BookName":"Kỹ thuật lập trình nâng cao","Price":100,"Image":"b2.png"},
    {"BookId":"b3","BookName":"Máy học cơ bản","Price":200,"Image":"b3.png"},
    {"BookId":"b4","BookName":"Máy học nâng cao","Price":300,"Image":"b4.png"},
    {"BookId":"b5","BookName":"Lập trình Robot cơ bản","Price":250,"Image":"p5.png"},
  ]
app.get("/books",(req,res)=>{
    res.send(database)
})
app.get("/books/:id",cors(),(req,res)=>{
    id=req.params["id"]
    let p=database.find(x=>x.BookId==id)
    res.send(p)    
})
// ============================================
// API Lọc sách theo khoảng giá (min/max)
// URL Gọi: http://localhost:3000/books/filter/price?min=250&max=300
// ============================================
app.get("/books/filter/price", cors(), (req, res) => {
    // 1. Lấy giá trị min và max từ Query String
    let minPrice = req.query.min;
    let maxPrice = req.query.max;
    // 2. Kiểm tra tính hợp lệ của tham số
    if (!minPrice || !maxPrice) {
        return res.status(400)
                  .send("Vui lòng cung cấp đầy đủ tham số ?min=...&max=...");
    }
    // 3. Ép kiểu về số và thực hiện lọc
    let min = parseFloat(minPrice);
    let max = parseFloat(maxPrice);
    let filteredBooks = database.filter(x => x.Price >= min && x.Price <= max);
    // 4. Trả về kết quả
    res.send(filteredBooks);
});
const requireBearerAuth = async (req, res, next) => {
    const authorization = req.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).send("Bearer token is required.");
    }

    try {
        const response = await fetch("http://localhost:3002/user-session", {
            headers: { Authorization: authorization }
        });
        if (!response.ok) {
            return res.status(401).send("Bearer token is invalid or expired.");
        }
        return next();
    } catch (error) {
        console.error("Could not verify bearer token with the authentication server:", error);
        return res.status(503).send("Authentication service is unavailable.");
    }
};

app.post("/books",cors(),requireBearerAuth,(req,res)=>{   
    let newBook = req.body;
    if (newBook.ImageBase64) {
        // Tách bỏ phần header của Base64 (ví dụ: "data:image/png;base64,")
        const base64Data = newBook.ImageBase64.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `${newBook.BookId}.png`;
        const destPath = path.join(__dirname, 'public', 'images', fileName);
        try {
            // Ghi chuỗi mã hóa thành file ảnh
            fs.writeFileSync(destPath, base64Data, 'base64');
            newBook.Image = fileName;
        } catch (error) {
            return res.status(500).send("Lỗi lưu ảnh Base64");
        }
        delete newBook.ImageBase64;
    }
    database.push(newBook);
    res.send(database);
});
app.put("/books", cors(), requireBearerAuth, (req, res) => {
    let updatedBook = req.body;
    // 1. Find the index of the book to update in the array
    const index = database.findIndex(x => x.BookId === updatedBook.BookId);
    // If the book is not found, return a 404 error
    if (index === -1) {
        return res.status(404).send("Book not found!");
    }
    // 2. Check if the Client sent a new image
    if (updatedBook.ImageBase64) {
        // Has new image -> Overwrite the image file (like POST)
        const base64Data = updatedBook.ImageBase64.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `${updatedBook.BookId}_${Date.now()}.png`;
        const destPath = path.join(__dirname, 'public', 'images', fileName);        
        try {
            // This function will automatically overwrite the old .png file if it exists
            fs.writeFileSync(destPath, base64Data, 'base64');
            updatedBook.Image = fileName;
        } catch (error) {
            return res.status(500).send("Error saving Base64 image!");
        }        
        // Delete the base64 string to save memory
        delete updatedBook.ImageBase64;
    } 
    else {
        // NO new image -> Keep the old image name from the database
        updatedBook.Image = database[index].Image;
    }
    // 3. Overwrite the new data at the correct index
    database[index] = updatedBook;
    // 4. Return the book list so Angular can update the UI
    res.send(database);
});

app.delete("/books/:id", requireBearerAuth, (req, res) => {
    const index = database.findIndex(book => book.BookId === req.params.id);
    if (index === -1) {
        return res.status(404).send("Book not found!");
    }
    database.splice(index, 1);
    res.send(database);
});



