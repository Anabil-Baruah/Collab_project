const mongoose = require('mongoose');
const app = require("./index");


mongoose.connect("mongodb://localhost:27017/auth-system")
    .then(() => {
        console.log('connected to mongodb');
    }).catch(err => console.log("Cnnectio0n failed"))

app.listen(3001, () => {
    console.log("App running")
})