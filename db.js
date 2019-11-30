const Sequelize=require('sequelize')
const db = new Sequelize({
    dialect: 'sqlite',
    //retry: {
      //max: 10
   // },
    storage: __dirname+'/tests2.db',
  })

  const visitor=db.define('visitor',{
   Name:Sequelize.STRING(50),
   Phone:Sequelize.STRING(50),
   email:Sequelize.STRING(30),
   checkin:Sequelize.STRING(50),
   address:Sequelize.STRING(50)
  })
  const host=db.define('host',{
      Name:Sequelize.STRING(50),
      Phone:Sequelize.STRING(50),
      email:Sequelize.STRING(50)
  })
  host.hasMany(visitor);
  visitor.belongsTo(host);
  db.sync(
    ()=>
  {
      console.log('working fine')
  })
  module.exports = {
  db,host,visitor
  }