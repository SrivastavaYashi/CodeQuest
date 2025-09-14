const Problem = require('../models/problem');
const Submission = require('../models/submission');
const {getLanguageById,submitBatch,submitToken} = require('../utils/ProblemUtility');


const submitCode =async(req,res)=>
{
  try
  {
    
     const userId = req.result._id;
     const problemId = req.params.id;

      

     const{code,language}=req.body;

     

     if(!userId||!problemId||!code||!language)
        return res.status(400).send("Some field is missing");

     const problem = await Problem.findById(problemId);

     

     //submitting in db 
     const submittedResult = await Submission.create(
        {
            userId,
            problemId,
            code,
            language,
            status:'pending',
            testCasesTotal:problem.hiddenTestCases.length
        }
     )
     console.log("submittedResult",submittedResult);
   
     //giving code to judge0
      const languageId = getLanguageById(language);
      console.log("languageId",languageId);

       const submissions = problem.hiddenTestCases.map((testcase)=>({
        source_code:code,
        language_id:languageId,
        stdin:testcase.input,
        expected_output:testcase.output
       }));

       const submitResult = await submitBatch(submissions);

       const resultToken = submitResult.map((value)=>(value.token));

       const testResult = await submitToken(resultToken);

       let testCasesPassed =0;
       let runtime=0;
       let memory=0;
       let status='accepted';
       let errorMessage = '';

       for(test of testResult)
       {
         if(test.status_id===3)
         {
            testCasesPassed++;
            runtime = runtime+parseFloat(test.time);
            memory = Math.max(memory,test.memory);
         }
         else{
            if(test.status_id===4)
            {
                status = 'error'
                errorMessage = test.stderr
            }
            else
            {
                status = 'wrong'
                errorMessage = test.stderr
            }
         }

       }

       //store the result in db in submission
       submittedResult.status = status;
       submittedResult.testCasesPassed = testCasesPassed;
       submittedResult.errorMessage = errorMessage;
       submittedResult.runtime = runtime;
       submittedResult.memory = memory;

       await submittedResult.save();

       if(!req.result.problemSolved.includes(problemId))
       {
         req.result.problemSolved.push(problemId);
         await req.result.save();
       }

       res.status(201).send(submittedResult);

  }
  catch(err)
  {
     console.error("Submit Error:", err.response ? err.response.data : err.message);
     res.status(500).send('Internal Server Error '+ err);
  }
}

const runCode = async(req,res)=>
{
   try
  {
    
     const userId = req.result._id;
     const problemId = req.params.id;
     console.log("userId")
     console.log(userId)
     console.log("problemId")
     console.log(problemId)
     const{code,language}=req.body;
     console.log("code")
     console.log(code)
     console.log("language")
     console.log(language)



     if(!userId||!problemId||!code||!language)
        return res.status(400).send("Some field is missing");

     const problem = await Problem.findById(problemId);
     console.log("problem")
     console.log(problem)
     


     //giving code to judge0
      const languageId = getLanguageById(language);
      console.log("languageId");
      console.log(languageId)

       const submissions = problem.visibleTestCases.map((testcase)=>({
        source_code:code,
        language_id:languageId,
        stdin:testcase.input,
        expected_output:testcase.output
       }));
       console.log("submissions")
       console.log(submissions)

       const submitResult = await submitBatch(submissions);
       console.log("submitResult")
       console.log(submitResult)

       const resultToken = submitResult.map((value)=>(value.token));
       console.log("resultToken")
     console.log(resultToken)

       const testResult = await submitToken(resultToken);
       console.log("testResult")
       console.log(testResult)

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = true;
        let errorMessage = null;

        for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = false
            errorMessage = test.stderr
          }
          else{
            status = false
            errorMessage = test.stderr
          }
        }
    }


   res.status(201).json({
    success:status,
    testCases: testResult,
    runtime,
    memory
   });

  }
  catch(err)
  {
     res.status(500).send('Internal Server Error '+ err);
  }
}


module.exports = {submitCode,runCode};
