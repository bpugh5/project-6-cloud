const { DataTypes } = require('sequelize')

const bcrypt = require('bcryptjs')

const sequelize = require('../lib/sequelize')
const { Business } = require('./business')

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
