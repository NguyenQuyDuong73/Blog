
const express = require('express');
const connectDB = require('./db');
const path = require('path')
const regis = require('./models/blog.js')
const acc = require('./models/acc.js')
const fileupload = require('express-fileupload')
const session = require('express-session')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
async function main() {
    await connectDB().then(()=>console.log('DB Connected'))
}

const app = new express();
async function checkUsernameUnique(req, res, next) {
    const { Username } = req.body;
  
    try {
      const existingUser = await acc.findOne({ Username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      next(); // Proceed with registration if username is unique
    } catch (err) {
      console.error('Error checking username uniqueness:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/db_blog')
  .then(async () => {
    console.log('DB Connected');
    
    try {
      // Kiểm tra nếu người dùng 'admin' đã tồn tại
      const user = await acc.findOne({ Username: 'admin' });
      if (!user) {
        // Tạo người dùng mới nếu chưa có
        const newUser = new acc({
          Username: 'admin',
          Password: 'admin123',
          Email: 'admin@gmail.com',
          Role: 'admin'
        });

        await newUser.save(); // Lưu người dùng mới vào cơ sở dữ liệu
        console.log('Default user created');
      } else {
        console.log('User "admin" already exists');
      }
    } catch (err) {
      console.log('Error creating default user:', err);
    }
  })
  .catch((err) => {
    console.log('DB connection error:', err);
  });
app.use(session({
    secret: 'your_secret_key', // Khóa bí mật để mã hóa session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 36000000 } // Đặt secure: true nếu bạn sử dụng HTTPS
}));
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
});
// Middleware để kiểm tra nếu người dùng đã đăng nhập
function checkAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

app.listen(8000, () => {
    
    console.log('Server Listening on port 8000');
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const bodyPaser = require('body-parser');
app.use(bodyPaser.urlencoded({ extended: true }));
app.use(bodyPaser.json({type: 'application/json'}));
app.use(bodyPaser.raw());
app.use(fileupload())
//api insert data
// app.post('/api/insert', async (req, res) => {
//     regis.create(req.body).then(() => {
//         res.redirect('/admin/select')
//     })
// })

app.use(express.static('public'));

app.get('/',function(req,res){
    regis.find({Status:"Đã đăng"}).then((result) => {
        console.log(req.session.user);
        res.render('index',{user_regis:result});
    })
    .catch(err => console.log(err))
})
main().catch(err => console.log(err))

//Gọi trang list
app.get('/login', function(req, res) {

        res.render('login');

})
app.post('/login', function(req, res) {
    const { Username, Password } = req.body;
    
    // Thực hiện tìm kiếm người dùng trong cơ sở dữ liệu
    acc.findOne({ Username: Username, Password: Password }).then((user) => {
        if (user) {
            // Nếu tìm thấy người dùng, lưu trạng thái đăng nhập vào session
            req.session.user = user;
            res.redirect('/'); // Chuyển hướng đến trang chủ
        } else {
            // Nếu không tìm thấy, hiển thị lại trang login với thông báo lỗi
            res.render('login', { error: 'Email hoặc mật khẩu không đúng' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send('Lỗi server');
    });
});
app.get('/register', function(req, res) {

        res.render('register');

})
app.post('/register', checkUsernameUnique, async (req, res) => {
    try {
      const newUser  = new acc(req.body);
      await newUser.save();
      res.redirect('/login'); // Redirect to login or send success message
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
//Delete
app.get('/delete/:id', function(req, res) {
    regis.findByIdAndDelete(req.params.id).then((result) => {
        console.log('delete successful')
        res.redirect('/admin/select')
    })
    .catch(err => console.log(err))
})

app.get('/delete_user/:id', function(req, res) {
    acc.findByIdAndDelete(req.params.id).then((result) => {
        console.log('delete successful')
        res.redirect('/admin/select_user')
    })
    .catch(err => console.log(err))
})

app.get('/logout',(req,res) => {
    req.session.user = null
    res.redirect('/')
})
app.get('/admin', (req, res) => {
    regis.find().then((result) => {
        console.log(result)
        res.render('admin/index', {user_regis : result})
    }
    ).catch((err)=>console.log(err))
})
app.get("/admin/addblog", function(req, res) {
    regis.find().then((result) => {
        console.log(result);
        res.render("./admin/addblog",{user_regis:result});
    })
    .catch(err => console.log(err))
})
app.get('/admin/select', function(req, res) {
    regis.find().then((result) => {
        console.log(result);
        res.render('./admin/select',{user_regis:result});
    })
    .catch(err => console.log(err))
})
app.get('/admin/select_user', function(req, res) {
    acc.find().then((result) => {
        console.log(result);
        res.render('./admin/select_user',{user_regis:result});
    })
    .catch(err => console.log(err))
})
//Update
app.get('/admin/update/:id', function(req, res) {
    regis.findById(req.params.id).then((result) => {
        console.log(result);
        res.render('admin/update',{user_id_regis:result});
    })
    .catch(err => console.log(err))
})
app.get('/admin/update_user/:id', function(req, res) {
    acc.findById(req.params.id).then((result) => {
        console.log(result);
        res.render('admin/update_user',{user_id_regis:result});
    })
    .catch(err => console.log(err))
})
app.get('/blogdetail/:id', function(req, res) {
    regis.findById(req.params.id).then((result) => {
        console.log(result);
        res.render('blogdetail',{user_regis:result});
    })
    .catch(err => console.log(err))
})
app.post('/admin/update/:id', function(req, res) {
    let Image = req.files.image;
    Image.mv(path.resolve(__dirname, 'public/images', Image.name), function (err) {
    // model creates a new doc with browser data
    regis.findByIdAndUpdate(req.params.id, {...req.body, image: '/images/' + Image.name}).then(()=> {
        res.redirect('/admin/select')
    }) 
    })
})

app.post('/admin/update_user/:id', function(req, res) {
    acc.findByIdAndUpdate(req.params.id, req.body).then((result)=> {
        res.redirect('/admin/select_user')
    }) 
})


app.post('/api/insert', async (req, res) => {
    let image = req.files.image;
    image.mv(path.resolve(__dirname, 'public/images', image.name), function (err) {
    // model creates a new doc with browser data
    regis.create({...req.body, image: '/images/' + image.name}).then(()=> {
        res.redirect('/admin/select')
    }) 
    })
    })
    app.post('/admin/add-main-news/:id', async (req, res) => {
        console.log("Yêu cầu POST đến với ID:", req.params.id); // Thêm dòng log này
        try {
            const blog = await regis.findById(req.params.id);
            if (blog) {
                blog.Kind = "tin chính";
                await blog.save();
                console.log("Cập nhật thành công: ", blog.Kind); // Log sau khi cập nhật
                res.redirect('/admin/select');
            } else {
                console.log("Không tìm thấy bài viết với ID:", req.params.id); // Log nếu không tìm thấy
                res.status(404).send("Không tìm thấy bài viết");
            }
        } catch (err) {
            console.error("Lỗi khi xử lý yêu cầu:", err); // Log lỗi
            res.status(500).send(err);
        }
    });
    
    app.get('/admin/select_main', async (req, res) => {
        try {
            const mainNews = await regis.find({ Kind: "tin chính" });
            res.render('admin/select_main', { blogs: mainNews });
        } catch (err) {
            res.status(500).send(err);
        }
    });