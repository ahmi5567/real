import bcrypt, { compare } from "bcrypt"
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'
export const register = async (req , res) => {
  const {username, email, password} = req.body;
  
  try {
    
    // HASH THE PASSSWORD
    const hashPassword =  await bcrypt.hash(password,10)
    // console.log(hashPassword) 
    // CREATE A NEW USER AND SAVE TO DATABASE 
    const newUser = await prisma.user.create({
      data:{
        username,
      email,
      password:hashPassword,
    }, 
  });
  console.log(newUser) 
  res.status(201).json({
    message:"User created successfully",
    user:newUser,
  }) 
} catch(error){
  console.log(error)
  res.status(500).json({
    message:"failed to create user",
  })
}
  
}
export const login = async (req , res) => {
  // db operations 
  const {username ,password} = req.body;
  
  try {
    
    // CHECK IF THE EXIST 
    const user = await prisma.user.findUnique({
      where:{username}
    })

    if(!user) return res.status(401).json({message:"Invalid Credentials!"})
    // CHECK IF THE PASSWORD IS CORRECT
    const isPasswordvalid = await bcrypt.compare(password, user.password);

    if(!isPasswordvalid) return res.status(401).json({message:"Invalid Credentials!"})
    
    // GENEREATE THE COOKIE TOKEN AND SEND IT TO THE USER

    // res.setHeader("Set-Cookie", "test=" + "myValue").json("success")
    const age = 1000 * 60 * 60 * 7;

    const token = jwt.sign({
      id:user.id,
      isAdmin: true,

    }, process.env.JWT_SECRET_KEY,{expiresIn:age})

    const {password:userPassword, ...userInfo} = user

    res.cookie("token", token, {
      httpOnly:true,
      secure:true,
      sameSite:"strict",
      maxAge: age,
    }).status(200).json(userInfo)
    // res.json("success")
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message:"failed to login",
    })
  }
}
export const logout = (req , res) => {
  res.clearCookie("token").status(200).json({message:"logout successful"})
}
