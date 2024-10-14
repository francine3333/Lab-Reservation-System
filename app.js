//Install Command:
//npm init
//npm i express express-handlebars body-parser mongoose

//HTTP methods are methods used to communicate from client to server.
//In this sample, two of the most common ones are tackled. To see what
//other functions are available, read more here:
//https://www.w3schools.com/tags/ref_httpmethods.asp
const express = require('express'); 
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));

const mongoose = require("mongoose");
// Change the name to ReservationDB in the mongodb
mongoose.connect("mongodb://localhost:27017/ReservationDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected");
}).catch((err) => {
    console.log(err);
});


const userProfileSchema = new mongoose.Schema({
    name: String,
    number: String,
    email: String,
    description: String
});

const reservationSchema = new mongoose.Schema({
    date: String,
    time: String,
    seat: Array,
    reservedBy: String
});

let reservations = [];

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);

server.use(express.static('public'));

let userProfile = { // This object holds the user profile information. It is updated whenever a user edits their profile.
    name: 'name',
    number: 'number',
    email: 'email',
    description: 'description'
};

let reservation1 = {
    date1: '2023-07-01',
    time1: '12:00',
    seat1: 'A1'
}

let reservation2 = {
    date2: '2023-07-02',
    time2: '14:00',
    seat2: 'B2'
}

let reservation3 = {
    date3: '2023-07-03',
    time3: '16:00',
    seat3: 'C3'
}

let staffProfile = { 
    name2: 'staff_name',
    number2: 'staff_number',
    email2: 'staff_email',
    description2: 'staff_description'
};

let staffReservation = {
    date2: '2023-07-02',
    time2: '14:00',
    seat2: 'B2'
}

