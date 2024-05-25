var Express = require("express");
var Mongoclient = require("mongodb").MongoClient;
var cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const Voting = require("./models/votingModel")
const User = require("./models/userModel")
const mongoose = require("mongoose")
const bodyParser = require('body-parser');
const { Vonage } = require('@vonage/server-sdk');
const OTP = require('./models/OTP');


var app = Express();
app.use(Express.json());
app.use(cors())
app.use(bodyParser.json());

var CONNECTION_STRING=process.env.MONGO_URI;
var PORT=process.env.PORT;








// Vonage setup
const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
});


// Routes
app.post('/send-code', async (req, res) => {
    const { phone } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP: ${code} for phone: ${phone}`);

    vonage.sms.send({
        to: phone,
        from: 'VONAGE',
        text: `Your verification code is ${code}`
    }, async (err, responseData) => {
        if (err) {
            console.error('Error sending SMS:', err);
            return res.status(500).send(err);
        }
        
    })
    try {
         const checkPhone = await OTP.findOne({phone});
         if(!checkPhone)   {
            const otp = await OTP.create({phone, code});
            console.log("Phone created")
            res.status(200).json(otp);
         }else{
            checkPhone.code = code;
            await checkPhone.save()
            console.log(`Code resent ${code}`)
         }
        
    } catch (error) {
        console.error('Error creat phone and code:', error);
        res.status(500).send(error);
    }
});

app.post('/verify-code', async (req, res) => {
    let { phone, code } = req.body;
    
    

    console.log(`Verifying OTP: ${code} for phone: ${phone}`);
    try {
        const checkotp = await OTP.findOne({ phone });
        if (!checkotp) {
            console.log('Phone not found');
            return res.status(400).send('Invalid code');
        }
        
        console.log(`Phone found: ${JSON.stringify(checkotp)}`);
        if (checkotp.code !== code) {
            console.log('Invalid code');
            return res.status(400).send('Invalid code');
        }
        
        res.status(200).send('Phone verified');
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).send(error);
    }
});






//VOTING SECTION



app.get('/api/votings', async (req, res)=>{
    try{
        const votings = await Voting.find({});
        if(!votings){
            return res.status(404).json({message:"The collection is empty"})
        }
        res.status(200).json(votings);
    }catch(err){
        res.status(500).json({message:err.message});
    }
})

app.get('/api/votings/:id', async (req, res)=>{
    try{
        const {id} = req.params;
        const voting = await Voting.findById(id);
        if(!voting){
            return res.status(404).json({message:`Voting is not found`})
        }
        res.status(200).json(voting);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

app.get('/api/votings/address/:address', async (req, res)=>{
    try{
        const {address} = req.params;
        const voting = await Voting.findOne({address: address});
        if(!voting){
            return res.status(404).json({message:`Voting is not found`});
        }
        res.status(200).json(voting);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});



app.get('/api/votings/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const voting = await Voting.findOne({ name: name });
        if (!voting) {
            return res.status(404).json({ message: `Voting is not found` });
        }
        res.status(200).json(voting);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post('/api/votings', async (request, response) =>{
    try{
        const voting = await Voting.create(request.body);
        response.status(200).json(voting);
    }catch(error){
        response.status(500).json({message:error.message});
    }
});

app.put('/api/votings/:id', async (req, res)=>{
    try{
        const {id} = req.params;
        
        const voting = await Voting.findByIdAndUpdate(id, req.body);
        

        if(!voting){
            return res.status(404).json({message: `Voting is not found`});
        }

        const updatedVoting = await Voting.findById(id);

        res.status(200).json(updatedVoting);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
app.put('/api/votings/address/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const updateFields = req.body; // Assuming you're sending the fields to update in the request body

        // Find the document by address
        const voting = await Voting.findOne({ address: address });

        if (!voting) {
            return res.status(404).json({ message: `Voting is not found` });
        }

        // Update the found document with the fields provided in the request body
        Object.assign(voting, updateFields);
        
        // Save the updated document
        await voting.save();

        res.status(200).json(voting); // Return the updated document
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.delete('/api/votings/:id', async (req,res)=>{
    try{
        const {id}=req.params;
        const voting = await Voting.findByIdAndDelete(id);

        if(!voting){

            return res.status(404).json({message: `Voting is not found`});
        }
        res.status(200).json({message:"Voting deleted successfully"});
    }catch(err){
        res.status(500).json({message:err.message});
    }
})



//USER SECTION

app.get('/api/users', async (req, res)=>{
    try{
        const users = await User.find({});
        if(!users){
            return res.status(404).json({message:"The collection is empty"})
        }
        res.status(200).json(users);
    }catch(err){
        res.status(500).json({message:err.message});
    }
})

app.get('/api/users/:id', async (req, res)=>{
    try{
        const {id} = req.params;
        const user = await User.findById(id);
        if(!voting){
            return res.status(404).json({message:`User is not found`})
        }
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

app.get('/api/users/address/:address', async (req, res)=>{
    try{
        const {address} = req.params;
        const user = await User.findOne({walletAddress: address});
        if(!user){
            return res.status(404).json({message:`User is not found`});
        }
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
app.get('/api/users/votings/users-address/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        const user = await User.findOne({ walletAddress: address }, 'name dob walletAddress');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/users/address-list', async (req, res) => {
    try {
        const { addresses } = req.body;
        if (!addresses || !Array.isArray(addresses)) {
            return res.status(400).json({ message: "Addresses must be provided in an array" });
        }

        const users = await User.find({ walletAddress: { $in: addresses } });
        if (!voters || voters.length === 0) {
            return res.status(404).json({ message: "No voters found for the provided addresses" });
        }

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});





app.post('/api/users', async (request, response) =>{
    try{
        const user = await User.create(request.body);
        response.status(200).json(user);
    }catch(error){
        response.status(500).json({message:error.message});
    }
});

mongoose.connect(CONNECTION_STRING)
.then(()=> {
    console.log("MongoDB Connected!");
    app.listen(PORT, () =>{
        console.log(`Server is running on ${PORT}`);
    });
})
.catch(()=>{
    console.log("Connection failed");
});


