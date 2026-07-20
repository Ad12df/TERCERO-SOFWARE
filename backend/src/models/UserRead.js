'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRead = sequelize.define('UserRead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'user_reads',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'book_id'],
    },
  ],
});

module.exports = UserRead;