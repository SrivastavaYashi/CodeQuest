const validator = require('validator');

const validate = (data)=>
{
   const mandatoryField = ["firstName","emailId","password"];
   const isAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k))
   console.log(isAllowed);
   if(!isAllowed)
    throw new Error("Some Field Missing");

   if(!validator.isEmail(data.emailId))
    throw new Error("Invalid Email");

   if(!validator.isStrongPassword(data.password))
    throw new Error("Week Password");
}
module.exports= validate;