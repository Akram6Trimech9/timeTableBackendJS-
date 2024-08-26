const User = require('../models/user')
 
const {generateToken} = require('../config/jwt')
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validateMongoDbId')
const {generateRefreshToken} =require('../config/refreshToken')
const { sendEmailWithAttachments } = require('../services/emailService');
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { json } = require('body-parser')

 const createUser =asyncHandler( async (req, res) => {
    //   const email = req.body.email;
    //   const findUser = await User.findOne({ email: email });
    //    if(findUser){ 
    //     const verificationToken = crypto.randomBytes(32).toString("hex");
    //     findUser.verificationToken = verificationToken;
    //       const newUser =  await User.create(findUser)
    //        res.status(201).json(newUser);
    //    }else{ 
    //     throw new Error('user already exists')   
    // }
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
     if(findUser){ 
      throw new Error('user already exists') 
     }else{
      const verificationToken = crypto.randomBytes(32).toString("hex");
       const user = new User({ 
         ...req.body , 
         verificationToken: verificationToken
       }) ;
            const newUser =  await User.create(user)
               res.status(201).json(newUser);
     }
  }
)


 const login = asyncHandler( async(req,res)=> { 
   const { email , password } = req.body ; 
     const isUser = await User.findOne({email : email })
     if( isUser && await isUser.isPasswordMatched(password)){ 
      const refreshToken = await generateRefreshToken(isUser?._id)
      const updateUser = await User.findOneAndUpdate(isUser?._id, { 
         refreshToken: refreshToken
      },{ 
        new : true 
      }
      )
      res.cookie('refreshToken',refreshToken , { 
         httpOnly:true , 
         maxAge:72*60*60*1000
      })
       res.json({
         _id : isUser?._id ,
         firstname : isUser?.firstName , 
         lastname : isUser?.lastName , 
         token:generateToken( isUser?._id) , 
         isBlocked: isUser?.isBlocked

       });
    }else{
      throw new Error("Identifiants invalides")
    }
})


//login admin 
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error('Identifiants invalides');
    }

     if (!user.isAdmin) {
      throw new Error('Not Authorized');
    }

    if (user && (await user.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(user?._id);
      const updateUser = await User.findByIdAndUpdate(
        user?._id,
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        }
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });

      res.json({
        _id: user?._id,
        firstname: user?.firstName,
        lastname: user?.lastName,
        isAdmin: user?.isAdmin,
        token: generateToken(user?._id),
      });
    } else {
      throw new Error('Identifiants invalides');
    }
  } catch (error) {
    throw new Error(error);
  }
});

//handle refreshToken 
const handleRefreshToken = asyncHandler(async (req, res )=> {
const cookie = req.cookies ; 
 if(!cookie?.refreshToken){ 
  throw new Error('no refresh Token ')
}else { 
    const refreshToken = cookie.refreshToken
    console.log(refreshToken);
     const user = await User.findOne({refreshToken  : refreshToken})
     if(!user) throw new Error('No refresh Token present in db or not matched  ')
     jwt.verify(refreshToken, process.env.JWT_SECRET ,( err , decoded ) => { 
      if(err || user.id !== decoded.id){
         throw new Error("there is something wrong with refrsh token")
     }
     const accessToken = generateToken(user?._id)
     res.json({accessToken})
    })
}
 })


 //logout functionnality 
  const logout = asyncHandler( async ( req, res )=>{ 
    const cookie = req.cookies ; 
     if(!cookie?.refreshToken) throw new Error('No refresh Token in cookies ');
    const refreshToken = cookie.refreshToken ; 
    const user =  await User.findOne({refreshToken})
    if(!user){
         res.clearCookie("refreshTokens", {
           httpOnly : true,
           secure:true
         }) ; 
         return res.sendStatus(204)
    }
    await User.findOneAndUpdate({refreshToken: refreshToken} , { 
      refreshToken : "" 
    }) ; 
    res.clearCookie("refreshToken",{ 
       httpOnly: true , 
       secure:true
    })
    return res.sendStatus(204);
 } )
// update user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'email', 'mobile', 'password', 'gender', 'address', 'birthdate', 'isAdmin'];
    const isValidOperation = Object.keys(updates).every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }
    Object.keys(updates).forEach(update => {
      user[update] = updates[update];
    });
    if (updates.password) {
      const salt = await bcrypt.genSaltSync(10);
      user.password = await bcrypt.hash(updates.password, salt);
    }
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//block user 
const blockUser = asyncHandler(async (req,res)=>{
   const { id } = req.params 
   validateMongoDbId(id)
  try{
     const block = await User.findOneAndUpdate({_id : id } ,{ 
      isBlocked : true 
     }, 
      {
        new :true 
      } )
     if(block){ 
      res.json(block)
     }else{ 
       throw new Error('user not founded ')
     }
   }catch(error){ 
     throw new Error(error)
   }
} )


const sendVerificationLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
      const user = await User.findById(id);
      if (!user) {
          throw new Error('User not found');
      }
      
      let verificationToken = user.verificationToken;
      if (!verificationToken) {
           verificationToken = crypto.randomBytes(32).toString("hex");
          user.verificationToken = verificationToken;
          await user.save();
      }

      const path = "templates/validate-account.html";
      const resetURL = `${process.env.VERIFICATION_LINK}/${verificationToken}`;
      await sendEmailWithAttachments(user.email, 'akramtrimech97@gmail.com', 'Verification Link', path, null, resetURL);
      
      res.json({ message: 'Verification link sent successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

const unBlockUser = asyncHandler(async (req,res)=>{
  const { id } = req.params 
  validateMongoDbId(id)
 try{
    const block = await User.findOneAndUpdate({_id : id } ,{ 
     isBlocked : false 
    }  ,  
  {
    new :true 
  } )
    if(block){ 
     res.json(block)
    }else{ 
      throw new Error('user not founded ')
    }
  }catch(error){ 
    throw new Error(error)
  }
} )


//Get all users 
//asyncHandler => for async 
//try catch here for catch if an error appear and a synchrounous 

const getAllUsers = asyncHandler( async (req , res) => { 
  try{
    const getUsers = await User.find()
    res.json(getUsers);
  }catch(error){ 
    throw new Error(error) ; 
  }
})

//single-user

const  getOneUser = asyncHandler(async (req , res )=> { 
  const {id}  = req.params
  validateMongoDbId(id)
    try{ 
           const  user = await User.findOne({_id : id })
      if(user){
        res.json(user)
      }else{
         res.json({message : 'user does not exist'})
       }
    }catch(error){
      throw new Error(error) ; 
    }
})
// delete user 
const deleteUser = asyncHandler(async ( req , res )=> {
  const {id} = req.params 
  validateMongoDbId(id)
  try {
    const deleteUser = await User.findByIdAndDelete(id)
    if(deleteUser){
        res.json(deleteUser)
    }else{ 
      res.json({message : 'something went wrong '})

    }
  }catch(error){

  }
})

const updatePassword = asyncHandler(async (req,res )=> {
   const {id} = req.params ; 
   const password = req.body.password;
    validateMongoDbId(id); 
   const user = await User.findById(id)
   if(password){ 
    user.password = password;
    const updatePassword = await user.save();
    res.json(updatePassword)
   }
   else{
      res.json(user)
    }
   }
)
 const forgotPasswordToken = asyncHandler(async ( req ,res )=> {
  const {email } = req.body ; 
  const user = await User.findOne({email :email}) ; 
  if(!user) throw new Error('User not found with this email ')
  try{
   const token = await   user.createPasswordResetToken() 
   await user.save()
   const path = "templates/reset-password.html" ;
   const  resetURL= `${process.env.RESET_LINK}${token}`
   console.log(email)
   await sendEmailWithAttachments(email ,'akramtrimech97@gmail.com','reset password link ', path ,null,resetURL )
  res.json(token) 
  }catch(error){ 
       throw new Error(error)
    }
   }

   )
   const resetPassword = asyncHandler(async (req,res )=> { 
    try{  
    const {password } = req.body
    console.log(password)
     const {token} = req.params ; 
     const hashedToken= crypto.createHash("sha256").update(token).digest("hex")
     const user = await User.findOne({ 
      passwordResetToken: hashedToken ,
      passwordResetExpires :{$gt: Date.now()}
     })
    if(!user) throw new Error("Token Expired , please Try Again  later  ") 
    user.password= password ; 
    user.passwordResetToken=undefined
    user.passwordResetExpires= undefined   
    await user.save()
    res.json(user)
  }catch(error){ 
     throw new Error(error)
  }
  }
   )
   
   const verifiedAccount=async(req,res)=>{ 
     const {token} = req.params
      try { 
          const user = await  User.findOne({verificationToken: token })
          const updatedIsBlocked  = await User.findOneAndUpdate(user._id ,{$set:{
            isBlocked: false
          }} )
          console.log(user)
          if(user){
             res.status(201).json({
               verified : true 
             })
          }else{ 
             res.status(404).json({
               message: 'user not  found '
             })
          }
      }catch(error){ 
         res.status(500).json(error)
      }
   }

module.exports = { verifiedAccount , sendVerificationLink, loginAdmin , resetPassword , forgotPasswordToken ,  updatePassword , logout ,  handleRefreshToken , createUser, login , getAllUsers , getOneUser , deleteUser , updateUser ,blockUser , unBlockUser } ;