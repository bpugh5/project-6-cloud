const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')
const { Business } = require('./business')
const { Photo } = require('./photo')
const { Review } = require('./review')

const User = sequelize.define('business', {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  admin: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false }
})

/*
* Set up one-to-many relationship between User and Photo.
*/
User.hasMany(Photo, { foreignKey: { allowNull: false } })
Photo.belongsTo(User)

/*
* Set up one-to-many relationship between User and Business.
*/
User.hasMany(Business, { foreignKey: { allowNull: false } })
Business.belongsTo(User)

/*
* Set up one-to-many relationship between Business and Review.
*/
User.hasMany(Review, { foreignKey: { allowNull: false } })
Review.belongsTo(User)

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
