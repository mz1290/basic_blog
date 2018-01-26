var bodyParser =    require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose =      require("mongoose"),
    express =       require("express"),
    app =           express ();

// APP Configuration
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
// express-sanitizer MUST be after bodyParser
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// SCHEMA Configuration
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

// Compile SCHEMA to MODEL
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog 2",
//     image: "https://img.huffingtonpost.com/asset/570eb9d71600002b0031ba2e.jpeg?ops=scalefit_960_noupscale",
//     body: "This is my second attempt at a blog post!"
// })

// RESTful Routes

// Redirect users to /blogs page
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

// !!!! INDEX Route !!!!
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if(err) {
            console.log(err);
        }
        else {
            res.render("index", {blogs: blogs});
        }
    });
});

// !!!! NEW Route !!!!
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// !!!! CREATE Route !!!!
app.post("/blogs", function(req, res){
    // 1) create blog + SANITZIE to exclude user html
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }
    // 2) redirect to INDEX
        else{
            res.redirect("/blogs");
        }
    });
});

// !!!! SHOW Route !!!!
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("show", {blog: foundBlog});
        }
    });
});

// !!!! EDIT Route !!!!
app.get("/blogs/:id/edit", function(req, res){
    // Need to find specific ID
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

// !!!! UPDATE Route !!!!
// Note that HTML5 as of Colt's recording date does not include PUT functionality from forms.
// Workaround is to install method-overrise, require, and use it. This will search for the key term in url and apply functionality
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // parameters: (id, newData, callback)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// !!!! DELETE Route !!!!
app.delete("/blogs/:id", function(req, res){
    // Destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }
        else{
            // redirect somewhere
            res.redirect(".blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server is running!");
})