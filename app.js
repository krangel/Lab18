// Module dependencies

var express    = require('express');
var mysql      = require('mysql'),
    ejs        = require('ejs'),
    connect    = require('connect');

// Application initialization

var connection = mysql.createConnection({
    host     : 'cwolf.cs.sonoma.edu',
    user     : 'krangel',
    password : '3114181'
});

//var app = module.exports = express.createServer();
var app = express();

// Database setup
//connection.query('DROP DATABASE IF EXISTS krangel', function(err) {
//	if (err) throw err;
//	connection.query('CREATE DATABASE IF NOT EXISTS krangel', function (err) {
//	    if (err) throw err;
connection.query('USE krangel', function (err) {
    if (err) throw err;
    connection.query('CREATE TABLE IF NOT EXISTS patientInfo('
		     + 'PatientID INT NOT NULL AUTO_INCREMENT,'
        	     + 'PRIMARY KEY (PatientID),'
		     + 'pFName VARCHAR(25),'
		     + 'pLName VARCHAR(25),'
		     + 'homeAddress VARCHAR(50),'
		     + 'pPhoneNum INT'
	             +  ')', function (err) {
        	         if (err) throw err;
	             });
    
});

// Configuration
//app.use(express.bodyParser());
app.use(connect.urlencoded());
app.use(connect.json());

// Static content directory
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Main route sends our HTML file
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/add_patient', function(req, res) {
  res.render('add_patient');
});

app.get('/add_doctor', function(req, res) {
  res.render('add_doctor');
});

app.get('/patient_info', function(req, res) {
  res.render('patient_info');
});

app.get('/doctor_info', function(req, res) {
  res.render('doctor_info');
});
app.get('/about', function(req, res){
    res.render('about');
});

app.get('/contact', function(req, res){
    res.render('contact');
});

app.get('/add_ercontact', function(req, res){
    res.render('add_ercontact');
});

app.get('/medlist', function(req, res){
    res.render('medlist');
});

app.get('/er_info', function(req, res){
    res.render('er_info');
});

app.get('/med_info', function(req, res){
    res.render('med_info');
});

/* ******************   PATIENT   *************/ 
app.post('/patient_info', function (req, res) {
    if(typeof req.body.id != 'undefined'){
	var query = 'select PatientID, pFName, pLName, homeAddress, pPhoneNum from patientInfo where pLName = ' + req.body.pLName + ' and pFName = ' + req.body.pFName;
	connection.query(query, 
			 function (err, result) {
			     if(result.length > 0) {
  				 res.send('Last Name: ' + result[0].pLName + '<br />' +
		  			  'First Name: ' + result[0].pFName  + '<br />' +
					  'Address: ' + result[0].homeAddress  + '<br />' +
					  'Number: ' + result[0].pPhoneNum
					 );
			     }
			     else
				 res.send('User does not exist.');
			 });
	
    }	
});

app.post('/add_patient', function (req, res) {
    connection.query('INSERT INTO patientInfo SET ?', req.body,
                     function (err, result) {
			 if (err) throw err;
			 if (result.affectedRows == 1){
			     res.send("Patient information stored.");
			 }
			 else
                             res.send('Patient was not inserted.');
                     }
                    );

});

app.post('/add_ercontact', function (req, res) {
    connection.query('INSERT INTO erContact SET ?', req.body,
		     function (err, result) {
                         if (err) throw err;
			 if(result.affectedRows == 1) {
                             res.send("Contact information stored.");
                         }
                         else
                             res.send('Contact was not inserted.');
                     }
                    );
    
});

app.post('/medlist', function (req, res) {
    connection.query('INSERT INTO meds SET ?', req.body,
        function (err, result) {
            if (err) throw err;
	    if(result.affectedRows == 1) {
                res.send("Medication information stored.");
            }
            else
                res.send('Medication was not inserted.');
        });
});

/*************** DOCTOR  ********/ 
app.post('/doctor_info', function (req, res) {
    connection.query('select * from doctorInfo where DoctorID = ?', req.body.DoctorID,
                     function (err, result) {
			 if(result.length > 0) {
			     res.send('Last Name: ' + result[0].drLName + '<br />' +
				      'First Name: ' + result[0].drFName  + '<br />' +
				      'Address: ' + result[0].workAddress  + '<br />' +
				      'Number: ' + result[0].onCallNum
				     );
			 }
			 else
			     res.send('User does not exist.');
                     });
    
});

