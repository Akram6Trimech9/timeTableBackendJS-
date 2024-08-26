const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const crypto =require('crypto')
var userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin :{ 
         type : Boolean , 
         default : false 
    }, 
    isBlocked:{
         type:Boolean ,
         default :true 
    },
    refreshToken:{
        type: String 
    },
    passwordChangeAt : Date  , 
    passwordResetToken : String , 
    passwordResetExpires: Date,
    verificationToken:String
},{
    timestamps:true
});
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){ 
        next()
    }
    const salt = await bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password , salt)
})
userSchema.methods.isPasswordMatched = async function(enteredPassword){ 
    return await bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.createPasswordResetToken= async function(){ 
    const resettoken= crypto.randomBytes(32).toString("hex")
    this.passwordResetToken=crypto.createHash('sha256')
    .update(resettoken)
    .digest("hex")
   this.passwordResetExpires= Date.now() + 30*60*1000 ; //10 minutes
   return resettoken ;
}
userSchema.methods.patchUser = async function(updates) {
    const allowedUpdates = ['firstName', 'lastName', 'email', 'mobile', 'password', 'isAdmin'];
    const updatesKeys = Object.keys(updates);
    const isValidOperation = updatesKeys.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw new Error('Invalid updates!');
    }
    updatesKeys.forEach((update) => {
        this[update] = updates[update];
    });
    if (updates.password) {
        const salt = await bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(updates.password, salt);
    }
    await this.save();
};

module.exports = mongoose.model('User', userSchema);