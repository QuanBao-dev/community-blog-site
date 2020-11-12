const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const userSchema = new mongoose.Schema({
  userId:{
    type:String,
    default:nanoid()
  },
  role:{
    type:String,
    default:"User"
  },
  username:{
    type:String,
    required:true,
    minlength:6
  },
  password:{
    type:String,
    required:true,
    minlength:6
  },
  email:{
    type:String,
    required:true,
    minlength:8
  },
  createdAt:{
    type:Date,
    default:Date.now
  },
  updatedAt:{
    type:Date,
    default:Date.now
  },
})

userSchema.pre("findOneAndUpdate",function(next){
  this._update.updatedAt = new Date(Date.now());
  next();
})

module.exports = mongoose.model("user",userSchema);