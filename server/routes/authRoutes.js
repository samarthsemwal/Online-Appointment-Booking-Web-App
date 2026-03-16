const express = require("express");
const router = express.Router();

const User = require("./models/User");


// REGISTER

router.post("/register", async(req,res)=>{

try{

const user = new User(req.body);

await user.save();

res.json({
message:"User registered successfully"
});

}catch(err){

res.status(500).json(err);

}

});


// LOGIN

router.post("/login", async(req,res)=>{

try{

const user = await User.findOne({

email:req.body.email,
password:req.body.password

});

if(!user){

return res.json({
message:"Invalid email or password"
});

}

res.json(user);

}catch(err){

res.status(500).json(err);

}

});

module.exports = router;