server.post('/reserve', async function(req, res) {
    console.log("Received data:", req.body);

    const newReservation = new Reservation({
        date: req.body.date,
        time: req.body.time,
        seat: req.body.seat,
        reservedBy: req.body.userType // userType will be 'student' or 'staff'
    });

    try {
        await newReservation.save();
        console.log("Reservation saved:", newReservation);

        // Redirect based on the userType
        if (req.body.userType === 'staff') {
            res.redirect('/BookingStaff');
        } else {
            res.redirect('/BookingStudent');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving reservation.');
    }
});

// sa delete method
server.post('/cancelReservation', async function(req, res) {
    const reservationId = req.body.reservationId;

    try {
        await Reservation.findByIdAndDelete(reservationId);
        console.log(`Reservation ${reservationId} deleted`);

        res.redirect('/BookingStaff');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting reservation.');
    }
});

server.post('/cancelReservation', async function(req, res) {
    const reservationId = req.body.reservationId;

    console.log("Received request to delete reservation:", reservationId); 

    try {
        const result = await Reservation.findByIdAndDelete(reservationId); 
        console.log("Deletion result:", result); 

        res.redirect('/BookingStaff');
    } catch (err) {
        console.log("Error during deletion:", err); 
        res.status(500).send('Error deleting reservation.');
    }
});

server.get('/BookingStudent', async function(req, res) {
    try {
        const reservations = await Reservation.find({});
        const plainReservations = reservations.map(reservation => reservation.toObject()); 
        res.render('BookingStudent', {
            layout: 'BookingStudent',
            reservations: plainReservations
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching reservations.');
    }
});

server.get('/BookingStaff', async function(req, res) {
    try {
        const reservations = await Reservation.find({});
        const plainReservations = reservations.map(reservation => reservation.toObject());
        res.render('BookingStaff', {
            layout: 'BookingStaff',
            reservations: plainReservations
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching reservations.');
    }
});



// Route to handle form submission and add a new reservation for Studentbook

server.post('/profile_student', async function(req, resp){
    // Update userProfile only if new values are provided, otherwise keep the old values
    userProfile.name = req.body.name || userProfile.name;
    userProfile.number = req.body.number || userProfile.number;
    userProfile.email = req.body.email || userProfile.email;
    userProfile.description = req.body.description || userProfile.description;
    reservation1.date1 = req.body.date1 || reservation1.date1;
    reservation1.time1 = req.body.time1 || reservation1.time1;
    reservation1.seat1 = req.body.seat1 || reservation1.seat1;
   

    try {
        // Save the user profile data to MongoDB
        await UserProfile.updateOne({}, userProfile, { upsert: true });

        // Save the reservations to MongoDB
        await Reservation.updateOne({ seat: reservation1.seat1 }, {
            date: reservation1.date1,
            time: reservation1.time1,
            seat: reservation1.seat1
        }, { upsert: true });

     

        // Render the 'profile_student' view with the updated profile information
        resp.render('profile_student', {
            title: 'Profile student',
            layout: 'editprofile_design',
            name: userProfile.name,
            number: userProfile.number,
            email: userProfile.email,
            description: userProfile.description,
            date1: reservation1.date1,
            time1: reservation1.time1,
            seat1: reservation1.seat1,
          
        });
    } catch (err) {
        console.log(err);
        resp.status(500).send('Error updating profile.');
    }
});

// STUDENT 

server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'main',
        title: 'Login Student Page'
    });
});

server.post('/main', function(req, resp){
    resp.render('main',{
        layout: 'main',
        title: 'Login Page'
    });
});

server.get('/BookingStudent', function(req, res){
    res.render('BookingStudent', {
        layout: 'BookingStudent',
        reservations: reservations  // Pass reservations to the template
    });
});


server.get('/editprofile_student', function(req, resp){
    resp.render('editprofile_student',{
        title: 'Edit Profile student',
        layout: 'editprofile_design',
       
    });
}); 

server.post('/editprofile_student', function(req, resp){
    resp.render('editprofile_student',{
        title: 'Edit Profile student',
        layout: 'editprofile_design',
       
    });
}); 

server.get('/EditReservationStudent1', function(req, resp){
    resp.render('EditReservationStudent1',{
        title: 'Edit Reservation Student',
        layout: 'editprofile_design',
    });
}); 

server.post('/EditReservationStudent1', function(req, resp){
    // Update the reservation1 object
    reservation1.date1 = req.body.date1 || reservation1.date1;
    reservation1.time1 = req.body.time1 || reservation1.time1;
    reservation1.seat1 = req.body.seat1 || reservation1.seat1;

    // Render the view with the updated reservation data
    resp.render('EditReservationStudent1', {
        title: 'Edit Reservation Student',
        layout: 'editprofile_design',
        date1: reservation1.date1,
        time1: reservation1.time1,
        seat1: reservation1.seat1
    });
});

server.get('/profile_student', function(req, resp){
    // Update userProfile only if new values are provided, otherwise keep the old values
    userProfile.name = req.query.name || userProfile.name; // ensures that userProfile.name is only updated if a new name is provided in the query string. If no new name is provided, it keeps the existing value.
    userProfile.number = req.query.number || userProfile.number; 
    userProfile.email = req.query.email || userProfile.email;
    userProfile.description = req.query.description || userProfile.description;
    
    resp.render('profile_student', {
        title: 'Profile student',
        layout: 'editprofile_design',
        name: userProfile.name,
        number: userProfile.number,
        email: userProfile.email,
        description: userProfile.description
    });
});

server.post('/profile_student', function(req, resp){
    // Update userProfile only if new values are provided, otherwise keep the old values
    userProfile.name = req.body.name || userProfile.name;
    userProfile.number = req.body.number || userProfile.number;
    userProfile.email = req.body.email || userProfile.email;
    userProfile.description = req.body.description || userProfile.description;

    // Render the 'profile_student' view with the updated profile information
    resp.render('profile_student', {
        title: 'Profile student',
        layout: 'editprofile_design',
        name: userProfile.name,
        number: userProfile.number,
        email: userProfile.email,
        description: userProfile.description
    });
});

server.get('/deleteprofile', function(req, resp){
    resp.render('deleteprofile',{
        title: 'Delete Profile student',
        layout: 'deleteprofile_design',
        
    });
});

server.get('/PeopleStudent', function(req, resp){
    resp.render('PeopleStudent',{
        title: 'People student',
        layout: 'profile_design',
        name: userProfile.name,  // Using userProfile.name from your global object
    });
});

server.get('/Reservation_LocP', function(req, resp){
    resp.render('Reservation_LocP',{
        layout: 'Reservation_LocP',
        title: 'Reservation 1.1'
    });
});

server.get('/12NewReservation', function(req, resp){
    resp.render('12NewReservation',{
        layout: '12NewReservation',
        title: 'Reservation 1.1'
    });
});

server.get('/12NewReservation_staff', function(req, resp){
    resp.render('12NewReservation_staff',{
        layout: '12NewReservation',
        title: 'Staff reservation 1.1'
    });
});

// STAFF


server.get('/LoginStaff', function(req, resp){
    resp.render('LoginStaff',{
        layout: 'main',
        title: 'Login Staff Page'
    });
});

server.get('/21Reservation_LocP', function(req, resp){
    resp.render('21Reservation_LocP',{
        layout: '21Reservation_LocP',
        title: 'Login Staff Page'
    });
});

// People Staff GET
server.get('/PeopleStaff', function(req, resp){
    resp.render('PeopleStaff', {
        title: 'People Staff Page',
        layout: 'profile_design',
        name2: staffProfile.name2, // Ensure this key matches the template
    });
});


server.get('/BookingStaff', function(req, resp){
    resp.render('BookingStaff',{
        layout: 'BookingStaff',
        title: 'Login Staff Page'
    });
});


server.get('/editprofile_staff', function(req, resp){
    resp.render('editprofile_staff',{
        layout: 'editprofile_staff',
        title: 'editprofile_staff'
    });
});

server.get('/editprofile_staff', function(req, resp){
    resp.render('editprofile_staff',{
        title: 'Edit Profile Staff',
        layout: 'editprofile_design',
    });
}); 

server.post('/editprofile_staff', function(req, resp){
    resp.render('editprofile_staff',{
        title: 'Edit Profile Staff',
        layout: 'editprofile_design',
    });
}); 

// GET route to display the Edit Reservation form
server.get('/EditReservationStaff', function(req, resp){
    resp.render('EditReservationStaff', {
        title: 'Edit Reservation Staff',
        layout: 'editprofile_design',
        date2: staffReservation.date2,
        time2: staffReservation.time2,
        seat2: staffReservation.seat2
    });
});


server.post('/profile_staff', async function(req, resp){
    staffProfile.name2 = req.body.name2 || staffProfile.name2;
    staffProfile.number2 = req.body.number2 || staffProfile.number2;
    staffProfile.email2 = req.body.email2 || staffProfile.email2;
    staffProfile.description2 = req.body.description2 || staffProfile.description2;
    staffReservation.date2 = req.body.date2 || staffReservation.date2;
    staffReservation.time2 = req.body.time2 || staffReservation.time2;
    staffReservation.seat2 = req.body.seat2 || staffReservation.seat2;
   
    try {
        await UserProfile.updateOne({}, staffProfile, { upsert: true });
        await Reservation.updateOne({ seat: staffReservation.seat2 }, {
            date: staffReservation.date2,
            time: staffReservation.time2,
            seat: staffReservation.seat2
        }, { upsert: true });

        resp.render('profile_staff', {
            title: 'Profile Staff',
            layout: 'editprofile_design',
            name2: staffProfile.name2,
            number2: staffProfile.number2,
            email2: staffProfile.email2,
            description2: staffProfile.description2,
            date2: staffReservation.date2,
            time2: staffReservation.time2,
            seat2: staffReservation.seat2,
        });
    } catch (err) {
        console.log(err);
        resp.status(500).send('Error updating profile.');
    }
});




// Profile Staff GET
server.get('/profile_staff', function(req, resp){
    staffProfile.name2 = req.query.name2 || staffProfile.name2;
    staffProfile.number2 = req.query.number2 || staffProfile.number2;
    staffProfile.email2 = req.query.email2 || staffProfile.email2;
    staffProfile.description2 = req.query.description2 || staffProfile.description2;

    resp.render('profile_staff', {
        title: 'Profile Staff',
        layout: 'editprofile_design',
        name2: staffProfile.name2,
        number2: staffProfile.number2,
        email2: staffProfile.email2,
        description2: staffProfile.description2
    });
});

// People Staff GET
server.get('/PeopleStaff', function(req, resp){
    resp.render('PeopleStaff', {
        title: 'People Staff',
        layout: 'profile_design',
        name2: staffProfile.name2,
        number2: staffProfile.number2,
        email2: staffProfile.email2,
        description2: staffProfile.description2
    });
});

const port = process.env.PORT | 8080;
server.listen(port, function(){
    console.log('Listening at port '+port);
});











