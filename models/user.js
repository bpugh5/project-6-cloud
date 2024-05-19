const { DataTypes } = require('sequelize')

const bcrypt = require('bcryptjs')

const sequelize = require('../lib/sequelize')
const { Business } = require('./business')
const { Photo } = require('./photo')
const { Review } = require('./review')

//   const User = sequelize.define('users', {
//       annotation_id: { type: DataTypes.INTEGER, autoIncrement: true,
//           primaryKey: true
//       },
//       firstName: {
//           type: DataTypes.DATE,
//           field: 'first_name'
//       },
//       lastName: {
//           type: DataTypes.DATE,
//           field: 'last_name'
//       },
//       email: DataTypes.STRING,
//       password: DataTypes.STRING
//   }, {
//       freezeTableName: true,
//       instanceMethods: {
//           generateHash(password) {
//               return bcrypt.hash(password, bcrypt.genSaltSync(8));
//           },
//           validPassword(password) {
//               return bcrypt.compare(password, this.password);
//           }
//       }
//   });

//   return User;
// }

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false,
    set(value) {
      this.setDataValue('password', bcrypt.hashSync(value, 8))
  }},
  admin: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false }
})

/*
* Set up one-to-many relationship between User and Business.
*/
User.hasMany(Business)
Business.belongsTo(User)

exports.User = User

/*
 * Export an array containing the names of fields the client is allowed to set
 * on businesses.
 */
exports.UserClientFields = [
  'id',
  'name',
  'email',
  'password',
  'admin'
]
