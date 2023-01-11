const {Schema, model} = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = Schema({
    number:{
        type:String,
        required:true
    }
},{timestamp:true});

userSchema.methods.generateJWT = function(){
    const token = jwt.sign({
        _id:this._id,
        number:this.number
    }, "thsihuodvblsindvisoidvnlsdhnifpsdfdffsdf", {expiresIn:"1d"});
    return token
}

module.exports.User = model('User', userSchema);