app.post('/add_doctor', function (req, res) {
    connection.query('INSERT INTO doctorInfo SET ?', req.body,
		     function (err, result) {
			 if (err) throw err;
			connection.query('select DoctorID, drFName, drLName, workAddress, onCallNum from doctorInfo where drLName = ?', req.body.drLName,
					  function (err, result) {
					      if(result.length > 0) {
						  res.send("Doctor information stored.");
					      }
					      else
						  res.send('Doctor was not inserted.');
					  });
		     }
		    );
    
});

app.post('/doctors/table', function (req, res) {
    connection.query('select * from doctorInfo where drLName = ?', req.body.drLName,
		     function (err, result) {
			 if(result.length > 0) {
			     var responseHTML = '<table><tr><th>Name</th><th>Work Address</th><th>On Call Number</th><th>Patient</th></tr>';
			     for (var i=0; result.length > i; i++) {
				 var id = result[i].DoctorID;
				 responseHTML += '<tr>' + 
				     '<td>' + result[i].drLName + ', ' + result[i].drFName + '</td>' + 
				     '<td>' + result[i].workAddress + '</td>' +
				     '<td>' + result[i].onCallNum + '</td>' +
				     '<td>' + result[i].pFName + ', ' + result[i].pLName + '</td>' +
				     '</tr>';
			     }
			     responseHTML += '</table>';
			     res.send(responseHTML);
			 }
			 else
			     res.send('No users exist.');
		     });        
});

app.post('/patients/table', function (req, res) {
    connection.query('select * from patientInfo',
                     function (err, result) {
                         if(result.length > 0) {
                             var responseHTML = '<table><tr><th>Name</th><th>Address</th><th>Number</th></tr>';
                             for (var i=0; result.length > i; i++) {
                                 var last = result[i].pLName;
				 var first = result[i].pFName;
                                 responseHTML += '<tr>' +
                                     '<td><a href="../contact?last=' + last + '&first=' + first + '">' + result[i].pLName +
                                     ', ' + result[i].pFName + '</a></td>' +
                                     '<td>' + result[i].homeAddress + '</td>' +
                                     '<td>' + result[i].pPhoneNum + '</td>' +
                                     '</tr>';
                             }
                             responseHTML += '</table>';
                             res.send(responseHTML);
                         }
                         else
                             res.send('No users exist.');
                     });
});



app.post('/contacts/table', function (req, res) {
    connection.query('select * from erContact',
                     function (err, result) {
                         if(result.length > 0) {
                             var responseHTML = '<table><tr><th>Name</th><th>Relation</th><th>Contact</th></tr>';
                             for (var i=0; result.length > i; i++) {
                                 responseHTML += '<tr>' +
                                     '<td>' + result[i].pLName +
                                     ', ' + result[i].pFName + '</td>' +
                                     '<td>' + result[i].relation + '</td>' +
				     '<td>' + result[i].cLName +
                                     ', ' + result[i].cFName + '</td>' +
                                     '</tr>';
                             }
                             responseHTML += '</table>';
                             res.send(responseHTML);
                         }
                         else
                             res.send('No users exist.');
                     });
});

app.post('/meds/table', function (req, res) {
    connection.query('select * from meds',
                     function (err, result) {
                         if(result.length > 0) {
                             var responseHTML = '<table><tr><th>Name</th><th>Medication</th></tr>';
                             for (var i=0; result.length > i; i++) {
                                 responseHTML += '<tr>' +
                                     '<td>' + result[i].pLName +
                                     ', ' + result[i].pFName + '</td>' +
                                     '<td>' + result[i].medName +
				     '</tr>';
                             }
                             responseHTML += '</table>';
                             res.send(responseHTML);
                         }
                         else
                             res.send('No users exist.');
                     });
});

// get all users in a <select>
app.post('/doctors/select', function (req, res) {
    connection.query('select * from doctorInfo ORDER BY drLName ASC, drFName ASC', 
		     function (err, result) {
			 var responseHTML = '<select id="doctor-list">';
			 for (var i=0; result.length > i; i++) {
			     var option = '<option value="' + result[i].DoctorID + '">' + result[i].drLName + ', ' + result[i].drFName +'</option>';
			     responseHTML += option;
			 }
			 responseHTML += '</select>';
			 res.send(responseHTML);
		     });
});

// Begin listening
app.listen(8017);
console.log("Express server listening on port %d in %s mode", app.settings.env);

