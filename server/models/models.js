const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: DataTypes.STRING, unique: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
    theme: {type: DataTypes.STRING}
})



const Message = sequelize.define('message', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.STRING},
})

const ThemeForum = sequelize.define('theme_forum', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
})

const ThemeRelation = sequelize.define('theme_relation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    parentId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: 'theme_forum', key: 'id' }
    },
    childId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: 'theme_forum', key: 'id' }
    },
    depth: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    }, {
    indexes: [
        { unique: true, fields: ['parentId', 'childId'] },
        { fields: ['childId'] }
    ]
});

ThemeForum.hasMany(Message)
Message.belongsTo(ThemeForum)

User.hasMany(Message)
Message.belongsTo(User)

ThemeForum.belongsToMany(ThemeForum, {
  through: ThemeRelation,
  as: 'parents',
  foreignKey: 'childId',
  otherKey: 'parentId'
});

ThemeForum.belongsToMany(ThemeForum, {
  through: ThemeRelation,
  as: 'children',
  foreignKey: 'parentId',
  otherKey: 'childId'
});

ThemeRelation.belongsTo(ThemeForum, { as: 'parent', foreignKey: 'parentId' });
ThemeRelation.belongsTo(ThemeForum, { as: 'child', foreignKey: 'childId' });

module.exports = {
    User, ThemeForum, Message, ThemeRelation
}