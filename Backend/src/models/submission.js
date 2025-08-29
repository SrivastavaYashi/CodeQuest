const mongoose = require('mongoose');
const { schema } = require('./user');
const {Schema} = mongoose;

const submissionSchema = new Schema({
    userId:
    {
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    problemId:
    {
        type:Schema.Types.ObjectId,
        ref:'problem',
        required:true
    },
    code:
    {
       type:String,
       required:true
    },
    language:
    {
        type:String,
        required:true,
        enum:['Javascript','C++','Java']
    },
    status:
    {
        type:String,
        enum:['pending','accepted','wrong','error'],
        default:'pending'
    },
    runtime:
    {
        type:Number,//ms
        default:0
    },
    memory:
    {
        type:Number,// kb
        default:0
    },
    errorMessage:
    {
        type:String,// kb
        default:''
    },
    testCasesPassed:
    {
        type:Number,
        default:0
    },
    testCasesPassed:
    {
        type:Number,
        default:0
    },
    testCasesTotal:
    {
        type:Number,
        default:0
    }

},{timestamps:true})

submissionSchema.index({userId:1,problemId:1});

const Submission = mongoose.model('submission',submissionSchema);
console.log("submissionSchema",Submission);
module.exports=Submission;