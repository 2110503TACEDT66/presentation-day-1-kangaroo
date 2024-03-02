const sql = require("../config/carRentalDB");

// constructor
const CarRental = function(CarRental) {
    this.id = CarRental.id;
    this.name = CarRental.name;
    this.tel = CarRental.tel;
};

CarRental.getAll = result => {
    sql.query("SELECT * FROM CarRentals", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        console.log("CarRental: ", res);
        result(null, res);
    });
}

module.exports = CarRental;