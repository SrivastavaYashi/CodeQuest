const {getLanguageById,submitBatch,submitToken} = require('../utils/ProblemUtility');
const Problem = require('../models/problem')
const User = require('../models/user')
const Submission = require('../models/submission')
const SolutionVideo = require('../models/solutionVideo')

const createProblem = async(req,res)=>
{

     console.log("req.result in createProblem:", req.result);
    
    const {title,description,difficulty,tags,
      visibleTestCases,hiddenTestCases,startCode,
      referenceSolution,problemCreator} = req.body;

    try{
     for(const {language,completeCode} of referenceSolution)
     {
       const languageId = getLanguageById(language);
      
       const submissions = visibleTestCases.map((testcase)=>({
        source_code:completeCode,
        language_id:languageId,
        stdin:testcase.input,
        expected_output:testcase.output
       }));

       console.log("submission",submissions);

       const submitResult = await submitBatch(submissions);
    
       const resultToken = submitResult.map((value)=>(value.token));

       const testResult = await submitToken(resultToken);
            console.log("testResult",testResult);

       for(const test of testResult)
       {
        console.log("Test result:", test.status_id, test.stderr, test.compile_output, test.message);
        if(test.status_id!=3)
          {
           console.log("Judge0 error:", test);
           return res.status(400).json({ error: "Test case failed", details: test });
           // return res.status(400).send("Error Occured");
          }
         
       }

     }

    //  now store in db
    const userProblem = await Problem.create(
      {
        ...req.body,
        problemCreator:req.result._id
      }
    )
     res.status(201).send("Problem Saved Successfully");
    }
    catch(err)
    {
      res.status(400).send("Error: "+err);
    }
}

const updateProblem = async(req,res)=>
{
  const {id} = req.params;
  const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,
    startCode,referenceSolution,problemCreator} = req.body;

    try{

      if(!id)
        return res.status(400).send("Missing id field");

      const DsaProblem = await Problem.findById(id);
      if(!DsaProblem)
        return res.status(404).send("Id is not present in server");

       for(const {language,completeCode} of referenceSolution)
     {
       const languageId = getLanguageById(language);
       const submissions = visibleTestCases.map((testcase)=>({
        source_code:completeCode,
        language_id:languageId,
        stdin:testcase.input,
        expected_output:testcase.output
       }));

       const submitResult = await submitBatch(submissions);
      //  console.log(submitResult);
       const resultToken = submitResult.map((value)=>(value.token));

       const testResult = await submitToken(resultToken);
      //  console.log(testResult);

       for(const test of testResult)
       {
        console.log("Test result:", test.status_id, test.stderr, test.compile_output, test.message);
        if(test.status_id!=3)
          return res.status(400).send("Error Occured");
       }

     }
     
     const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});

     res.status(200).send(newProblem)


    }
    catch(err)
    {
       res.status(500).send("Error: "+err);
    }

}

const deleteProblem = async(req,res)=>{
const {id} = req.params;
try
{
    if(!id)
      return res.status(400).send("Missing id field");

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if(!deleteProblem)
      return res.status(404).send("Problem is missing");

    return res.status(200).send("Successfully deleted");
}
catch(err)
{
   res.status(500).send("Error:"+err);
}
}

const getProblemById = async(req,res)=>
{
  const {id} = req.params;
  console.log("get problem by id is",id);

  try{
   if(!id)
      return res.status(400).send("Missing id field");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');
    console.log("getProblem is ",getProblem);

    if(!getProblem)
      return res.status(404).send("Problem is missing");

  const videos = await SolutionVideo.findOne({problemId:id});

    if(videos){   
    
   const responseData = {
    ...getProblem.toObject(),
    secureUrl:videos.secureUrl,
    thumbnailUrl : videos.thumbnailUrl,
    duration : videos.duration,
   } 
  
   return res.status(200).send(responseData);
   }
    
   res.status(200).send(getProblem);

  }
  catch(err)
  {
    res.status(500).send("Error:"+err);
  }
}

const getAllProblem = async(req,res)=>
{
 
  try{
  
    const getProblem = await Problem.find({}).select('_id title difficulty tags');

    if(!getProblem)
      return res.status(404).send("Problem is missing");

    return res.status(200).send(getProblem);

  }
  catch(err)
  {
    res.status(500).send("Error:"+err);
  }
}

const solvedAllProblemByUser =async(req,res)=>
{
  try{
    const userId = req.result._id;
    const user = await User.findById(userId).populate({
      path:"problemSolved",
      select:"_id title difficulty tags"
    });
    // const count = req.result.problemSolved.length;
    res.status(200).send(user.problemSolved);
  }
   catch(err)
  {
    res.status(500).send("Server Error");
  }
}

const submittedProblem = async(req,res)=>
{
  try{
   const userId = req.result._id;
   const problemId = req.params.pid;
   const ans = await Submission.find({userId,problemId});
   
   if(ans.length==0)
    res.status(200).send("no submission is present");

   res.status(200).send(ans);
  }
  catch(err)
  {
     res.status(500).send("Internal Server Error");
  }
}


module.exports={createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem};